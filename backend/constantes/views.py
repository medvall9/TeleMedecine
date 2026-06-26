from rest_framework import viewsets
from users.permissions import IsAdminOrMedecin

from .models import Constante
from .serializers import ConstanteSerializer


class ConstanteViewSet(viewsets.ModelViewSet):

    queryset = Constante.objects.all()
    serializer_class = ConstanteSerializer
    permission_classes = [IsAdminOrMedecin]

    def get_queryset(self):

        user = self.request.user

        if user.role == "admin":
            return Constante.objects.all()

        if user.role == "medecin":
            return Constante.objects.filter(
                consultation__rendezvous__medecin__user=user
            )

        if user.role == "patient":
            return Constante.objects.filter(
                consultation__rendezvous__patient__user=user
            )

        return Constante.objects.none()