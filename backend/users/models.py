from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    ROLE_CHOICES = (
        ("admin", "Administrateur"),
        ("medecin", "Médecin"),
        ("patient", "Patient"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    phone = models.CharField(max_length=20, blank=True)

    address = models.TextField(blank=True)

    image = models.ImageField(upload_to="users/", null=True, blank=True)

    birth_date = models.DateField(null=True, blank=True)

    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username