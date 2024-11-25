import React, { useEffect, useState } from 'react';
import Carousel from 'react-material-ui-carousel';
import httpService from '../../services/httpService';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import ClapperBoardImage from '../../assets/clapperboard.png';

const MovieCarousel = () => {
  const [movies, setMovies] = useState([]);
  const [likedMovies, setLikedMovies] = useState(new Set());
  const [loadingLikes, setLoadingLikes] = useState(new Set());
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const moviesResponse = await httpService.getMovies(token);
        setMovies(moviesResponse);
    
        const likedMoviesResponse = await httpService.getLikedMovies(token);
        const likedMovieIds = new Set(likedMoviesResponse.map(movie => movie.id));
        setLikedMovies(likedMovieIds);
      } catch (error) {
        console.error('Failed to fetch movies', error);
      }
    };

    fetchMovies();
  }, [token]);

  const handleLike = async (movieId) => {
    if (loadingLikes.has(movieId)) return; 
    setLoadingLikes((prev) => new Set(prev).add(movieId));

    const updatedLikedMovies = new Set(likedMovies);
    const updatedMovies = [...movies];

    try {
      const movieIndex = updatedMovies.findIndex(movie => movie.id === movieId);
      const movie = updatedMovies[movieIndex];

      if (updatedLikedMovies.has(movieId)) {
        await httpService.unlikeMovie(movieId, token);
        updatedLikedMovies.delete(movieId);
        movie.likes_count -= 1;
      } else {
        await httpService.likeMovie(movieId, token);
        updatedLikedMovies.add(movieId);
        movie.likes_count += 1;
      }

      setLikedMovies(updatedLikedMovies);
      setMovies(updatedMovies);
    } catch (error) {
      console.error('Failed to like/unlike movie', error.response ? error.response.data : error);
    } finally {
      setLoadingLikes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(movieId);
        return newSet;
      });
    }
  };

  return (
    <Carousel>
      {movies.map((movie) => (
        <Card key={movie.id} style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
          {movie.image ? (
            <CardMedia
              component="img"
              height="400"
              image={`http://localhost:8000/media/${movie.image}`}
              alt={movie.title}
            />
          ) : (
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
          </CardContent>
          <div 
            onClick={() => handleLike(movie.id)} 
            style={{ 
              position: 'absolute', 
              bottom: '10px', 
              right: '10px', 
              cursor: 'pointer' 
            }}
          >
            {likedMovies.has(movie.id) ? <FaHeart color="red" /> : <FaRegHeart />}
          </div>
        </Card>
      ))}
    </Carousel>
  );
};

export default MovieCarousel;
