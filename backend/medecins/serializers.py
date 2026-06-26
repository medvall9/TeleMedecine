from rest_framework import serializers
from .models import Medecin, Specialite


class SpecialiteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Specialite
        fields = "__all__"


class MedecinSerializer(serializers.ModelSerializer):

    class Meta:
        model = Medecin
        fields = "__all__"