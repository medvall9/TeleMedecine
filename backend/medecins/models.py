from django.db import models
from django.conf import settings


class Specialite(models.Model):

    nom = models.CharField(max_length=100)

    description = models.TextField(blank=True)

    def __str__(self):
        return self.nom


class Medecin(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="medecin"
    )

    specialite = models.ForeignKey(
        Specialite,
        on_delete=models.SET_NULL,
        null=True
    )

    numero_ordre = models.CharField(max_length=50)

    experience = models.PositiveIntegerField()

    biographie = models.TextField(blank=True)

    consultation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    disponible = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.get_full_name()