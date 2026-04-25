from django.db import models

# Create your models here.
class ArtemisUser(models.Model):
    email=models.EmailField(unique=True)
    role=models.CharField(blank=True, null=True)
    google_id=models.CharField(unique=True)
    timestamp=models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.email}->{self.timestamp}"

