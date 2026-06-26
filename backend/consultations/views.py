from rest_framework import viewsets
from users.permissions import IsAdminOrMedecin

from .models import Consultation
from .serializers import ConsultationSerializer


class ConsultationViewSet(viewsets.ModelViewSet):

    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer
    permission_classes = [IsAdminOrMedecin]

    def get_queryset(self):

        user = self.request.user

        if user.role == "admin":
            return Consultation.objects.all()

        if user.role == "medecin":
            return Consultation.objects.filter(
                rendezvous__medecin__user=user
            )

        if user.role == "patient":
            return Consultation.objects.filter(
                rendezvous__patient__user=user
            )

        return Consultation.objects.none()