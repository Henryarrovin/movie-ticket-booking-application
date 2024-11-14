import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectError, selectLoading } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import { unwrapResult } from '@reduxjs/toolkit';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        dispatch(loginUser({ username, password }))
        .then((result) => {
            const unwrappedResult = unwrapResult(result);
            if (unwrappedResult && unwrappedResult.access) {
                navigate('/home');
            }
        })
        .catch((err) => {
            console.error(err);
            setErrorMessage(err);
            alert("Invalid username or password. Please try again.");
        });
    };

    return (
        <div className="login-container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <div className="card p-4" style={{ width: '20rem' }}>
                <h3 className="card-title text-center">Login</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Username</label>
                        <input 
                        type="text" 
                        className="form-control" 
                        id="username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input 
                        type="password" 
                        className="form-control" 
                        id="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        />
                    </div>
                    {error && <div className="alert alert-danger">{errorMessage}</div>}
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <div className='mt-3'>Don't have an account? <a href="/register">register</a></div>
            </div>
        </div>
    );
};

export default Login;
