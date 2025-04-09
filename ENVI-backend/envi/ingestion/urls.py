from django.urls import path
from . import views
from .views import ingest_data, fetch_ingested_data, stats_api, upload_csv, ingest_from_postgres

urlpatterns = [
    path('ingest/', ingest_data, name='ingest_data'),
    path('fetch/', fetch_ingested_data, name='fetch_ingested_data'),
]


urlpatterns = [
    path('stats/', stats_api, name='stats_api'),
]


urlpatterns = [
    path('upload-csv/', views.upload_csv),
]

