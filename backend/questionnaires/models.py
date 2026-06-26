from django.db import models
from patients.models import Patient


class Questionnaire(models.Model):

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="questionnaires"
    )

    allergies = models.BooleanField(default=False)

    allergies_details = models.TextField(blank=True)

    maladies_chroniques = models.BooleanField(default=False)

    maladies_details = models.TextField(blank=True)

    prend_medicaments = models.BooleanField(default=False)

    medicaments_details = models.TextField(blank=True)

    operations = models.BooleanField(default=False)

    operations_details = models.TextField(blank=True)

    fumeur = models.BooleanField(default=False)

    alcool = models.BooleanField(default=False)

    observations = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Questionnaire - {self.patient.user.username}"