import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchMovies as fetchMoviesAPI, likeMovie, unlikeMovie } from "../services/movieService";

const movieSlice = createSlice({
    name: "movies",
    initialState: {
        movies: [],
        loading: false,
        error: null,
    },
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMovies.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMovies.fulfilled, (state, action) => {
                state.loading = false;
                state.movies = action.payload;
            })
            .addCase(fetchMovies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const fetchMovies = createAsyncThunk("movies/fetchMovies", async () => {
    return await fetchMoviesAPI();
});

export const likeMovieThunk = createAsyncThunk("movies/likeMovie", async ({ movieId, token }) => {
    return await likeMovie(movieId, token);
});

export const unlikeMovieThunk = createAsyncThunk("movies/unlikeMovie", async ({ movieId, token }) => {
    return await unlikeMovie(movieId, token);
});

export default movieSlice.reducer;

export const selectMovies = (state) => state.movies.movies;
export const selectLoading = (state) => state.movies.loading;
export const selectError = (state) => state.movies.error;