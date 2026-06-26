from rest_framework.routers import DefaultRouter
from .views import QuestionnaireViewSet

router = DefaultRouter()

router.register("", QuestionnaireViewSet)

urlpatterns = router.urls