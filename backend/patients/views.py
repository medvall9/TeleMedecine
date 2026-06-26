from rest_framework import viewsets

from .models import Patient
from .serializers import PatientSerializer
from users.permissions import IsAdminOrMedecin


class PatientViewSet(viewsets.ModelViewSet):

    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAdminOrMedecin]

    def get_queryset(self):

        user = self.request.user

        if user.role == "admin":
            return Patient.objects.all()

        if user.role == "medecin":
            return Patient.objects.all()

        if user.role == "patient":
            return Patient.objects.filter(user=user)

        return Patient.objects.none()