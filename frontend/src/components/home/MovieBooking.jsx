import React, { useEffect, useState } from 'react';
import httpService from '../../services/httpService';
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';

const MovieBooking = () => {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState('');
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await httpService.getMovies(token);
        setMovies(response);
      } catch (error) {
        console.error('Failed to fetch movies', error);
      }
    };
    fetchMovies();
  }, [token]);

  const handleMovieChange = async (event) => {
    const movieId = event.target.value;
    setSelectedMovie(movieId);
    setSelectedShow('');
    setAvailableSeats([]);
    try {
      const movieShows = await httpService.getMovieById(movieId, token);
      setShows(movieShows.shows);
    } catch (error) {
      console.error('Failed to fetch shows', error);
    }
  };

  const handleShowChange = async (event) => {
    const showId = event.target.value;
    setSelectedShow(showId);
    try {
      const seats = await httpService.getAvailableSeats(showId, token);
      setAvailableSeats(Array.isArray(seats) ? seats : []);
    } catch (error) {
      console.error('Failed to fetch available seats', error);
      setAvailableSeats([]);
    }
  };

  const handleSeatSelection = (seatId) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  const handleBookTicket = async () => {
    const ticketData = {
      show_id: selectedShow,
      seats: selectedSeats,
    };

    try {
      const response = await httpService.bookTicket(ticketData, token);
      setSnackbarMessage(`Ticket booked successfully! Booking ID: ${response.booking_id}`);
      setSnackbarOpen(true);
      setSelectedMovie('');
      setSelectedShow('');
      setAvailableSeats([]);
      setSelectedSeats([]);
    } catch (error) {
      console.error('Failed to book ticket', error);
      setSnackbarMessage(error.response?.data?.error || 'Failed to book ticket. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Movie Booking
      </Typography>
      <FormControl fullWidth>
        <InputLabel id="movie-select-label">Select Movie</InputLabel>
        < Select
          labelId="movie-select-label"
          value={selectedMovie}
          onChange={handleMovieChange}
        >
          {movies.map((movie) => (
            <MenuItem key={movie.id} value={movie.id}>
              {movie.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {shows.length > 0 && (
        <FormControl fullWidth>
          <InputLabel id="show-select-label">Select Show</InputLabel>
          <Select
            labelId="show-select-label"
            value={selectedShow}
            onChange={handleShowChange}
          >
            {shows.map((show) => (
              <MenuItem key={show.id} value={show.id}>
                {`${show.start_time} - ${show.end_time}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <div>
        {Array.isArray(availableSeats) && availableSeats.length > 0 ? (
          <div>
            <Typography variant="h6" gutterBottom>
              Available Seats
            </Typography>
            {availableSeats.map((seat) => (
              <Button
                key={seat}
                variant={selectedSeats.includes(seat) ? 'contained' : 'outlined'}
                onClick={() => handleSeatSelection(seat)}
                style={{ margin: '5px' }}
              >
                {seat}
              </Button>
            ))}
          </div>
        ) : (
          <Typography variant="body1" color="textSecondary">
            No available seats for this show.
          </Typography>
        )}
      </div>

      <Button
        variant="contained"
        color="primary"
        onClick={handleBookTicket}
        disabled={!selectedShow || selectedSeats.length === 0}
        style={{ marginTop: '20px' }}
      >
        Book Ticket
      </Button>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MovieBooking;
