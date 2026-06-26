from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from users.permissions import (
    IsAdmin,
    IsMedecin,
    IsPatient,
)

from users.models import User
from patients.models import Patient
from medecins.models import Medecin
from rendezvous.models import RendezVous
from consultations.models import Consultation
from ordonnances.models import Ordonnance
from questionnaires.models import Questionnaire
from constantes.models import Constante
from notifications.models import Notification
from rapports.models import Rapport


# ==========================================
# Dashboard Admin
# ==========================================

class DashboardAPIView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):

        data = {

            "users": User.objects.count(),

            "patients": Patient.objects.count(),

            "medecins": Medecin.objects.count(),

            "rendezvous": RendezVous.objects.count(),

            "consultations": Consultation.objects.count(),

            "ordonnances": Ordonnance.objects.count(),

            "questionnaires": Questionnaire.objects.count(),

            "constantes": Constante.objects.count(),

            "notifications": Notification.objects.count(),

            "rapports": Rapport.objects.count(),

        }

        return Response(data)


# ==========================================
# Dashboard Medecin
# ==========================================

class DashboardMedecinAPIView(APIView):

    permission_classes = [IsAuthenticated, IsMedecin]

    def get(self, request):

        medecin = Medecin.objects.get(user=request.user)

        data = {

            "mes_rendezvous": RendezVous.objects.filter(
                medecin=medecin
            ).count(),

            "mes_consultations": Consultation.objects.filter(
                rendezvous__medecin=medecin
            ).count(),

            "mes_ordonnances": Ordonnance.objects.filter(
                consultation__rendezvous__medecin=medecin
            ).count(),

            "mes_patients": Patient.objects.filter(
                rendezvous__medecin=medecin
            ).distinct().count(),

            "notifications": Notification.objects.filter(
                utilisateur=request.user
            ).count(),

        }

        return Response(data)


# ==========================================
# Dashboard Patient
# ==========================================

class DashboardPatientAPIView(APIView):

    permission_classes = [IsAuthenticated, IsPatient]

    def get(self, request):

        patient = Patient.objects.get(user=request.user)

        data = {

            "mes_rendezvous": RendezVous.objects.filter(
                patient=patient
            ).count(),

            "mes_consultations": Consultation.objects.filter(
                rendezvous__patient=patient
            ).count(),

            "mes_ordonnances": Ordonnance.objects.filter(
                consultation__rendezvous__patient=patient
            ).count(),

            "questionnaires": Questionnaire.objects.filter(
                patient=patient
            ).count(),

            "notifications": Notification.objects.filter(
                utilisateur=request.user
            ).count(),

        }

        return Response(data)