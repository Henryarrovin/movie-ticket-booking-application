from django.conf import settings
from django.db import models
from django.contrib.auth.models import User, AbstractUser, BaseUserManager


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", "ADMIN")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    role = models.CharField(
        max_length=10, choices=[("USER", "User"), ("ADMIN", "Admin")], default="USER"
    )
    objects = CustomUserManager()


class Movie(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    release_date = models.DateField()
    # image_url = models.URLField(null=True, blank=True)
    image = models.ImageField(upload_to="movies/", null=True, blank=True)

    def __str__(self):
        return self.title


class Theatre(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    capacity = models.IntegerField()

    def __str__(self):
        return self.name


class Seat(models.Model):
    theatre = models.ForeignKey(Theatre, on_delete=models.CASCADE, related_name="seats")
    seat_number = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.theatre.name} - {self.seat_number}"


class MovieShow(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name="shows")
    theatre = models.ForeignKey(Theatre, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    def __str__(self):
        return f"{self.movie.title} at {self.theatre.name} ({self.start_time} - {self.end_time})"


class Booking(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    show = models.ForeignKey(MovieShow, on_delete=models.CASCADE)
    seats = models.ManyToManyField(Seat)
    booking_time = models.DateTimeField(auto_now_add=True)


class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)


class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "movie")
