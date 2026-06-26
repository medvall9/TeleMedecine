from django.db import models
from rendezvous.models import RendezVous


class Consultation(models.Model):

    rendezvous = models.OneToOneField(
        RendezVous,
        on_delete=models.CASCADE,
        related_name="consultation"
    )

    diagnostic = models.TextField()

    traitement = models.TextField()

    observations = models.TextField(blank=True)

    date_consultation = models.DateTimeField(auto_now_add=True)

    prochaine_visite = models.DateField(
        null=True,
        blank=True
    )

    def __str__(self):
        return f"Consultation {self.id}"