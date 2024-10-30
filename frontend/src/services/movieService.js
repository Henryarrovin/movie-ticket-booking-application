import HttpService from './httpService';

export const fetchMovies = async () => {
    return await HttpService.getMovies();
};

export const getMovieById = async (movieId) => {
    return await HttpService.getMovieById(movieId);
};

export const addMovie = async (movieData, token) => {
    return await HttpService.addMovie(movieData, token);
};

export const updateMovie = async (movieId, movieData, token) => {
    return await HttpService.updateMovie(movieId, movieData, token);
};

export const likeMovie = async (movieId, token) => {
    return await HttpService.likeMovie(movieId, token);
};

export const unlikeMovie = async (movieId, token) => {
    return await HttpService.unlikeMovie(movieId, token);
};
