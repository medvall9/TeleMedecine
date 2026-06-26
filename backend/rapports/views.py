from rest_framework import viewsets
from users.permissions import IsAdmin

from .models import Rapport
from .serializers import RapportSerializer


class RapportViewSet(viewsets.ModelViewSet):

    queryset = Rapport.objects.all()
    serializer_class = RapportSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):

        if self.request.user.role == "admin":
            return Rapport.objects.all()

        return Rapport.objects.none()