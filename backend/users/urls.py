from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    UserViewSet,
    RegisterAPIView,
    ProfileAPIView,
    ChangePasswordAPIView,
)

router = DefaultRouter()
router.register("", UserViewSet)

urlpatterns = [

    path("register/", RegisterAPIView.as_view(), name="register"),

    path("profile/", ProfileAPIView.as_view(), name="profile"),

    path("change-password/", ChangePasswordAPIView.as_view(), name="change-password"),

] + router.urls