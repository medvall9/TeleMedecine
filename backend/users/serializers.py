from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = "__all__"

        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self, validated_data):

        password = validated_data.pop("password")

        user = User(**validated_data)

        user.set_password(password)

        user.save()

        return user


class ProfileSerializer(serializers.ModelSerializer):
    """Current user profile with linked patient/medecin record ids."""

    medecin_id = serializers.SerializerMethodField()
    patient_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "phone",
            "address",
            "image",
            "birth_date",
            "is_verified",
            "is_active",
            "created_at",
            "updated_at",
            "medecin_id",
            "patient_id",
        ]

    def get_medecin_id(self, obj):
        if obj.role != "medecin":
            return None
        profile = getattr(obj, "medecin", None)
        return profile.id if profile else None

    def get_patient_id(self, obj):
        if obj.role != "patient":
            return None
        profile = getattr(obj, "patient", None)
        return profile.id if profile else None