from rest_framework.routers import DefaultRouter
from .views import MedecinViewSet, SpecialiteViewSet

router = DefaultRouter()

# Register nested routes before the catch-all medecin detail route (pk would swallow "specialites").
router.register("specialites", SpecialiteViewSet, basename="specialite")
router.register("", MedecinViewSet, basename="medecin")

urlpatterns = router.urls