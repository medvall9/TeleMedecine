from django.db import models
from django.conf import settings


class Patient(models.Model):

    GENDER_CHOICES = (
        ("M", "Male"),
        ("F", "Female"),
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="patient"
    )

    date_naissance = models.DateField()

    sexe = models.CharField(
        max_length=1,
        choices=GENDER_CHOICES
    )

    groupe_sanguin = models.CharField(
        max_length=5,
        blank=True
    )

    taille = models.FloatField(
        null=True,
        blank=True
    )

    poids = models.FloatField(
        null=True,
        blank=True
    )

    allergies = models.TextField(
        blank=True
    )

    antecedents = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.user.get_full_name()