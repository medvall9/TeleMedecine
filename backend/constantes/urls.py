from rest_framework.routers import DefaultRouter
from .views import ConstanteViewSet

router = DefaultRouter()

router.register("", ConstanteViewSet)

urlpatterns = router.urls