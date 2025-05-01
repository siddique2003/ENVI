from django.urls import path
from . import views
from .views import stats_api, upload_csv, preview_data, ingest_data, fetch_ingested_data, ingest_from_postgres, generate_charts
from .views import test_hypotheses

from .views import (
    stats_api,
    upload_csv,
    preview_data,
    ingest_data,
    fetch_ingested_data,
    ingest_from_postgres,
    generate_charts
)

urlpatterns = [
    path("upload-csv/", upload_csv, name="upload_csv"),
    path("stats/", stats_api, name="stats_api"),
    path("preview-data/", preview_data, name="preview_data"),
    path("ingest-data/", ingest_data, name="ingest_data"),
    path("fetch-ingested-data/", fetch_ingested_data, name="fetch_ingested_data"),
    path("ingest-from-postgres/", ingest_from_postgres, name="ingest_from_postgres"),
    path("generate-charts/", generate_charts, name="generate-charts"),
    path("api/test-hypotheses/", test_hypotheses, name="test-hypotheses"),


]


