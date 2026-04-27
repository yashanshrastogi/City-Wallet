from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.
class ArtemisUser(models.Model):
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, blank=True, null=True)
    google_id = models.CharField(max_length=255, unique=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.email}->{self.timestamp}"


class ArtemisMerchant(models.Model):
    user = models.ForeignKey(ArtemisUser, on_delete=models.CASCADE)
    max_offer = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)], default=0
    )
    traffic = models.FloatField(default=10.0)
    target_item = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.user.email}->{self.traffic}"
