from rest_framework import serializers
from .models import Movie, Booking, Comment, Like, CustomUser
from django.contrib.auth.models import User
import os
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["role"] = self.user.role
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["username", "password", "email"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"],
            role=validated_data.get("role", "USER"),
        )
        return user


class MovieSerializer(serializers.ModelSerializer):
    likes_count = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = "__all__"

    def get_likes_count(self, obj):
        return Like.objects.filter(movie=obj).count()

    def get_image(self, obj):
        return os.path.basename(obj.image.name) if obj.image else None


class BookingSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    movie = MovieSerializer()

    class Meta:
        model = Booking
        fields = "__all__"


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    movie = MovieSerializer()

    class Meta:
        model = Comment
        fields = "__all__"


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ["user", "movie"]
