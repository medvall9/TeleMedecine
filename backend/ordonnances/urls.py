from rest_framework.routers import DefaultRouter
from .views import OrdonnanceViewSet, MedicamentViewSet

router = DefaultRouter()

router.register("ordonnances", OrdonnanceViewSet, basename="ordonnance")
router.register("medicaments", MedicamentViewSet, basename="medicament")

urlpatterns = router.urls