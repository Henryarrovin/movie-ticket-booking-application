import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logOut } from '../../features/authSlice';
import { useDropzone } from 'react-dropzone';
import HttpService from '../../services/httpService';


const AdminPage = () => {
  const dispatch = useDispatch();
  const [movieData, setMovieData] = useState({ title: '', releaseDate: '', description: '' });
  const [movieId, setMovieId] = useState('');
  const [bookedMovies, setBookedMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const onDrop = (acceptedFiles) => {
    setImageFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
    maxFiles: 1,
  });

  const handleAddMovie = async () => {
    if (!imageFile) {
        setError("Please upload an image before adding the movie.");
        return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('title', movieData.title);
    formData.append('release_date', movieData.releaseDate);
    formData.append('description', movieData.description);
    if (imageFile) formData.append('image', imageFile);

    try {
      await HttpService.addMovie(formData);
      alert('Movie added successfully');
      setMovieData({ title: '', releaseDate: '', description: '' });
      setImageFile(null);
    } catch (err) {
      setError(err.message || 'Failed to add movie');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMovie = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('title', movieData.title);
    formData.append('release_date', movieData.releaseDate);
    formData.append('description', movieData.description);
    if (imageFile) formData.append('image', imageFile);

    try {
      await HttpService.updateMovie(movieId, formData);
      alert('Movie updated successfully');
      setMovieId('');
      setMovieData({ title: '', releaseDate: '', description: '' });
      setImageFile(null);
    } catch (err) {
      setError(err.message || 'Failed to update movie');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBookedMovies = async () => {
    setLoading(true);
    try {
      const response = await HttpService.viewBookedMovies();
      setBookedMovies(response);
    } catch (err) {
      setError(err.message || 'Failed to fetch booked movies');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logOut());
  };

  return (
    <div className="container mt-4">
      <h2>Admin Panel</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card my-4">
        <div className="card-header">Add Movie</div>
        <div className="card-body">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Title"
              className="form-control"
              value={movieData.title}
              onChange={(e) => setMovieData({ ...movieData, title: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="date"
              className="form-control"
              value={movieData.releaseDate}
              onChange={(e) => setMovieData({ ...movieData, releaseDate: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <textarea
              placeholder="Description"
              className="form-control"
              value={movieData.description}
              onChange={(e) => setMovieData({ ...movieData, description: e.target.value })}
              required
            />
          </div>

          <div
            {...getRootProps({ className: 'dropzone border p-3 mb-3 text-center' })}
            style={{ border: '2px dashed #007bff', borderRadius: '5px' }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the image here...</p>
            ) : (
              <p>Drag and drop an image here, or click to select an image</p>
            )}
            {imageFile && <p className="text-success mt-2">Selected File: {imageFile.name}</p>}
          </div>

          <button className="btn btn-primary" onClick={handleAddMovie} disabled={loading}>
            {loading ? 'Adding...' : 'Add Movie'}
          </button>
        </div>
      </div>

      <div className="card my-4">
        <div className="card-header">Update Movie</div>
        <div className="card-body">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Movie ID"
              className="form-control"
              value={movieId}
              onChange={(e) => setMovieId(e.target.value)}
            />
          </div>
          <button className="btn btn-warning" onClick={handleUpdateMovie} disabled={loading}>
            {loading ? 'Updating...' : 'Update Movie'}
          </button>
        </div>
      </div>

      <div className="card my-4">
        <div className="card-header">View Booked Movies</div>
        <div className="card-body">
          <button className="btn btn-info mb-3" onClick={handleViewBookedMovies} disabled={loading}>
            {loading ? 'Loading...' : 'View Booked Movies'}
          </button>
          <ul className="list-group">
            {bookedMovies.length > 0 ? (
              bookedMovies.map((movie) => (
                <li key={movie.id} className="list-group-item">
                  {movie.title} - Booked by {movie.userName}
                </li>
              ))
            ) : (
              <p>No bookings available</p>
            )}
          </ul>
        </div>
      </div>

      <button className="btn btn-danger mt-3" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default AdminPage;
