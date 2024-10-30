import { unwrapResult } from '@reduxjs/toolkit';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser, selectError, selectLoading } from '../features/authSlice';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        dispatch(registerUser({ username, password, email }))
        .then((result) => {
            const unwrappedResult = unwrapResult(result);
            if (unwrappedResult) {
                navigate('/');
            }
        })
        .catch((err) => {
            console.log(err);
            setErrorMessage(err);
            alert("Registration failed. Please try again.");
        });
    };

    return (
        <div className="register-container d-flex align-items-center justify-content-center">
            <div className="card p-4" style={{ width: '20rem' }}>
                <h3 className="card-title text-center">Register</h3>
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
                        <label htmlFor="email" className="form-label">Email</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            id="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
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
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
                <div className='mt-3'>Already have an account? <a href="/">login</a></div>
            </div>
        </div>
    );
};

export default Register;
