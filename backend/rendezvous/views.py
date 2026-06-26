from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import RendezVous
from .serializers import RendezVousSerializer


class RendezVousViewSet(viewsets.ModelViewSet):

    queryset = RendezVous.objects.all()
    serializer_class = RendezVousSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if user.role == "admin":
            return RendezVous.objects.all()

        if user.role == "medecin":
            return RendezVous.objects.filter(
                medecin__user=user
            )

        if user.role == "patient":
            return RendezVous.objects.filter(
                patient__user=user
            )

        return RendezVous.objects.none()