import apiClient from './apiClient';

class HttpService {
    async register(userData) {
        const response = await apiClient.post('/api/register/', userData);
        return response.data;
    }

    async login(credentials) {
        const response = await apiClient.post('/api/token/', credentials);
        return response.data;
    }

    async refreshToken(refreshToken) {
        const response = await apiClient.post('/api/token/refresh/', { refresh: refreshToken });
        return response.data;
    }

    async getMovies() {
        const response = await apiClient.get('/api/movies/');
        return response.data;
    }

    async getMovieById(movieId) {
        const response = await apiClient.get(`/api/movies/${movieId}/`);
        return response.data;
    }

    async addMovie(movieData, token) {
        const response = await apiClient.post('/api/admin/add-movie/', movieData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            },
        });
        return response.data;
    }

    async updateMovie(movieId, movieData, token) {
        const response = await apiClient.put(`/api/admin/update-movie/${movieId}/`, movieData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }

    async viewBookedMovies(token) {
        const response = await apiClient.get('/api/admin/view-booked/', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }

    async bookTicket(ticketData, token) {
        const response = await apiClient.post('/book-ticket/', ticketData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }

    async commentOnMovie(commentData, token) {
        const response = await apiClient.post('/comment/', commentData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }

    async likeMovie(movieId, token) {
        const response = await apiClient.post(`/movies/${movieId}/like/`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }

    async unlikeMovie(movieId, token) {
        const response = await apiClient.post(`/movies/${movieId}/unlike/`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }
}

export default new HttpService();
