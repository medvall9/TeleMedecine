from django.db import models


class Rapport(models.Model):

    TYPE_CHOICES = (
        ("journalier", "Journalier"),
        ("hebdomadaire", "Hebdomadaire"),
        ("mensuel", "Mensuel"),
        ("annuel", "Annuel"),
    )

    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES
    )

    date_generation = models.DateTimeField(auto_now_add=True)

    nombre_patients = models.PositiveIntegerField(default=0)

    nombre_medecins = models.PositiveIntegerField(default=0)

    nombre_rendezvous = models.PositiveIntegerField(default=0)

    nombre_consultations = models.PositiveIntegerField(default=0)

    nombre_ordonnances = models.PositiveIntegerField(default=0)

    revenu_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    commentaire = models.TextField(blank=True)

    def __str__(self):
        return f"Rapport {self.type}"