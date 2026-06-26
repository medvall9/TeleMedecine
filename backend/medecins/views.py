from rest_framework import viewsets
from .models import Medecin, Specialite
from .serializers import MedecinSerializer, SpecialiteSerializer
from users.permissions import IsAdmin


class MedecinViewSet(viewsets.ModelViewSet):

    queryset = Medecin.objects.all()
    serializer_class = MedecinSerializer
    permission_classes = [IsAdmin]


class SpecialiteViewSet(viewsets.ModelViewSet):

    queryset = Specialite.objects.all()
    serializer_class = SpecialiteSerializer
    permission_classes = [IsAdmin]