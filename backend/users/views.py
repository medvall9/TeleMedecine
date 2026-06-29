from rest_framework import viewsets, generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from users.permissions import IsAdmin

from .models import User
from .serializers import UserSerializer, ProfileSerializer


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Accept username or email in the username field."""

    def validate(self, attrs):
        login = attrs.get(self.username_field, "")
        if "@" in login:
            try:
                user = User.objects.get(email__iexact=login)
                attrs[self.username_field] = user.username
            except User.DoesNotExist:
                pass
        return super().validate(attrs)


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer


# -----------------------------
# CRUD Users (Admin)
# -----------------------------
class UserViewSet(viewsets.ModelViewSet):

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]


# -----------------------------
# Register
# -----------------------------
class RegisterAPIView(generics.CreateAPIView):

    queryset = User.objects.all()
    serializer_class = UserSerializer

    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -----------------------------
# Current Profile
# -----------------------------
class ProfileAPIView(generics.RetrieveAPIView):

    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


# -----------------------------
# Change Password
# -----------------------------
class ChangePasswordAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not request.user.check_password(old_password):
            return Response(
                {"error": "Ancien mot de passe incorrect"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.set_password(new_password)
        request.user.save()

        return Response(
            {"message": "Mot de passe modifié avec succès"},
            status=status.HTTP_200_OK,
        )