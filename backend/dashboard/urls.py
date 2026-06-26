from django.urls import path

from .views import (
    DashboardAPIView,
    DashboardMedecinAPIView,
    DashboardPatientAPIView,
)

urlpatterns = [

    # Dashboard Admin
    path(
        "admin/",
        DashboardAPIView.as_view(),
        name="dashboard-admin"
    ),

    # Dashboard Medecin
    path(
        "medecin/",
        DashboardMedecinAPIView.as_view(),
        name="dashboard-medecin"
    ),

    # Dashboard Patient
    path(
        "patient/",
        DashboardPatientAPIView.as_view(),
        name="dashboard-patient"
    ),

]