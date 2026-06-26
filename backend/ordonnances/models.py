from django.db import models
from consultations.models import Consultation


class Ordonnance(models.Model):

    consultation = models.OneToOneField(
        Consultation,
        on_delete=models.CASCADE,
        related_name="ordonnance"
    )

    date = models.DateField(auto_now_add=True)

    remarque = models.TextField(blank=True)

    def __str__(self):
        return f"Ordonnance {self.id}"


class Medicament(models.Model):

    ordonnance = models.ForeignKey(
        Ordonnance,
        on_delete=models.CASCADE,
        related_name="medicaments"
    )

    nom = models.CharField(max_length=200)

    dosage = models.CharField(max_length=100)

    frequence = models.CharField(max_length=100)

    duree = models.CharField(max_length=100)

    instructions = models.TextField(blank=True)

    def __str__(self):
        return self.nom