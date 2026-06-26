from django.db import models
from consultations.models import Consultation


class Constante(models.Model):

    consultation = models.OneToOneField(
        Consultation,
        on_delete=models.CASCADE,
        related_name="constante"
    )

    temperature = models.DecimalField(
        max_digits=4,
        decimal_places=1
    )

    tension_arterielle = models.CharField(
        max_length=20
    )

    rythme_cardiaque = models.PositiveIntegerField()

    frequence_respiratoire = models.PositiveIntegerField()

    saturation_oxygene = models.PositiveIntegerField()

    poids = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    taille = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    commentaire = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Constantes {self.consultation.id}"