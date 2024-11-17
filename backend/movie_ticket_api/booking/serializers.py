from rest_framework import serializers
from .models import Movie, Booking, Comment, Like, CustomUser, Theatre, MovieShow
from django.contrib.auth.models import User
import os
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.conf import settings
from urllib.parse import urljoin


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


class TheatreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Theatre
        fields = "__all__"


class MovieShowSerializer(serializers.ModelSerializer):
    theatre = TheatreSerializer()

    class Meta:
        model = MovieShow
        fields = ["id", "movie", "theatre", "start_time", "end_time"]


class MovieSerializer(serializers.ModelSerializer):
    likes_count = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    shows = MovieShowSerializer(many=True, read_only=True)

    class Meta:
        model = Movie
        fields = "__all__"

    def get_likes_count(self, obj):
        return Like.objects.filter(movie=obj).count()

    def get_image(self, obj):
        return os.path.basename(obj.image.name) if obj.image else None
        # if obj.image:
        #     return urljoin(settings.MEDIA_URL, obj.image.name)
        # return None


class BookingSerializer(serializers.ModelSerializer):
    show = MovieShowSerializer()

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
