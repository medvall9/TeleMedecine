from django.db import models
from django.conf import settings


class Notification(models.Model):

    TYPE_CHOICES = (
        ("rendezvous", "Rendez-vous"),
        ("consultation", "Consultation"),
        ("ordonnance", "Ordonnance"),
        ("system", "Système"),
    )

    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    titre = models.CharField(max_length=200)

    message = models.TextField()

    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default="system"
    )

    est_lu = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titre