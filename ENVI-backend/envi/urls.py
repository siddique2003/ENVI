# envi/urls.py

from django.urls import path
from ingestion import views

urlpatterns = [
    # CSV upload & ingestion
    path('api/upload-csv/', views.upload_csv, name='upload_csv'),

    # stat‐prep & chart generation
    path('api/generate-charts', views.generate_charts, name='generate_charts'),

    # hypothesis‐testing endpoint
    path('api/test-hypotheses/', views.test_hypotheses, name='test_hypotheses'),

    # optional preview endpoint
    path('api/preview-data/', views.preview_data, name='preview_data'),
    
    path("api/recommend-fields/", views.recommend_fields, name="recommend_fields"),

]
