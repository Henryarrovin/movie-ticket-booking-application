from rest_framework import serializers
from .models import Movie, Booking, Comment, Like
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "password", "email"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"],
        )
        return user


class MovieSerializer(serializers.ModelSerializer):
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = "__all__"

    def get_likes_count(self, obj):
        return Like.objects.filter(movie=obj).count()


class BookingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    movie = MovieSerializer()

    class Meta:
        model = Booking
        fields = "__all__"


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    movie = MovieSerializer()

    class Meta:
        model = Comment
        fields = "__all__"


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ["user", "movie"]
