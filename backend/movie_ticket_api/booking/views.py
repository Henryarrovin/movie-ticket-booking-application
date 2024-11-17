from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Movie, Booking, Comment, Like, Theatre, MovieShow, Seat
from .serializers import (
    MovieSerializer,
    BookingSerializer,
    CommentSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
)
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.db import transaction


# welcome string endpoint for testing
class Welcome(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response("Welcome!", status=status.HTTP_200_OK)


# login / return token endpoint
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# register endpoint
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User created successfully"}, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ADMIN Endpoints
# class AddMovieView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated, IsAdminUser]
#     parser_classes = [JSONParser, MultiPartParser, FormParser]

#     # def post(self, request):
#     #     serializer = MovieSerializer(data=request.data)
#     #     if serializer.is_valid():
#     #         serializer.save()
#     #         return Response(
#     #             {"message": "Movie added successfully"}, status=status.HTTP_201_CREATED
#     #         )
#     #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#     def post(self, request):
#         data = request.data.copy()
#         print(f"Request data: {data}")
#         serializer = MovieSerializer(data=data)
#         if serializer.is_valid():
#             # serializer.save()
#             movie = serializer.save()
#             print(f"Saved Image Path: {movie.image}")
#             return Response(
#                 {"message": "Movie added successfully"}, status=status.HTTP_201_CREATED
#             )
#         else:
#             print(f"Errors: {serializer.errors}")
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     # def post(self, request):
#     #     serializer = MovieSerializer(data=request.data)
#     #     if serializer.is_valid():
#     #         # serializer.save()
#     #         movie = serializer.save()
#     #         print(f"Saved Image Path: {movie.image}")
#     #         return Response(
#     #             {"message": "Movie added successfully"}, status=status.HTTP_201_CREATED
#     #         )
#     #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class AddMovieView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated, IsAdminUser]
#     parser_classes = [JSONParser, MultiPartParser, FormParser]

#     def post(self, request):
#         print(f"Request data: {request.data}")

#         serializer = MovieSerializer(data=request.data)
#         if serializer.is_valid():
#             image_file = request.FILES.get("image")
#             if image_file:
#                 file_path = default_storage.save(
#                     f"{image_file.name}", ContentFile(image_file.read())
#                 )
#                 serializer.validated_data["image"] = file_path

#             movie = serializer.save()
#             print(f"Saved Image Path: {movie.image}")
#             return Response(
#                 {"message": "Movie added successfully"}, status=status.HTTP_201_CREATED
#             )
#         else:
#             print(f"Errors: {serializer.errors}")
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddMovieView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request):
        serializer = MovieSerializer(data=request.data)

        if serializer.is_valid():
            image_file = request.FILES.get("image")
            if image_file:
                file_path = default_storage.save(
                    f"movies/{image_file.name}", ContentFile(image_file.read())
                )
                serializer.validated_data["image"] = file_path

            movie = serializer.save()

            shows = request.data.get("shows", [])
            for show in shows:
                if isinstance(show, dict):
                    theatre_id = show.get("theatre_id")
                    start_time = show.get("start_time")
                    end_time = show.get("end_time")

                    if theatre_id and start_time and end_time:
                        theatre = get_object_or_404(Theatre, id=theatre_id)

                        MovieShow.objects.create(
                            movie=movie,
                            theatre=theatre,
                            start_time=start_time,
                            end_time=end_time,
                        )
                    else:
                        return Response(
                            {"error": "Invalid show data provided."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                else:
                    return Response(
                        {"error": "Each show must be a dictionary."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            print("Shows Data: ", request.data.get("shows", []))

            return Response(
                {"message": "Movie added successfully", "movie": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateMovieView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def put(self, request, movie_id):
        movie = get_object_or_404(Movie, id=movie_id)
        serializer = MovieSerializer(movie, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Movie updated successfully"}, status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ViewBookedMovies(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        bookings = Booking.objects.all()
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# USER Endpoints
class ViewMovies(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        movies = Movie.objects.all()
        serializer = MovieSerializer(movies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GetMovieById(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, movie_id):
        movie = get_object_or_404(Movie, id=movie_id)
        serializer = MovieSerializer(movie)
        return Response(serializer.data, status=status.HTTP_200_OK)


# class BookTicketView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         movie_id = request.data.get("movie_id")
#         movie = get_object_or_404(Movie, id=movie_id)
#         booking = Booking.objects.create(user=request.user, movie=movie)
#         serializer = BookingSerializer(booking)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)


class BookTicketView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        show_id = request.data.get("show_id")
        seat_ids = request.data.get("seats", [])

        if not show_id:
            return Response(
                {"error": "Show ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not seat_ids:
            return Response(
                {"error": "No seats selected for booking."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        show = get_object_or_404(MovieShow, id=show_id)
        seats = Seat.objects.filter(id__in=seat_ids, theatre=show.theatre)

        if len(seats) != len(seat_ids):
            return Response(
                {"error": "One or more seats are invalid for this theatre."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            already_booked = Booking.objects.filter(show=show, seats__in=seats).exists()
            if already_booked:
                return Response(
                    {"error": "One or more selected seats are already booked."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            booking = Booking.objects.create(user=request.user, show=show)
            booking.seats.set(seats)
            booking.save()

        seat_numbers = [seat.seat_number for seat in seats]
        return Response(
            {
                "message": "Ticket booked successfully.",
                "booking_id": booking.id,
                "show": {
                    "movie": show.movie.title,
                    "theatre": show.theatre.name,
                    "start_time": show.start_time,
                    "end_time": show.end_time,
                },
                "seats": seat_numbers,
            },
            status=status.HTTP_201_CREATED,
        )


class CommentView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        movie_id = request.data.get("movie_id")
        movie = get_object_or_404(Movie, id=movie_id)
        content = request.data.get("content")
        comment = Comment.objects.create(
            user=request.user, movie=movie, content=content
        )
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# Like functionality
class LikeMovieView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, movie_id):
        movie = get_object_or_404(Movie, id=movie_id)
        like, created = Like.objects.get_or_create(user=request.user, movie=movie)

        if created:
            return Response(
                {"message": "Movie liked successfully."}, status=status.HTTP_201_CREATED
            )
        return Response(
            {"message": "You have already liked this movie."},
            status=status.HTTP_400_BAD_REQUEST,
        )


class UnlikeMovieView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, movie_id):
        movie = get_object_or_404(Movie, id=movie_id)
        try:
            like = Like.objects.get(user=request.user, movie=movie)
            like.delete()
            return Response(
                {"message": "Movie unliked successfully."},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Like.DoesNotExist:
            return Response(
                {"message": "You have not liked this movie."},
                status=status.HTTP_400_BAD_REQUEST,
            )
