from django.urls import path
from .views import (
    AddMovieView,
    UpdateMovieView,
    ViewBookedMovies,
    ViewMovies,
    GetMovieById,
    BookTicketView,
    CommentView,
    RegisterView,
)

urlpatterns = [
    # register endpoint
    path("register/", RegisterView.as_view(), name="register"),
    # ADMIN endpoints
    path("admin/add-movie/", AddMovieView.as_view(), name="add_movie"),
    path(
        "admin/update-movie/<int:movie_id>/",
        UpdateMovieView.as_view(),
        name="update_movie",
    ),
    path("admin/view-booked/", ViewBookedMovies.as_view(), name="view_booked"),
    # USER endpoints
    path("movies/", ViewMovies.as_view(), name="view_movies"),
    path("movies/<int:movie_id>/", GetMovieById.as_view(), name="get_movie_by_id"),
    path("book-ticket/", BookTicketView.as_view(), name="book_ticket"),
    path("comment/", CommentView.as_view(), name="comment"),
]
