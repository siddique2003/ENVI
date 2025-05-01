import json
import uuid
import pandas as pd
import numpy as np
import re
import os
import math
from scipy.stats import f_oneway
from ingestion.models import StagingData  
from django.db import connection
from ingestion.models import StagingData
from scipy.stats import ttest_ind, chi2_contingency, pearsonr, f_oneway
from pandas.api.types import is_numeric_dtype, is_datetime64_any_dtype, is_categorical_dtype, is_object_dtype
from .utils import clean_column_name

# Attempt to import statsmodels, but don't fail if it's not installed yet
try:
    import statsmodels.api as sm
    from statsmodels.tools.sm_exceptions import PerfectSeparationError
    STATSMODELS_AVAILABLE = True
except ImportError:
    STATSMODELS_AVAILABLE = False
    PerfectSeparationError = None # Define for except block later
    sm = None # Define for checks later


def create_dataframe(selected_fields=None):
    latest = StagingData.objects.latest("created_at")

    if latest.table_name:
        with connection.cursor() as cursor:
            # Fetch actual column names (cleaned during upload)
            cursor.execute(f'SELECT * FROM "{latest.table_name}" LIMIT 1')
            raw_columns = [col[0] for col in cursor.description] # e.g., ['year', 'deposits_usd']
            # Map lowercased *cleaned* name to actual cleaned name (they should be the same after clean_column_name)
            column_map = {col.lower(): col for col in raw_columns} # e.g., {'year': 'year', 'deposits_usd': 'deposits_usd'}

            if selected_fields:
                # selected_fields should already be cleaned by the caller
                safe_fields = []
                for f in selected_fields:
                    # Lookup the already cleaned name (which should be lowercase)
                    actual = column_map.get(f) # No .lower() needed here
                    if not actual:
                        # Provide more context in the error
                        raise ValueError(f"Cleaned field '{f}' not found in DB columns: {list(column_map.keys())}")
                    safe_fields.append(f'"{actual}"') # Quote the actual DB column name
                sql_fields = ", ".join(safe_fields)
                query = f'SELECT {sql_fields} FROM "{latest.table_name}"'
            else:
                query = f'SELECT * FROM "{latest.table_name}"'
            print("Running SQL Query:", query) # Debugging print

            cursor.execute(query)
            rows = cursor.fetchall()
            # Use the actual cleaned column names fetched, but lowercased for consistency
            columns = [col.lower() for col in raw_columns if not selected_fields or col in [c.strip('"') for c in safe_fields]]

        # Ensure columns match fetched data if fields were selected
        if selected_fields and len(columns) != len(selected_fields):
             print(f"Warning: Column mismatch. Expected {len(selected_fields)} based on {selected_fields}, got {len(columns)}: {columns}")
             # Attempt to use description if lengths mismatch severely
             if abs(len(columns) - len(cursor.description)) < abs(len(columns) - len(selected_fields)):
                 columns = [col[0].lower() for col in cursor.description]


        df = pd.DataFrame(rows, columns=columns)
        # Final check and renaming if mismatch occurred
        if selected_fields and set(df.columns) != set(selected_fields):
             print(f"Warning: DataFrame columns {list(df.columns)} do not match selected fields {selected_fields}. Attempting rename.")
             if len(df.columns) == len(selected_fields):
                 df.columns = selected_fields # Assume order is correct if length matches
             else:
                 print("Error: Cannot reliably rename columns due to length mismatch.")


        return df

    # Fallback: JSON
    raw = latest.raw_data
    if isinstance(raw, dict):
        raw = raw.get("data", raw)
    if isinstance(raw, dict):
        raw = [raw]
    df = pd.DataFrame(raw)
    df.columns = [col.lower() for col in df.columns]
    return df





# ✅ Prepare data for line chart (for frontend)
def plot_line_chart(df, field1, field2):
    try:
        return {
            "x": df[field2].astype(str).tolist(),
            "y": pd.to_numeric(df[field1], errors="coerce").fillna(0).tolist(),
            "title": f"Line Chart: {field1} vs {field2}",
            "type": "line",
            "xKey": field2,
            "yKey": field1
        }
    except Exception as e:
        print(f"Line chart error for {field1} vs {field2}:", e)
        return {
            "x": [],
            "y": [],
            "title": f"Line Chart Failed for {field1} vs {field2}",
            "type": "line",
            "xKey": field2,
            "yKey": field1
        }



# ✅ Prepare data for bar/column chart (for frontend)
def plot_column_chart(df, field1, field2):
    try:
        return {
            "x": df[field2].tolist(),
            "y": df[field1].tolist(),
            "title": f"Column Chart: {field1} vs {field2}",
            "type": "bar",
            "xKey": field2,
            "yKey": field1
        }
    except Exception as e:
        print(f"Column chart error for {field1} vs {field2}:", e)
        return {
            "x": [],
            "y": [],
            "title": f"Column Chart Failed for {field1} vs {field2}",
            "type": "bar",
            "xKey": field2,
            "yKey": field1
        }

def plot_scatter_chart(df, field1, field2):
    return {
        "x": df[field2].tolist(),
        "y": df[field1].tolist(),
        "title": f"Scatter Plot: {field1} vs {field2}",
        "type": "scatter",
        "xKey": field2,
        "yKey": field1
    }

# ✅ Format outlier data for frontend
def plot_outlier_table(field1, outliers):
    return outliers.to_dict(orient='records')

# ✅ Correlation test to find best correlated numerical field
def correlation_test(df, field1, field2):
    columns_to_correlate = [
        col for col in df.columns if col != df.columns[0] and col != field1 and col != field2
    ]

    numerical_columns = df[columns_to_correlate].select_dtypes(include=['number']).columns

    target_cor = 0
    target_col = None

    for col in numerical_columns:
        try:
            correlation = df[field1].corr(df[col])
            if correlation > target_cor:
                target_cor = correlation
                target_col = col
        except Exception as e:
            print(f"Skipping {col}: {e}")
            continue

    print("DEBUG: Best correlation found with:", target_col)
    return target_col  # Can be None



# ✅ ANOVA test to find best correlated categorical field
def anova_test(df, field1, field2, field3):
    columns_to_correlate = [col for col in df.columns if col not in [df.columns[0], field1, field2, field3]]
    categorical_columns = df[columns_to_correlate].select_dtypes(include=['object', 'category']).columns

    target_cor = 1
    target_col = None
    warning = None

    for col in categorical_columns:
        if col == field1:
            continue

        groups = [df[field1][df[col] == category] for category in df[col].unique()]
        try:
            f_statistic, p_value = f_oneway(*groups)
        except:
            continue

        if p_value < target_cor:
            target_cor = p_value
            target_col = col

    if target_cor > 0.05:
        warning = f"{target_col or 'None'} and {field1} have the best relationship, but correlation is low."
    else:
        warning = ""

    return (target_col if target_col else field2, warning)

# ✅ IQR-based outlier detection
def detect_outliers(df, field1):
    Q1 = df[field1].quantile(0.25)
    Q3 = df[field1].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    outliers = df[(df[field1] < lower_bound) | (df[field1] > upper_bound)]
    return outliers


def select_best_chart(df, field1, field2):
    if is_numeric_dtype(df[field1]) and is_numeric_dtype(df[field2]):
        return plot_scatter_chart(df, field1, field2)

    elif is_numeric_dtype(df[field1]) and not is_numeric_dtype(df[field2]):
        return plot_column_chart(df, field1, field2)

    elif is_numeric_dtype(df[field1]) and is_datetime64_any_dtype(df[field2]):
        return plot_line_chart(df, field1, field2)

    elif is_numeric_dtype(df[field2]) and not is_numeric_dtype(df[field1]):
        return plot_column_chart(df, field2, field1)

    return None  # fallback handled in main function


# ✅ Main callable function for backend view
def run_stats_module(field1, field2):
    # Apply the same cleaning logic used during table creation
    field1_clean = clean_column_name(field1.replace('\\n', ' ').strip())
    field2_clean = clean_column_name(field2.replace('\\n', ' ').strip())

    # Fetch all data initially
    df = create_dataframe() # Gets all columns, already cleaned and lowercased

    if df.empty:
        return {"error": "No data available to analyze."}

    # Attempt to convert year-like columns to datetime for type checking
    for col in df.columns:
        # Simple check for columns named 'year' or ending in '_year'
        if col == 'year' or col.endswith('_year'):
            if pd.api.types.is_numeric_dtype(df[col]):
                try:
                    # Attempt conversion, coerce errors to NaT
                    df[col] = pd.to_datetime(df[col], format='%Y', errors='coerce')
                    print(f"Successfully converted column '{col}' to datetime.")
                except Exception as e:
                    print(f"Could not convert column '{col}' to datetime: {e}")
            elif pd.api.types.is_object_dtype(df[col]): # Also try converting string/object years
                 try:
                     df[col] = pd.to_datetime(df[col], errors='coerce') # Let pandas infer format
                     print(f"Successfully converted object column '{col}' to datetime.")
                 except Exception as e:
                     print(f"Could not convert object column '{col}' to datetime: {e}")


    # Ensure the cleaned field names exist in the DataFrame columns
    if field1_clean not in df.columns:
         return {"error": f"Field '{field1}' (cleaned to '{field1_clean}') not found in available columns: {list(df.columns)}"}
    if field2_clean not in df.columns:
         return {"error": f"Field '{field2}' (cleaned to '{field2_clean}') not found in available columns: {list(df.columns)}"}

    # Identify the numerical 'fact' field from the selection
    fact_field = None
    is_num1 = pd.api.types.is_numeric_dtype(df[field1_clean])
    is_num2 = pd.api.types.is_numeric_dtype(df[field2_clean])

    if is_num1:
        fact_field = field1_clean
    elif is_num2:
        fact_field = field2_clean
    else:
        # If neither selected field is numeric, maybe pick the first numeric? Or return error?
        # For now, let's try to pick the first numeric field found in the df as a fallback fact.
        numeric_cols = df.select_dtypes(include=['number']).columns
        if len(numeric_cols) > 0:
             fact_field = numeric_cols[0]
             print(f"Warning: Neither selected field was numeric. Using first numeric column '{fact_field}' as fact field.")
        else:
             return {"error": "Could not identify a numerical field to focus on. Please select at least one numerical field."}

    # --- Generate ALL potential charts with scores ---
    all_charts = []
    used_pairs = set()

    for col1 in df.columns:
        for col2 in df.columns:
            if col1 == col2 or (col1, col2) in used_pairs or (col2, col1) in used_pairs:
                continue
            # Mark pair as used (using canonical order)
            pair_key = tuple(sorted((col1, col2)))
            if pair_key in used_pairs:
                continue
            used_pairs.add(pair_key)

            try:
                # Determine actual types for this pair
                is_num1_pair = pd.api.types.is_numeric_dtype(df[col1])
                is_num2_pair = pd.api.types.is_numeric_dtype(df[col2])
                is_dt1 = pd.api.types.is_datetime64_any_dtype(df[col1])
                is_dt2 = pd.api.types.is_datetime64_any_dtype(df[col2])
                is_cat1 = not is_num1_pair and not is_dt1 # Treat object/string as categorical
                is_cat2 = not is_num2_pair and not is_dt2

                chart_data = None
                score = 0
                chart_type = "scatter" # Default, gets overridden

                # Pearson (Num vs Num)
                if is_num1_pair and is_num2_pair:
                    # Drop NaNs for correlation calculation
                    df_pair = df[[col1, col2]].dropna()
                    if len(df_pair) >= 2: # Need at least 2 pairs for correlation
                        corr, p = pearsonr(df_pair[col1], df_pair[col2])
                        if p < 0.05:
                            score = abs(corr)
                            chart_type = "scatter"
                            chart_data = {
                                "title": f"{col1} vs {col2}",
                                "x": df[col1].tolist(), # Use original full data for plot
                                "y": df[col2].tolist(),
                                "type": chart_type,
                                "xKey": col1,
                                "yKey": col2
                            }

                # T-test (Num vs Binary Cat) or ANOVA (Num vs Multi Cat)
                elif (is_num1_pair and is_cat2) or (is_cat1 and is_num2_pair):
                    num_col = col1 if is_num1_pair else col2
                    cat_col = col2 if is_num1_pair else col1

                    if df[cat_col].nunique() >= 2: # Ensure at least 2 categories
                        # Drop rows where num_col is NaN for grouping
                        df_filtered = df[[num_col, cat_col]].dropna(subset=[num_col])
                        groups = [df_filtered[num_col][df_filtered[cat_col] == cat] for cat in df_filtered[cat_col].unique()]
                        groups = [g for g in groups if len(g) >= 1] # Need at least 1 value per group

                        if len(groups) >= 2: # Need at least 2 groups for comparison
                             stat = None
                             p = 1.0
                             test_type = ""
                             can_test = True

                             try:
                                 if len(groups) == 2:
                                     test_type = "T-test"
                                     # Check variance before t-test
                                     if any(g.var() == 0 for g in groups if len(g) > 1):
                                         print(f"Warning: Skipping T-test for {num_col} by {cat_col} due to zero variance in a group.")
                                         can_test = False
                                     else:
                                        stat, p = ttest_ind(*groups, nan_policy='omit', equal_var=False) # Welch's t-test
                                 else: # >= 3 groups -> ANOVA
                                     test_type = "ANOVA"
                                     # f_oneway needs >1 value in at least one group
                                     anova_groups = [g for g in groups if len(g) > 1]
                                     if len(anova_groups) >= 2 :
                                         stat, p = f_oneway(*anova_groups)
                                     else:
                                         print(f"Skipping ANOVA for {num_col} by {cat_col}, not enough groups with size > 1.")
                                         p = 1.0 # Ensure it's not significant
                                         can_test = False

                                 if can_test and p < 0.05 and stat is not None:
                                     score = abs(stat) # Use abs of t-stat or F-stat as score
                                     chart_type = "bar"
                                     # Group means for bar chart data
                                     df_grouped = df_filtered.groupby(cat_col)[num_col].mean().reset_index()
                                     chart_data = {
                                         "title": f"{num_col} by {cat_col} ({test_type})",
                                         "x": df_grouped[cat_col].tolist(),
                                         "y": df_grouped[num_col].tolist(),
                                         "type": chart_type,
                                         "xKey": cat_col,
                                         "yKey": num_col
                                     }
                             except Exception as group_test_e:
                                 print(f"Skipping {test_type} for {num_col} by {cat_col} due to error: {group_test_e}")

                # Line Chart (Num vs Datetime)
                elif (is_num1_pair and is_dt2) or (is_dt1 and is_num2_pair):
                     num_col = col1 if is_num1_pair else col2
                     dt_col = col2 if is_num1_pair else col1
                     # Sort by date
                     df_sorted = df[[dt_col, num_col]].dropna().sort_values(by=dt_col)
                     if len(df_sorted) > 1:
                         score = 0.1 # Give line charts a baseline score
                         chart_type = "line"
                         chart_data = {
                             "title": f"{num_col} over {dt_col}",
                             "x": df_sorted[dt_col].astype(str).tolist(), # Convert datetime to string for JSON
                             "y": pd.to_numeric(df_sorted[num_col], errors='coerce').fillna(0).tolist(),
                             "type": chart_type,
                             "xKey": dt_col,
                             "yKey": num_col
                         }

                # Chi-Square (Cat vs Cat)
                elif is_cat1 and is_cat2:
                    try:
                        df_pair = df[[col1, col2]].dropna()
                        if df_pair.shape[0] > 1:
                            contingency = pd.crosstab(df_pair[col1], df_pair[col2])
                            if contingency.shape[0] >= 2 and contingency.shape[1] >= 2:
                                chi2, p, _, _ = chi2_contingency(contingency)
                                if p < 0.05:
                                    score = abs(chi2) # Use chi2 as score
                                    chart_type = "pie" # Pie shows distribution of col1
                                    primary_cat = contingency.sum(axis=1)
                                    chart_data = {
                                        "title": f"Distribution by {col1} (related to {col2})",
                                        "x": primary_cat.index.astype(str).tolist(),
                                        "y": primary_cat.values.tolist(),
                                        "type": chart_type,
                                        "xKey": col1,
                                        "yKey": None # Pie doesn't use yKey in frontend
                                    }
                    except Exception as chi_e:
                         print(f"Skipping Chi-square for {col1} vs {col2} due to error: {chi_e}")

                # Adding detailed logging to understand chart selection
                print(f"Evaluating chart pair: {col1} vs {col2}")
                print(f"Data types - {col1}: {'Numeric' if is_num1_pair else 'Categorical'}, {col2}: {'Numeric' if is_num2_pair else 'Categorical'}")
                if chart_data:
                    print(f"Generated chart type: {chart_type} with score: {score}")
                else:
                    print(f"No chart generated for pair: {col1} vs {col2}")

                # Add to list if a chart was generated
                if chart_data:
                    all_charts.append({
                        "score": score,
                        "data": chart_data
                    })

            except Exception as e:
                print(f"Skipped pair ({col1}, {col2}) due to error: {e}")

    # --- Chart Selection Logic with Diversity ---
    charts = {}
    relevant_charts = []

    # Filter charts that involve the fact_field
    if fact_field:
        for chart_info in all_charts:
            chart_data = chart_info['data']
            x_key = chart_data.get('xKey')
            y_key = chart_data.get('yKey')
            chart_type = chart_data.get('type')

            # Check if fact_field is directly involved
            if y_key == fact_field or x_key == fact_field:
                is_datetime_pair = False
                # Check if this involves a datetime column
                if x_key and y_key: # Ensure keys exist
                    is_dt1 = pd.api.types.is_datetime64_any_dtype(df[x_key])
                    is_dt2 = pd.api.types.is_datetime64_any_dtype(df[y_key])
                    is_datetime_pair = is_dt1 or is_dt2

                # Boost score if fact_field is the measure (typically yKey)
                if y_key == fact_field:
                    chart_info['score'] *= 1.5 
                elif x_key == fact_field: # Less boost if fact is on x-axis
                    chart_info['score'] *= 1.1 
                
                # --- Refined Variety Boost --- 
                # Strong boost for potentially relevant line charts (Num vs Time)
                if chart_type == 'line' and is_datetime_pair:
                    chart_info['score'] *= 6.0 # Further increase boost for time series
                # Moderate boost for other non-scatter types
                elif chart_type == 'bar':
                    chart_info['score'] *= 4.0 # Further increase boost for bar charts
                elif chart_type == 'pie':
                    chart_info['score'] *= 3.5 # Further increase boost for pie charts
                # Retain scatter boost as is
                elif chart_type == 'scatter':
                    chart_info['score'] *= 1.0 # No additional boost for scatter
                # --- End Refined Variety Boost ---

                relevant_charts.append(chart_info)
        print(f"Found {len(relevant_charts)} charts relevant to fact field '{fact_field}'")
    else:
        # If no fact field, maybe just use all charts? Or return error?
        # For now, use all charts if no specific fact field identified (e.g., only categorical selected)
        relevant_charts = all_charts
        print(f"Warning: No specific numerical fact_field. Considering all {len(relevant_charts)} generated charts.")


    # Sort relevant charts by score (descending)
    relevant_charts.sort(key=lambda x: x["score"], reverse=True)

    # --- Assign charts ensuring diversity ---
    final_charts = {}
    chart_type_counts = {} # Keep track of counts for each chart type used
    used_chart_indices = set() # Keep track of indices from relevant_charts already assigned
    MAX_CHART_TYPE_COUNT = 2 # Limit each chart type to appear no more than twice

    chart_slots = ["best_chart"] + [f"related_{i+1}" for i in range(5)]

    for slot in chart_slots:
        chart_assigned_to_slot = False
        # Iterate through ALL available relevant charts (sorted by score) for EACH slot
        for idx, chart_info in enumerate(relevant_charts):
            # Skip if this chart was already assigned to a previous slot
            if idx in used_chart_indices:
                continue

            # Check if this chart's type is allowed for this slot
            chart_data = chart_info['data']
            current_type = chart_data['type']
            current_count = chart_type_counts.get(current_type, 0)

            if current_count < MAX_CHART_TYPE_COUNT:
                # Assign the chart to the current slot
                final_charts[slot] = chart_data
                chart_type_counts[current_type] = current_count + 1
                used_chart_indices.add(idx) # Mark this chart as used globally
                chart_assigned_to_slot = True
                print(f"Assigned {current_type} chart (index {idx}, score {chart_info['score']:.2f}) to slot {slot}. Count: {chart_type_counts[current_type]}")
                break # Found a chart for this slot, move to the next slot
            # else: # Type limit reached, continue searching the relevant_charts list for the *current* slot
                # print(f"Skipping {current_type} chart (index {idx}, score {chart_info['score']:.2f}) for slot {slot} - Limit reached.")
                pass # Continue inner loop to check the next chart for the same slot

        # If the inner loop finished without assigning a chart for this slot
        if not chart_assigned_to_slot:
            print(f"Could not find a suitable chart for slot '{slot}' after checking all candidates.")

    # --- Outliers and Warnings ---
    warning = ""
    if not final_charts:
        warning = f"No statistically significant relationships found involving '{fact_field}'. Explore manually." if fact_field else "No charts could be generated." 
        print(f"Warning: {warning}")

    outliers = pd.DataFrame() # Initialize empty
    if fact_field and fact_field in df.columns and pd.api.types.is_numeric_dtype(df[fact_field]):
         try:
             outliers = detect_outliers(df, fact_field)
         except Exception as outlier_e:
             print(f"Error detecting outliers for {fact_field}: {outlier_e}")
    else:
        print(f"Skipping outlier detection: fact_field '{fact_field}' not suitable.")


    print("--- Final Stats Module Result ---")
    print("Charts keys:", list(final_charts.keys()))
    print("Outliers count:", len(outliers))
    print("Warning:", warning)
    print("Original data records count:", len(df))
    print("Original data keys:", list(df.columns))
    print("---------------------------------")

    # Replace invalid float values before returning JSON
    cleaned_charts = replace_invalid_floats(final_charts)
    cleaned_outliers = replace_invalid_floats(outliers.to_dict(orient='records'))

    return {
        "charts": cleaned_charts,
        "outliers": cleaned_outliers,
        "warning": warning,
        "original_data": replace_invalid_floats(df.to_dict(orient='records')) # Include original data
    }


def replace_invalid_floats(obj):
    """Recursively replace NaN, Infinity, -Infinity with None in dicts/lists."""
    if isinstance(obj, dict):
        return {k: replace_invalid_floats(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [replace_invalid_floats(elem) for elem in obj]
    elif isinstance(obj, float) and not math.isfinite(obj):
        return None
    return obj


def run_hypothesis_tests(field1, field2):
    # Clean input fields using the exact same logic as upload
    field1_clean = clean_column_name(field1.replace('\n', ' ').strip())
    field2_clean = clean_column_name(field2.replace('\n', ' ').strip())

    selected_fields = [field1_clean, field2_clean] # Pass cleaned names
    try:
        # create_dataframe expects cleaned, lowercase names now
        df = create_dataframe(selected_fields=selected_fields)
    except ValueError as e:
        return {"error": str(e)} # Error from create_dataframe if lookup fails

    # Check if columns exist in the *returned* DataFrame (which should have cleaned, lowercase names)
    if df.empty or field1_clean not in df.columns or field2_clean not in df.columns:
         # Check if the error wasn't already caught by create_dataframe's ValueError
         existing_cols = list(df.columns) if not df.empty else "[]"
         return {"error": f"Cleaned fields '{field1_clean}' or '{field2_clean}' not found in DataFrame columns: {existing_cols}. Check selection."}


    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].astype("category")

    if df[field1_clean].nunique() < 2 or df[field2_clean].nunique() < 2:
        return {"error": "x and y must have length at least 2."}

    result = {
        "field1": field1_clean, # Report back the cleaned names used
        "field2": field2_clean,
        "tests": []
    }

    is_numeric_1 = pd.api.types.is_numeric_dtype(df[field1_clean])
    is_numeric_2 = pd.api.types.is_numeric_dtype(df[field2_clean])

    try:
        # Pearson Correlation
        if is_numeric_1 and is_numeric_2:
            corr, p = pearsonr(df[field1_clean], df[field2_clean])
            interpretation = "Significant" if p < 0.05 else "Not significant"
            insight = (
                f"The Pearson correlation between {field1_clean} and {field2_clean} is {corr:.2f}. "
                + ("This suggests a strong linear relationship." if p < 0.05 else
                   "There appears to be no significant linear relationship.") # Simplified insight
            )
            result["tests"].append({
                "test": "Pearson Correlation",
                "statistic": corr,
                "p_value": p,
                "interpretation": interpretation,
                "insight": insight
            })

        # Logistic Regression (Numeric Independent vs Categorical Dependent) OR ANOVA
        elif is_numeric_1 and not is_numeric_2:
            if not STATSMODELS_AVAILABLE:
                 result["tests"].append({
                    "test": "Logistic Regression / ANOVA",
                    "error": "statsmodels library not installed. Cannot perform Logistic Regression. ANOVA may be applicable."
                 })
                 # Optionally, run ANOVA here as a fallback if scipy is available?
                 # For now, just report the missing dependency.
            else:
                try:
                    y = df[field2_clean]
                    X = df[field1_clean]

                    # Ensure y is categorical and encode it
                    if not is_categorical_dtype(y) and not is_object_dtype(y):
                       y = y.astype('category')

                    y_encoded, categories = pd.factorize(y)
                    num_categories = len(categories)

                    X_with_const = sm.add_constant(X) # Add intercept

                    if num_categories == 2:
                        model = sm.Logit(y_encoded, X_with_const)
                        model_fit = model.fit(disp=0) # disp=0 suppresses convergence messages
                        p_value = model_fit.pvalues[field1_clean] # p-value for the independent variable
                        pseudo_r2 = model_fit.prsquared
                        interpretation = "Significant predictor" if p_value < 0.05 else "Not a significant predictor"
                        insight = (
                            f"Logistic Regression tested if {field1_clean} significantly predicts the binary category of {field2_clean}. "
                            f"P-value: {p_value:.3f}. Pseudo R-squared: {pseudo_r2:.3f}. "
                            + (f"{field1_clean} is a significant predictor." if p_value < 0.05 else
                               f"{field1_clean} does not significantly predict the category.")
                        )
                        result["tests"].append({
                            "test": "Logistic Regression (Binary)",
                            "statistic": f"Pseudo R2: {pseudo_r2:.3f}",
                            "p_value": p_value,
                            "interpretation": interpretation,
                            "insight": insight
                        })

                    elif num_categories > 2:
                        # Note about multinomial complexity
                        result["tests"].append({
                             "test": "Logistic Regression (Multinomial)",
                             "interpretation": "Multinomial case (>2 categories)",
                             "insight": f"Predicting {field2_clean} (with {num_categories} categories) using {field1_clean} involves Multinomial Logistic Regression, which is complex. ANOVA is provided below to compare means.",
                             "statistic": None,
                             "p_value": None
                        })
                        # Also perform ANOVA: Compare mean of numeric field1 across categories of field2
                        groups_for_anova = [df[field1_clean][df[field2_clean] == cat] for cat in df[field2_clean].unique()]
                        fstat, p = f_oneway(*groups_for_anova)
                        interpretation_anova = "Significant difference" if p < 0.05 else "No significant difference"
                        insight_anova = (
                            f"ANOVA tests if the mean of the numeric {field1_clean} differs across the categories of {field2_clean}. "
                            + ("A significant difference was found." if p < 0.05 else
                               "No significant difference detected.")
                        )
                        result["tests"].append({
                            "test": "ANOVA (for reference)",
                            "statistic": fstat,
                            "p_value": p,
                            "interpretation": interpretation_anova,
                            "insight": insight_anova
                        })

                    else: # Only 1 category?
                         result["tests"].append({
                            "test": "Logistic Regression",
                            "error": f"Field {field2_clean} has only one category, cannot perform regression/ANOVA."
                         })

                except PerfectSeparationError:
                     result["tests"].append({
                        "test": "Logistic Regression",
                        "error": "Perfect separation detected. The independent variable may perfectly predict the outcome."
                     })
                except Exception as log_reg_e:
                    result["tests"].append({
                        "test": "Logistic Regression/ANOVA",
                        "error": f"Failed to run: {str(log_reg_e)}"
                    })

        # T-Test/ANOVA (Categorical Independent vs Numerical Dependent)
        elif not is_numeric_1 and is_numeric_2:
             if df[field1_clean].nunique() == 2: # T-test
                 groups = df.groupby(field1_clean)[field2_clean]
                 # Ensure groups have sufficient variance/size? ttest_ind handles some cases.
                 try:
                     tstat, p = ttest_ind(*[g for _, g in groups], nan_policy='omit') # omit NaNs
                     interpretation = "Significant difference" if p < 0.05 else "No significant difference"
                     insight = (
                         f"The T-test compares the mean of {field2_clean} across the two categories of {field1_clean}. "
                         + ("The difference is statistically significant." if p < 0.05 else "No significant difference was found.")
                     )
                     result["tests"].append({
                         "test": "T-test",
                         "statistic": tstat,
                         "p_value": p,
                         "interpretation": interpretation,
                         "insight": insight
                     })
                 except ValueError as ttest_err:
                      result["tests"].append({"test": "T-test", "error": str(ttest_err)})

             elif df[field1_clean].nunique() > 2: # ANOVA
                 groups = [df[field2_clean][df[field1_clean] == cat].dropna() for cat in df[field1_clean].unique()] # drop NaNs per group
                 # Filter out groups with less than 2 samples, as f_oneway requires at least 2.
                 groups = [g for g in groups if len(g) >= 2]
                 if len(groups) < 2:
                     result["tests"].append({"test": "ANOVA", "error": "Not enough groups with sufficient data for ANOVA."})                     
                 else:
                     try:
                         fstat, p = f_oneway(*groups)
                         interpretation = "Significant difference" if p < 0.05 else "No significant difference"
                         insight = (
                             f"ANOVA tests if the mean of {field2_clean} differs across categories of {field1_clean}. "
                             + ("A significant result means at least one group differs substantially." if p < 0.05 else
                                "No significant difference detected, suggesting group means are similar.")
                         )
                         result["tests"].append({
                             "test": "ANOVA",
                             "statistic": fstat,
                             "p_value": p,
                             "interpretation": interpretation,
                             "insight": insight
                         })
                     except ValueError as anova_err:
                         result["tests"].append({"test": "ANOVA", "error": str(anova_err)})

        # Chi-Square Test (Categorical vs Categorical)
        elif not is_numeric_1 and not is_numeric_2:
            try:
                contingency = pd.crosstab(df[field1_clean], df[field2_clean])
                if contingency.shape[0] >= 2 and contingency.shape[1] >= 2:
                    chi2, p, _, _ = chi2_contingency(contingency)
                    interpretation = "Associated" if p < 0.05 else "Not associated"
                    insight = (
                        f"The Chi-square test checks for association between {field1_clean} and {field2_clean}. "
                        + ("A significant result suggests dependency between categories." if p < 0.05 else
                           "No association found, implying the categories are independent.")
                    )
                    result["tests"].append({
                        "test": "Chi-square",
                        "statistic": chi2,
                        "p_value": p,
                        "interpretation": interpretation,
                        "insight": insight
                    })
                else:
                    result["tests"].append({"test": "Chi-square", "error": "Contingency table too small (requires at least 2x2)."})
            except ValueError as chi_err:
                 result["tests"].append({"test": "Chi-square", "error": str(chi_err)})

    except Exception as e:
        result["tests"].append({
            "test": "Error",
            "error": str(e)
        })

    if not result["tests"]:
        result["tests"].append({
            "test": "None",
            "error": "No valid statistical test could be performed on the selected fields."
        })

    return result
