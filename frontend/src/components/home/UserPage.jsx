import React from 'react';
import MovieCarousel from '../carousal/MovieCarousal';
import { useDispatch } from 'react-redux';
import { logOut } from '../../features/authSlice';
import { useNavigate } from 'react-router-dom';

const UserPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logOut());
    navigate("/", { replace: true });
  };

  return (
    <div>
      <nav className="navbar navbar-light bg-light">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <span className="navbar-brand mb-0 h1">Home Page</span>

          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      <MovieCarousel />
    </div>
  )
}

export default UserPage;
