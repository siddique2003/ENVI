import json
import uuid
import pandas as pd
import numpy as np
import re
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import StagingData
from .stats import run_stats_module
from .stats import run_hypothesis_tests
from .utils import clean_column_name
from pandas.api.types import is_numeric_dtype, is_string_dtype, is_datetime64_any_dtype
import datetime

def convert_numpy_type(value):
    if isinstance(value, (np.int_, np.integer)):
        return int(value)
    if isinstance(value, (np.float64, np.floating)):
        return float(value)
    if pd.isna(value):
        return None
    return value

@api_view(['POST'])
def upload_csv(request):
    try:
        file = request.FILES['file']
        file_name = file.name
        file_ext = os.path.splitext(file_name)[1].lower()

        if file_ext == '.csv':
            try:
                df = pd.read_csv(file)
            except UnicodeDecodeError:
                file.seek(0)
                df = pd.read_csv(file, encoding='latin1')
            except pd.errors.ParserError as e:
                return Response({'error': f"Error parsing CSV: {str(e)}"}, status=400)

        elif file_ext in ['.xlsx', '.xls']:
            try:
                df = pd.read_excel(file, engine='openpyxl' if file_ext == '.xlsx' else None)
            except Exception as e:
                return Response({'error': f"Error reading Excel file: {str(e)}"}, status=400)
        else:
            return Response({'error': 'Unsupported file type. Please upload a CSV or XLSX file.'}, status=400)

        # --- Start Refined Date Handling and Type Inference ---

        # Initial cleaning
        df = df.loc[:, ~df.columns.str.contains('^Unnamed')] # Remove unnamed columns first
        original_cols = df.columns.tolist() # Keep track of original column names for data insertion

        # Clean column names for SQL compatibility and uniqueness
        raw_cols_map = {orig: clean_column_name(orig) for orig in original_cols}
        seen = {}
        final_columns = []
        final_columns_map = {} # Map original name to final unique name
        for orig_col in original_cols:
            base = raw_cols_map[orig_col]
            count = seen.get(base, 0) + 1
            seen[base] = count
            unique_name = f"{base}_{count}" if count > 1 else base
            final_columns.append(unique_name)
            final_columns_map[orig_col] = unique_name
        
        df.columns = final_columns # Rename DF columns for easier processing

        # Attempt to convert potential date columns *before* final type checking
        # This helps standardize dates read from both CSV (as strings) and Excel (potentially as datetime objects)
        potential_date_cols = [col for col in df.columns if 'date' in col.lower() or df[col].dtype == 'object']
        for col in potential_date_cols:
             if df[col].isnull().all(): # Skip if all null
                 continue
             try:
                 # Try converting to datetime, coercing errors to NaT
                 converted_col = pd.to_datetime(df[col], errors='coerce')
                 # If *most* values are not NaT, assume it's a date column
                 if converted_col.notna().mean() > 0.7: # Threshold: >70% successfully parsed
                     df[col] = converted_col
             except Exception: 
                 # If conversion fails spectacularly, leave it as is
                 pass

        # Convert remaining NaNs/NaTs (including those from failed date parsing) to None
        df = df.where(pd.notnull(df), None)

        # Now determine column types based on the cleaned data
        column_info_list = []
        for col in df.columns:
            col_type = 'unknown'
            dtype = df[col].dtype
            # Check for explicitly converted datetime columns first
            if pd.api.types.is_datetime64_any_dtype(dtype):
                 col_type = 'datetime'
            elif pd.api.types.is_numeric_dtype(dtype):
                 # Further check if it's genuinely numeric or just looks like it
                 try:
                     pd.to_numeric(df[col].dropna(), errors='raise')
                     col_type = 'numerical'
                 except (ValueError, TypeError):
                      # If conversion fails after dropping Nones, treat as categorical
                     col_type = 'categorical'
            else: # Defaults to categorical (includes strings, objects, mixed types)
                col_type = 'categorical'

            column_info_list.append({'name': col, 'type': col_type})

        # --- End Refined Date Handling and Type Inference ---

        table_name = f"csv_{uuid.uuid4().hex[:8]}"
        with connection.cursor() as cursor:
            defs = []
            # Use the final determined types for table creation
            for col_info in column_info_list:
                sql_dtype = 'TEXT' # Default to TEXT
                if col_info['type'] == 'numerical':
                    # Check if column contains only integers after dropping None
                    # If yes, use INTEGER, otherwise FLOAT
                    is_integer = pd.api.types.is_integer_dtype(df[col_info['name']].dropna())
                    # Alternative check if it was read as float but has no decimal part
                    if not is_integer and pd.api.types.is_float_dtype(df[col_info['name']].dropna()):
                         if (df[col_info['name']].dropna() % 1 == 0).all():
                             is_integer = True
                    
                    sql_dtype = 'INTEGER' if is_integer else 'FLOAT'
                elif col_info['type'] == 'datetime':
                    sql_dtype = 'TIMESTAMP' # Use TIMESTAMP for dates/datetimes
                defs.append(f'"{col_info["name"]}" {sql_dtype}')
            
            # Debug print for schema
            print(f"Creating table '{table_name}' with schema: {', '.join(defs)}")

            cursor.execute(f'CREATE TABLE "{table_name}" ({", ".join(defs)});')

            # Prepare for insertion - use the final column names
            col_list = ', '.join(f'"{c}"' for c in final_columns)
            placeholders = ', '.join(['%s'] * len(final_columns))
            insert_sql = f'INSERT INTO "{table_name}" ({col_list}) VALUES ({placeholders})'

            # Iterate through original DataFrame structure but use final_columns for access
            df_insert = df # We already modified df inplace with dates and Nones

            for index, row in df_insert.iterrows():
                try:
                    # Fetch values based on the final column names in order
                    row_values = [convert_numpy_type(row[final_col]) for final_col in final_columns]
                    # For datetime columns identified, ensure they are either None or datetime objects
                    # psycopg2 can handle Python datetime objects directly for TIMESTAMP columns
                    processed_row_values = []
                    for i, val in enumerate(row_values):
                         col_name = final_columns[i]
                         col_type = next((c['type'] for c in column_info_list if c['name'] == col_name), 'unknown')
                         if col_type == 'datetime' and pd.notna(val) and not isinstance(val, (datetime.datetime, datetime.date)):
                              # If it's somehow not a datetime object yet, try one last conversion
                              try:
                                   processed_row_values.append(pd.to_datetime(val))
                              except:
                                   processed_row_values.append(None) # Give up if final conversion fails
                         else:
                              processed_row_values.append(val)

                    cursor.execute(insert_sql, processed_row_values)
                except Exception as insert_err:
                    # Provide more context in the error message
                    print(f"Skipping row {index} due to insertion error: {insert_err}. Row data (first 5 values): {processed_row_values[:5]}")
                    continue

        # Use the correct staging source type based on file extension
        source_type = 'EXCEL' if file_ext in ['.xlsx', '.xls'] else 'CSV'
        StagingData.objects.create(table_name=table_name, source_type=source_type)

        # Prepare preview data using final columns but mapping back to original for frontend if needed?
        # For now, send preview with cleaned names. Frontend might need adjustment if it expects original names.
        preview_df = df.head(20)
        # Convert datetime objects in preview to ISO format strings for JSON serialization
        for col_info in column_info_list:
             if col_info['type'] == 'datetime' and col_info['name'] in preview_df.columns:
                  preview_df[col_info['name']] = preview_df[col_info['name']].dt.strftime('%Y-%m-%d %H:%M:%S').fillna('')

        return Response({
            'message': 'Uploaded',
            'table_name': table_name,
            'cleaned_columns': final_columns, # Send the cleaned names used in DB
            'column_types': column_info_list, # Send types corresponding to cleaned names
            'preview': preview_df.to_dict(orient='records') # Preview uses cleaned names
        })
    except Exception as e:
        import traceback
        print(f"Error during upload: {str(e)}")
        print(traceback.format_exc())
        return Response({'error': f'An error occurred: {str(e)}'}, status=500)


@api_view(['GET'])
def preview_data(request):
    latest = StagingData.objects.latest('created_at')
    with connection.cursor() as cursor:
        cursor.execute(f'SELECT * FROM "{latest.table_name}" LIMIT 20')
        rows = cursor.fetchall()
        cols = [col[0] for col in cursor.description]
    df = pd.DataFrame(rows, columns=cols)
    return Response({'data': df.to_dict(orient='records')})


@api_view(["POST"])
def generate_charts(request):
    try:
        primary_field = request.data.get("primary_field")
        secondary_field = request.data.get("secondary_field")

        print("✅ Received for stats: primary=", primary_field, "secondary=", secondary_field)

        if not primary_field or not secondary_field:
            return Response({"error": "Both primary_field and secondary_field are required"}, status=400)

        results = run_stats_module(primary_field, secondary_field)
        return Response(results, status=200)

    except Exception as e:
        print("❌ Chart generation error:", str(e))
        return Response({"error": str(e)}, status=500)




@api_view(["POST"])
def test_hypotheses(request):
    try:
        body = json.loads(request.body)
        field1 = body.get("field1")
        field2 = body.get("field2")

        if not field1 or not field2:
            return JsonResponse({"error": "Missing fields"}, status=400)

        result = run_hypothesis_tests(field1, field2)
        return JsonResponse(result, safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)



@api_view(["GET"])
def recommend_fields(request):
    try:
        latest = StagingData.objects.latest("created_at")
        table_name = latest.table_name

        # Fetch data
        with connection.cursor() as cursor:
            cursor.execute(f'SELECT * FROM "{table_name}" LIMIT 500')  # limit for speed
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]

        df = pd.DataFrame(rows, columns=columns)

        # Recommendations
        recommendations = {
            "high_variance": [],
            "frequent_categories": {},
            "correlated_with_others": [],
        }

        numeric_cols = df.select_dtypes(include='number').columns.tolist()

        # High variance
        for col in numeric_cols:
            if df[col].std() > 0:
                recommendations["high_variance"].append((col, round(df[col].std(), 2)))

        # Text frequency
        cat_cols = df.select_dtypes(include='object').columns.tolist()
        for col in cat_cols:
            top_vals = df[col].value_counts().head(3).to_dict()
            if len(top_vals) > 0:
                recommendations["frequent_categories"][col] = top_vals

        # Correlations
        corr_matrix = df[numeric_cols].corr()
        corr_scores = []
        for i in range(len(numeric_cols)):
            for j in range(i + 1, len(numeric_cols)):
                corr = abs(corr_matrix.iloc[i, j])
                if corr > 0.6:
                    corr_scores.append((numeric_cols[i], numeric_cols[j], round(corr, 2)))
        recommendations["correlated_with_others"] = corr_scores

        return Response(recommendations)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
