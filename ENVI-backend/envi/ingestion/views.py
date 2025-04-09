import json
import pandas as pd

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import StagingData
from django.db import connection

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .stats import run_stats_module

CSV_PATH = 'uploaded_data.csv'

@api_view(['POST'])
def stats_api(request):
    field1 = request.data.get('field1')
    field2 = request.data.get('field2')

    print("DEBUG: field1 =", field1)
    print("DEBUG: field2 =", field2)

    if not field1 or not field2:
        return Response({"error": "Missing field1 or field2"}, status=400)

    try:
        result = run_stats_module(field1, field2)
        return Response(result)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

import pandas as pd
from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response

import pandas as pd
import uuid
from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import StagingData

@api_view(['POST'])
def upload_csv(request):
    file = request.FILES['file']
    df = pd.read_csv(file)

    # 🧠 Clean: Replace NaN with None for PostgreSQL
    df = df.where(pd.notnull(df), None)

    # 🧪 Generate unique table name
    table_name = f"csv_{uuid.uuid4().hex[:8]}"

    # 💽 Create PostgreSQL table dynamically
    with connection.cursor() as cursor:
        column_defs = []
        for col in df.columns:
            col_clean = col.lower().replace(" ", "_")
            dtype = "TEXT"  # default
            if pd.api.types.is_numeric_dtype(df[col]):
                dtype = "FLOAT"
            elif pd.api.types.is_datetime64_any_dtype(df[col]):
                dtype = "TIMESTAMP"
            column_defs.append(f'"{col_clean}" {dtype}')
        create_query = f'CREATE TABLE "{table_name}" ({", ".join(column_defs)});'
        cursor.execute(create_query)

        # 🚀 Insert rows
        for _, row in df.iterrows():
            keys = [f'"{c.lower().replace(" ", "_")}"' for c in df.columns]
            placeholders = ', '.join(['%s'] * len(row))
            insert_query = f'INSERT INTO "{table_name}" ({", ".join(keys)}) VALUES ({placeholders})'
            cursor.execute(insert_query, list(row))

    # ✅ Save reference
    StagingData.objects.create(table_name=table_name, source_type="CSV")

    return Response({"message": "CSV uploaded and ingested!", "table_name": table_name})


@api_view(['POST'])
def ingest_from_postgres(request):
    table_name = request.data.get("table_name")

    try:
        with connection.cursor() as cursor:
            cursor.execute(f"SELECT * FROM {table_name}")
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()

        df = pd.DataFrame(rows, columns=columns)
        df.to_csv(CSV_PATH, index=False)  # Save CSV to file
        data = df.to_dict(orient='records')
        StagingData.objects.create(raw_data=data, source_type='PostgreSQL')
        return Response({"message": "Data ingested from PostgreSQL!"})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@csrf_exempt
def ingest_data(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            source_type = data.get('source_type', 'unknown')

            staging_entry = StagingData.objects.create(
                raw_data=data,
                source_type=source_type,
                status="pending"
            )
            return JsonResponse({"message": "Data ingested successfully", "id": staging_entry.id}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=400)

def fetch_data():
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM ingestion_stagingdata;")
        rows = cursor.fetchall()
    return rows

@csrf_exempt
def fetch_ingested_data(request):
    if request.method == 'GET':
        data = list(StagingData.objects.values())
        return JsonResponse({"data": data}, status=200)
    return JsonResponse({"error": "Invalid request"}, status=400)
