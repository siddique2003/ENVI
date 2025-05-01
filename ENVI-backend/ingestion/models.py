from django.db import models
from django.contrib.postgres.fields import JSONField 

class StagingData(models.Model):
    table_name = models.CharField(max_length=100, null=True, blank=True)
    source_type = models.CharField(max_length=20, choices=[('CSV', 'CSV'), ('PostgreSQL', 'PostgreSQL')])
    created_at = models.DateTimeField(auto_now_add=True)

