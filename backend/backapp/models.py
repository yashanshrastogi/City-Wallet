from django.db import models
from django.core.validators import MinValueValidator,
MaxValueValidator
# Create your models here.
class ArtemisUser(models.Model):
    email=models.EmailField(unique=True)
    role=models.CharField(blank=True, null=True)
    google_id=models.CharField(unique=True)
    timestamp=models.DateTimeField(auto_new_add=True)
    def __str__(self):
        return f"{self.email}->{self.timestamp}"

class ArtemisMerchant(models.Model):
    user=models.ForeignKey(ArtemisUser, on_delete=models.CASCADE)
    max_offer=models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)], default=0)
    traffic=models.FloatField(default=10.0)
    target_item=models.CharField(blank=True, null=True)
    def __str__(self):
        return f"{self.user.email}->{self.traffic}"


