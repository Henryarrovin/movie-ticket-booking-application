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
    TheatreSerializer,
    MovieShowSerializer,
)
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.db import transaction
import json
from django.db import connection


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
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        try:
            print("Request data:", request.data)
            print("Files:", request.FILES)

            shows = []
            show_count = len(request.data.getlist("shows[0][theatre]"))
            for i in range(show_count):
                show_data = {
                    "theatre": request.data.getlist(f"shows[{i}][theatre]")[0],
                    "start_time": request.data.getlist(f"shows[{i}][start_time]")[0],
                    "end_time": request.data.getlist(f"shows[{i}][end_time]")[0],
                }
                shows.append(show_data)

            if not shows:
                return Response(
                    {"error": "Shows field is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            movie_data = {
                "title": request.data.get("title"),
                "description": request.data.get("description"),
                "release_date": request.data.get("release_date"),
                "image": request.FILES.get("image"),
                "shows": shows,
            }

            serializer = MovieSerializer(data=movie_data)
            if not serializer.is_valid():
                print("Serializer errors:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            image_file = request.FILES.get("image")
            if image_file:
                file_path = default_storage.save(
                    f"{image_file.name}", ContentFile(image_file.read())
                )
                serializer.validated_data["image"] = file_path

            movie = serializer.save()

            for show in shows:
                theatre_id = show["theatre"]
                theatre = get_object_or_404(Theatre, id=theatre_id)

                movie_show = MovieShow.objects.create(
                    movie=movie,
                    theatre=theatre,
                    start_time=show["start_time"],
                    end_time=show["end_time"],
                )

                for seat_number in range(1, theatre.capacity + 1):
                    Seat.objects.get_or_create(
                        theatre=theatre,
                        show=movie_show,
                        seat_number=f"A{seat_number}",
                    )

            return Response(
                {
                    "message": "Movie added successfully",
                    "movie": MovieSerializer(movie).data,
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            print("An error occurred:", str(e))
            return Response(
                {"error": "An internal server error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# class UpdateMovieView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated, IsAdminUser]

#     def put(self, request, movie_id):
#         movie = get_object_or_404(Movie, id=movie_id)
#         serializer = MovieSerializer(movie, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(
#                 {"message": "Movie updated successfully"}, status=status.HTTP_200_OK
#             )
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# NOT YET FULLY DEVELOPED
class UpdateMovieView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def put(self, request, movie_id):
        movie = get_object_or_404(Movie, id=movie_id)
        serializer = MovieSerializer(movie, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()

            shows_data = request.data.get("shows", [])
            for show_data in shows_data:
                if show_data.get("id"):
                    movie_show = get_object_or_404(MovieShow, id=show_data["id"])
                    show_serializer = MovieShowSerializer(
                        movie_show, data=show_data, partial=True
                    )
                    if show_serializer.is_valid():
                        show_serializer.save()
                    else:
                        return Response(
                            show_serializer.errors, status=status.HTTP_400_BAD_REQUEST
                        )
                else:
                    show_serializer = MovieShowSerializer(data=show_data)
                    if show_serializer.is_valid():
                        show_serializer.save(movie=movie)
                    else:
                        return Response(
                            show_serializer.errors, status=status.HTTP_400_BAD_REQUEST
                        )

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


class DeleteMovieView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, movie_id):
        movie = get_object_or_404(Movie, id=movie_id)
        movie.delete()
        return Response(
            {"message": "Movie deleted successfully"}, status=status.HTTP_204_NO_CONTENT
        )


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


# class BookTicketView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         show_id = request.data.get("show_id")
#         seat_ids = request.data.get("seats", [])

#         if not show_id:
#             return Response(
#                 {"error": "Show ID is required."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )
#         if not seat_ids:
#             return Response(
#                 {"error": "No seats selected for booking."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         show = get_object_or_404(MovieShow, id=show_id)
#         seats = Seat.objects.filter(id__in=seat_ids, theatre=show.theatre)

#         if len(seats) != len(seat_ids):
#             return Response(
#                 {"error": "One or more seats are invalid for this theatre."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         with transaction.atomic():
#             already_booked = Booking.objects.filter(show=show, seats__in=seats).exists()
#             if already_booked:
#                 return Response(
#                     {"error": "One or more selected seats are already booked."},
#                     status=status.HTTP_400_BAD_REQUEST,
#                 )

#             booking = Booking.objects.create(user=request.user, show=show)
#             booking.seats.set(seats)
#             booking.save()

#             for seat in seats:
#                 seat.is_booked = True
#                 seat.save()

#         seat_numbers = [seat.seat_number for seat in seats]
#         return Response(
#             {
#                 "message": "Ticket booked successfully.",
#                 "booking_id": booking.id,
#                 "show": {
#                     "movie": show.movie.title,
#                     "theatre": show.theatre.name,
#                     "start_time": show.start_time,
#                     "end_time": show.end_time,
#                 },
#                 "seats": seat_numbers,
#             },
#             status=status.HTTP_201_CREATED,
#         )


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

        seats = Seat.objects.filter(seat_number__in=seat_ids, theatre=show.theatre)
        if len(seats) != len(seat_ids):
            return Response(
                {"error": "One or more selected seats are invalid for this theatre."},
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
            # booking.save()

            for seat in seats:
                seat.is_booked = True
                seat.save()

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


class GetAvailableSeatsView(APIView):
    def get(self, request, show_id):
        try:
            show = MovieShow.objects.get(id=show_id)
            available_seats = Seat.objects.filter(theatre=show.theatre, is_booked=False)
            print(connection.queries)
            seat_numbers = [seat.seat_number for seat in available_seats]
            print(f"Available seats count: {len(seat_numbers)}")
            print(f"Available seats details: {seat_numbers}")
            return Response(
                {"available_seats": seat_numbers}, status=status.HTTP_200_OK
            )
        except MovieShow.DoesNotExist:
            return Response(
                {"error": "Show not found."}, status=status.HTTP_404_NOT_FOUND
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


# theatre
class CreateTheatreView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        serializer = TheatreSerializer(data=request.data)
        if serializer.is_valid():
            theatre = serializer.save()
            return Response(
                {
                    "message": "Theatre created successfully",
                    "theatre": TheatreSerializer(theatre).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListTheatreView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        theatres = Theatre.objects.all()
        serializer = TheatreSerializer(theatres, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DeleteTheatreView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, theatre_id):
        theatre = get_object_or_404(Theatre, id=theatre_id)
        theatre.delete()
        return Response(
            {"message": "Theatre deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )
