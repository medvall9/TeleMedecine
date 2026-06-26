from rest_framework.routers import DefaultRouter

from .views import ConsultationViewSet

router = DefaultRouter()

router.register("", ConsultationViewSet)

urlpatterns = router.urls