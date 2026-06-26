from rest_framework import viewsets
from users.permissions import IsPatient

from .models import Questionnaire
from .serializers import QuestionnaireSerializer


class QuestionnaireViewSet(viewsets.ModelViewSet):

    queryset = Questionnaire.objects.all()
    serializer_class = QuestionnaireSerializer
    permission_classes = [IsPatient]

    def get_queryset(self):

        user = self.request.user

        if user.role == "patient":
            return Questionnaire.objects.filter(
                patient__user=user
            )

        return Questionnaire.objects.none()