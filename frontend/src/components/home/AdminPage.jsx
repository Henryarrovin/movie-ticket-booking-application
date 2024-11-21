import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logOut } from '../../features/authSlice';
import { useDropzone } from 'react-dropzone';
import HttpService from '../../services/httpService';

// const AdminPage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [movieData, setMovieData] = useState({ title: '', releaseDate: '', description: '' });
//   const [movieId, setMovieId] = useState('');
//   const [bookedMovies, setBookedMovies] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [imageFile, setImageFile] = useState(null);
//   const [state, setState] = useState("ADD_MOVIE");
//   const [shows, setShows] = useState([]);
//   const [newShow, setNewShow] = useState({
//     theatre_id: "",
//     start_time: "",
//     end_time: "",
//   });

//   const token = localStorage.getItem('authToken');

//   const onDrop = (acceptedFiles) => {
//     setImageFile(acceptedFiles[0]);
//   };

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: 'image/*',
//     maxFiles: 1,
//   });

//   const logFormData = (formData) => {
//     for (let [key, value] of formData.entries()) {
//       console.log(`${key}: ${value}`);
//     }
//   };

//   const handleAddMovie = async () => {
//     if (!imageFile) {
//       setError("Please upload an image before adding the movie.");
//       return;
//     }

//     if (shows.length === 0) {
//       setError("Please add at least one showtime before adding the movie.");
//       return;
//     }

//     const validatedShows = shows.map((show) => {
//       if (!show.theatre_id || !show.start_time || !show.end_time) {
//         throw new Error("All fields for each show must be filled.");
//       }
//       const startTimeParsed = Date.parse(show.start_time);
//       const endTimeParsed = Date.parse(show.end_time);

//       if (isNaN(startTimeParsed) || isNaN(endTimeParsed)) {
//         throw new Error("Invalid date format for start or end time.");
//       }
//       return {
//         theatre_id: parseInt(show.theatre_id, 10),
//         start_time: new Date(show.start_time).toISOString(),
//         end_time: new Date(show.end_time).toISOString(),
//       };
//     });

//     setLoading(true);
//     const formData = new FormData();
//     formData.append('title', movieData.title);
//     formData.append('release_date', movieData.releaseDate);
//     formData.append('description', movieData.description);
//     formData.append('image', imageFile);
//     // formData.append("shows", JSON.stringify(validatedShows));
//     // formData.append("shows", validatedShows);
//     validatedShows.forEach((show, index) => {
//       formData.append(`shows[${index}][theatre_id]`, show.theatre_id);
//       formData.append(`shows[${index}][start_time]`, show.start_time);
//       formData.append(`shows[${index}][end_time]`, show.end_time);
//     });
//     logFormData(formData);

//     console.log("--------------------FORM DATA--------------------");
    
//     console.log(formData.forEach((x, y) => console.log(x, y)));
    
//     try {
//       await HttpService.addMovie(formData, token);
//       alert('Movie added successfully');
//       setMovieData({ title: '', releaseDate: '', description: '' });
//       setImageFile(null);
//       setShows([]);
//       setError(null);
//     } catch (err) {
//       setError(err.response?.data || 'Failed to add movie');
//       console.error(err.response);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddShow = () => {
//     if (!newShow.theatre_id || !newShow.start_time || !newShow.end_time) {
//       alert("Please fill in all fields for the showtime.");
//       return;
//     }
  
//     setShows([...shows, { ...newShow }]);
//     setNewShow({ theatre_id: "", start_time: "", end_time: "" });
//   };

//   const handleUpdateMovie = async () => {
//     setLoading(true);
//     const formData = new FormData();
//     if (movieData.title) formData.append('title', movieData.title);
//     if (movieData.releaseDate) formData.append('release_date', movieData.releaseDate);
//     if (movieData.description) formData.append('description', movieData.description);
//     if (imageFile) formData.append('image', imageFile);

//     try {
//       await HttpService.updateMovie(movieId, formData, token);
//       alert('Movie updated successfully');
//       setMovieId('');
//       setMovieData({ title: '', releaseDate: '', description: '' });
//       setImageFile(null);
//       setError(null);
//     } catch (err) {
//       setError(err.response?.data || 'Failed to update movie');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewBookedMovies = async () => {
//     setLoading(true);
//     try {
//       const response = await HttpService.viewBookedMovies(token);
//       setBookedMovies(response.data.shows);
//     } catch (err) {
//       setError(err.response?.data || 'Failed to fetch booked movies');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     dispatch(logOut());
//     navigate("/", { replace: true });
//   };

//   const handlePageStateAdd = () => {
//     setState("ADD_MOVIE");
//     setError(null);
//   }

//   const handlePageStateUpdate = () => {
//     setState("UPDATE_MOVIE");
//     setError(null);
//   }

//   return (
//     <div className="container mt-4">
//       <nav className="navbar navbar-light bg-light">
//         <div className="container-fluid d-flex justify-content-between align-items-center">
//           <span className="navbar-brand mb-0 h1">Admin Panel</span>

//           <button className="btn btn-danger" onClick={handleLogout}>
//             Logout
//           </button>
//         </div>
//       </nav>

//       <div className="container mt-5">
//         <div className="row">
//           <div className="col-6 text-center">
//             <button className="btn btn-primary w-100" onClick={handlePageStateAdd}>Add Movie</button>
//           </div>

//           <div className="col-6 text-center">
//             <button className="btn btn-secondary w-100" onClick={handlePageStateUpdate}>Update Movie</button>
//           </div>
//         </div>
//       </div>

//       {
//         state === "ADD_MOVIE" ? 
//         <div className="card my-4">
//           <div className="card-header">Add Movie</div>
//           <div className="card-body">
//             <div className="mb-3">
//               <input
//                 type="text"
//                 placeholder="Title"
//                 className="form-control"
//                 value={movieData.title}
//                 onChange={(e) => setMovieData({ ...movieData, title: e.target.value })}
//                 required
//               />
//             </div>
//             <div className="mb-3">
//               <input
//                 type="date"
//                 className="form-control"
//                 value={movieData.releaseDate}
//                 onChange={(e) => setMovieData({ ...movieData, releaseDate: e.target.value })}
//                 required
//               />
//             </div>
//             <div className="mb-3">
//               <textarea
//                 placeholder="Description"
//                 className="form-control"
//                 value={movieData.description}
//                 onChange={(e) => setMovieData({ ...movieData, description: e.target.value })}
//                 required
//               />
//             </div>

//             <div
//               {...getRootProps({ className: "dropzone border p-3 mb-3 text-center" })}
//               style={{ border: "2px dashed #007bff", borderRadius: "5px" }}
//             >
//               <input {...getInputProps()} />
//               {isDragActive ? (
//                 <p>Drop the image here...</p>
//               ) : (
//                 <p>Drag and drop an image here, or click to select an image</p>
//               )}
//               {imageFile && <p className="text-success mt-2">Selected File: {imageFile.name}</p>}
//             </div>

//             <div className="mb-3">
//               <h5>Add Showtimes</h5>
//               <div className="row g-2">
//                 <div className="col-md-4">
//                   <input
//                     type="number"
//                     placeholder="Theatre ID"
//                     className="form-control"
//                     value={newShow.theatre_id}
//                     onChange={(e) => setNewShow({ ...newShow, theatre_id: e.target.value })}
//                     required
//                   />
//                 </div>
//                 <div className="col-md-4">
//                   <input
//                     type="datetime-local"
//                     placeholder="Start Time"
//                     className="form-control"
//                     value={newShow.start_time}
//                     onChange={(e) => setNewShow({ ...newShow, start_time: e.target.value })}
//                     required
//                   />
//                 </div>
//                 <div className="col-md-4">
//                   <input
//                     type="datetime-local"
//                     placeholder="End Time"
//                     className="form-control"
//                     value={newShow.end_time}
//                     onChange={(e) => setNewShow({ ...newShow, end_time: e.target.value })}
//                     required
//                   />
//                 </div>
//               </div>
//               <button className="btn btn-success mt-2" onClick={handleAddShow}>
//                 Add Showtime
//               </button>
//             </div>

//             {shows.length > 0 && (
//               <div className="mb-3">
//                 <h5>Added Showtimes</h5>
//                 <ul className="list-group">
//                   {shows.map((show, index) => (
//                     <li key={index} className="list-group-item">
//                       Theatre ID: {show.theatre_id}, Start: {show.start_time}, End: {show.end_time}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             <button className="btn btn-primary" onClick={handleAddMovie} disabled={loading}>
//               {loading ? "Adding..." : "Add Movie"}
//             </button>
//           </div>
//         </div> : 
//         <div className="card my-4">
//           <div className="card-header">Update Movie</div>
//           <div className="card-body">
//             <div className="mb-3">
//               <input
//                 type="text"
//                 placeholder="Movie ID"
//                 className="form-control"
//                 value={movieId}
//                 onChange={(e) => setMovieId(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="mb-3">
//               <input
//                 type="text"
//                 placeholder="Title"
//                 className="form-control"
//                 value={movieData.title}
//                 onChange={(e) => setMovieData({ ...movieData, title: e.target.value })}
//               />
//             </div>
//             <div className="mb-3">
//               <input
//                 type="date"
//                 className="form-control"
//                 value={movieData.releaseDate}
//                 onChange={(e) => setMovieData({ ...movieData, releaseDate: e.target.value })}
//               />
//             </div>
//             <div className="mb-3">
//               <textarea
//                 placeholder="Description"
//                 className="form-control"
//                 value={movieData.description}
//                 onChange={(e) => setMovieData({ ...movieData, description: e.target.value })}
//               />
//             </div>

//             <div
//               {...getRootProps({ className: 'dropzone border p-3 mb-3 text-center' })}
//               style={{ border: '2px dashed #007bff', borderRadius: '5px' }}
//             >
//               <input {...getInputProps()} />
//               {isDragActive ? (
//                 <p>Drop the image here...</p>
//               ) : (
//                 <p>Drag and drop an image here, or click to select an image</p>
//               )}
//               {imageFile && <p className="text-success mt-2">Selected File: {imageFile.name}</p>}
//             </div>

//             <button className="btn btn-primary" onClick={handleUpdateMovie} disabled={loading}>
//               {loading ? 'Updating...' : 'Update Movie'}
//             </button>
//           </div>
//         </div>
//       }

//       {error && <div className="alert alert-danger">{error}</div>}

//       <div className="card my-4">
//         <div className="card-header">View Booked Movies</div>
//         <div className="card-body">
//           <button className="btn btn-info mb-3" onClick={handleViewBookedMovies} disabled={loading}>
//             {loading ? 'Loading...' : 'View Booked Movies'}
//           </button>
//           <ul className="list-group">
//             {bookedMovies.length > 0 ? (
//               bookedMovies.map((movie) => (
//                 <li key={movie.id} className="list-group-item">
//                   {movie.title} - Booked by {movie.userName}
//                 </li>
//               ))
//             ) : (
//               <p>No bookings available</p>
//             )}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminPage;

const AdminPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [movieData, setMovieData] = useState({ title: '', releaseDate: '', description: '' });
  const [movieId, setMovieId] = useState('');
  const [bookedMovies, setBookedMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [state, setState] = useState("ADD_MOVIE");
  const [shows, setShows] = useState([]);
  const [newShow, setNewShow] = useState({
    theatre_id: "",
    start_time: "",
    end_time: "",
  });
  const [theatres, setTheatres] = useState([]);

  const token = localStorage.getItem('authToken');

  // useEffect(() => {
  //   if (!token) {
  //     console.error("Token is missing");
  //     return;
  //   }
  //   const fetchTheatres = async () => {
  //     try {
  //       setLoading(true);           
  //       const response = await HttpService.getTheatres(token);
  //       console.log("API Response:", response.data);
  //       setTheatres(response.data);
  //       console.log("Inside useEffect", theatres);
  //     } catch (err) {
  //       setError("Failed to fetch theatres");
  //       console.error("Error fetching theatres:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchTheatres();
  // }, [theatres]);

  const fetchTheatres = async () => {
    try {
      setTheatres(await HttpService.getTheatres(token));
    } catch (error) {
      setError("Failed to fetch theatres");
      console.log(error);
    }
  }

  useEffect(() => {
    if(token) fetchTheatres();
  }, [token]);
  
  const onDrop = (acceptedFiles) => {
    setImageFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
    maxFiles: 1,
  });

  const logFormData = (formData) => {
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
  };

  const handleAddMovie = async () => {
    if (!imageFile) {
      setError("Please upload an image before adding the movie.");
      return;
    }

    if (shows.length === 0) {
      setError("Please add at least one showtime before adding the movie.");
      return;
    }

    const validatedShows = shows.map((show) => {
      if (!show.theatre_id || !show.start_time || !show.end_time) {
        throw new Error("All fields for each show must be filled.");
      }
      const startTimeParsed = Date.parse(show.start_time);
      const endTimeParsed = Date.parse(show.end_time);

      if (isNaN(startTimeParsed) || isNaN(endTimeParsed)) {
        throw new Error("Invalid date format for start or end time.");
      }
      return {
        theatre_id: parseInt(show.theatre_id, 10),
        start_time: new Date(show.start_time).toISOString(),
        end_time: new Date(show.end_time).toISOString(),
      };
    });

    setLoading(true);
    const formData = new FormData();
    formData.append('title', movieData.title);
    formData.append('release_date', movieData.releaseDate);
    formData.append('description', movieData.description);
    formData.append('image', imageFile);
    validatedShows.forEach((show, index) => {
      formData.append(`shows[${index}][theatre_id]`, show.theatre_id);
      formData.append(`shows[${index}][start_time]`, show.start_time);
      formData.append(`shows[${index}][end_time]`, show.end_time);
    });
    logFormData(formData);

    try {
      await HttpService.addMovie(formData, token);
      alert('Movie added successfully');
      setMovieData({ title: '', releaseDate: '', description: '' });
      setImageFile(null);
      setShows([]);
      setError(null);
    } catch (err) {
      setError(err.response?.data || 'Failed to add movie');
      console.error(err.response);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShow = () => {
    if (!newShow.theatre_id || !newShow.start_time || !newShow.end_time) {
      alert("Please fill in all fields for the showtime.");
      return;
    }
  
    setShows([...shows, { ...newShow }]);
    setNewShow({ theatre_id: "", start_time: "", end_time: "" });
  };

  const handleUpdateMovie = async () => {
    setLoading(true);
    const formData = new FormData();
    if (movieData.title) formData.append('title', movieData.title);
    if (movieData.releaseDate) formData.append('release_date', movieData.releaseDate);
    if (movieData.description) formData.append('description', movieData.description);
    if (imageFile) formData.append('image', imageFile);

    try {
      await HttpService.updateMovie(movieId, formData, token);
      alert('Movie updated successfully');
      setMovieId('');
      setMovieData({ title: '', releaseDate: '', description: '' });
      setImageFile(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data || 'Failed to update movie');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBookedMovies = async () => {
    setLoading(true);
    try {
      const response = await HttpService.viewBookedMovies(token);
      setBookedMovies(response.data.shows);
    } catch (err) {
      setError(err.response?.data || 'Failed to fetch booked movies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logOut());
    navigate("/", { replace: true });
  };

  const handlePageStateAdd = () => {
    setState("ADD_MOVIE");
    setError(null);
  }

  const handlePageStateUpdate = () => {
    setState("UPDATE_MOVIE");
    setError(null);
  }

  return (
    <div className="container mt-4">
      <nav className="navbar navbar-light bg-light">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <span className="navbar-brand mb-0 h1">Admin Panel</span>

          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="container mt-5">
        <div className="row">
          <div className="col-6 text-center">
            <button className="btn btn-primary w-100" onClick={handlePageStateAdd}>Add Movie</button>
          </div>

          <div className="col-6 text-center">
            <button className="btn btn-secondary w-100" onClick={handlePageStateUpdate}>Update Movie</button>
          </div>
        </div>
      </div>

      {state === "ADD_MOVIE" ? (
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
              {...getRootProps({ className: "dropzone border p-3 mb-3 text-center" })}
              style={{ border: "2px dashed #007bff", borderRadius: "5px" }}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the image here...</p>
              ) : (
                <p>Drag and drop an image here, or click to select one</p>
              )}
            </div>

            <div className="mb-3">
              <h5>Add Showtimes</h5>
              <div className="mb-3">
                <label htmlFor="theatre_id" className="form-label">Theatre</label>
                <select
                  id="theatre_id"
                  className="form-select"
                  value={newShow.theatre_id}
                  onChange={(e) => setNewShow({ ...newShow, theatre_id: e.target.value })}
                  required
                >
                  <option value="">Select Theatre</option>
                  {theatres && theatres.length > 0 ? (
                    theatres.map((theatre) => (
                      <option key={theatre.id} value={theatre.id}>{theatre.name}</option>
                    ))
                  ) : (
                    <option value="">No theatres available</option>
                  )}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="start_time" className="form-label">Start Time</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  id="start_time"
                  value={newShow.start_time}
                  onChange={(e) => setNewShow({ ...newShow, start_time: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="end_time" className="form-label">End Time</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  id="end_time"
                  value={newShow.end_time}
                  onChange={(e) => setNewShow({ ...newShow, end_time: e.target.value })}
                  required
                />
              </div>

              <button className="btn btn-primary" onClick={handleAddShow}>Add Showtime</button>
            </div>

            {shows.length > 0 && (
              <div className="mb-3">
                <h5>Current Showtimes</h5>
                <ul>
                  {shows.map((show, index) => (
                    <li key={index}>{`Theatre: ${show.theatre_id}, Start: ${show.start_time}, End: ${show.end_time}`}</li>
                  ))}
                </ul>
              </div>
            )}

            <button className="btn btn-success" onClick={handleAddMovie}>
              {loading ? "Adding..." : "Add Movie"}
            </button>
            {error && <p className="text-danger mt-3">{error}</p>}
          </div>
        </div>
      ) : (
        <div>
          {/* Movie Update Form */}
        </div>
      )}
    </div>
  );
};

export default AdminPage;