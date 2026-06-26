from rest_framework import viewsets
from users.permissions import IsAdminOrMedecin

from .models import Ordonnance, Medicament
from .serializers import OrdonnanceSerializer, MedicamentSerializer


class OrdonnanceViewSet(viewsets.ModelViewSet):

    queryset = Ordonnance.objects.all()
    serializer_class = OrdonnanceSerializer
    permission_classes = [IsAdminOrMedecin]

    def get_queryset(self):

        user = self.request.user

        if user.role == "admin":
            return Ordonnance.objects.all()

        if user.role == "medecin":
            return Ordonnance.objects.filter(
                consultation__rendezvous__medecin__user=user
            )

        if user.role == "patient":
            return Ordonnance.objects.filter(
                consultation__rendezvous__patient__user=user
            )

        return Ordonnance.objects.none()


class MedicamentViewSet(viewsets.ModelViewSet):

    queryset = Medicament.objects.all()
    serializer_class = MedicamentSerializer
    permission_classes = [IsAdminOrMedecin]

    def get_queryset(self):

        user = self.request.user

        if user.role == "admin":
            return Medicament.objects.all()

        if user.role == "medecin":
            return Medicament.objects.filter(
                ordonnance__consultation__rendezvous__medecin__user=user
            )

        if user.role == "patient":
            return Medicament.objects.filter(
                ordonnance__consultation__rendezvous__patient__user=user
            )

        return Medicament.objects.none()