from django.db import models
from patients.models import Patient
from medecins.models import Medecin


class RendezVous(models.Model):

    STATUS = (
        ("en_attente", "En attente"),
        ("confirme", "Confirmé"),
        ("annule", "Annulé"),
        ("termine", "Terminé"),
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="rendezvous"
    )

    medecin = models.ForeignKey(
        Medecin,
        on_delete=models.CASCADE,
        related_name="rendezvous"
    )

    date = models.DateField()

    heure = models.TimeField()

    motif = models.TextField()

    statut = models.CharField(
        max_length=20,
        choices=STATUS,
        default="en_attente"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.patient} - {self.date}"