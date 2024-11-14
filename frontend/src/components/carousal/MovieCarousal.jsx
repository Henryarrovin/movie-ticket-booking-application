import React, { useEffect, useState } from 'react';
import Carousel from 'react-material-ui-carousel';
import httpService from '../../services/httpService';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import ClapperBoardImage from '../../assets/clapperboard.png'

const MovieCarousel = () => {
  const [movies, setMovies] = useState([]);
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
  }, []);

  return (
    <Carousel>
      {movies.map((movie) => (
        <Card key={movie.id} style={{ maxWidth: 600, margin: '0 auto' }}>
        {( movie.image !== null ?
            <CardMedia
            component="img"
            height="400"
            image={`http://localhost:8000/media/${movie.image}`}
            alt={movie.title}
          /> :
          <CardMedia
              component="img"
              height="400"
              image={ClapperBoardImage}
              alt={movie.title}
              sx={{
                objectFit: 'cover',
              }}
            />
          )}
          <CardContent>
            <Typography variant="h5" component="div">
              {movie.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {movie.description}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Release Date: {new Date(movie.release_date).toLocaleDateString()}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Likes: {movie.likes_count}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Likes: {movie.image}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Carousel>
  );
};

export default MovieCarousel;
