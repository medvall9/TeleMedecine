from django.contrib import admin
from django.urls import path, include

from rest_framework_simplejwt.views import TokenRefreshView
from users.views import EmailOrUsernameTokenObtainPairView


urlpatterns = [

    path('admin/', admin.site.urls),

    path("api/token/", EmailOrUsernameTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("api/dashboard/", include("dashboard.urls")),
    
    path('api/users/', include('users.urls')),
    path('api/patients/', include('patients.urls')),
    path('api/medecins/', include('medecins.urls')),
    path('api/rendezvous/', include('rendezvous.urls')),
    path('api/consultations/', include('consultations.urls')),
    path('api/ordonnances/', include('ordonnances.urls')),
    path('api/constantes/', include('constantes.urls')),
    path('api/questionnaires/', include('questionnaires.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/rapports/', include('rapports.urls')),
]