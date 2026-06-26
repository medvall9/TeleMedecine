from rest_framework.routers import DefaultRouter
from .views import MedecinViewSet, SpecialiteViewSet

router = DefaultRouter()

router.register("", MedecinViewSet, basename="medecin")
router.register("specialites", SpecialiteViewSet, basename="specialite")

urlpatterns = router.urls