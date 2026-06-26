from rest_framework import serializers
from .models import Constante


class ConstanteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Constante
        fields = "__all__"