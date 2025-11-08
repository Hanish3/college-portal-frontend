import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // <-- Includes Link
import { jwtDecode } from 'jwt-decode';
// --- DELETED: The 3D scene import ---
// import Scene3D from './Scene3D'; 

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async e => {
        e.preventDefault();
        setError(''); 

        try {
            const res = await axios.post(
                'https://niat-amet-college-portal-api.onrender.com/api/auth/login',
                formData
            );

            const { token } = res.data;
            localStorage.setItem('token', token);
            const decoded = jwtDecode(token);
            const userRole = decoded.user.role;

            // --- THIS IS THE UPDATED REDIRECTION LOGIC ---
            if (userRole === 'admin') {
                navigate('/admin-dashboard');
            } else if (userRole === 'faculty') {
                navigate('/faculty-dashboard'); // <-- Faculty go here
            } else {
                navigate('/student-dashboard');
            }
            // --- END OF UPDATE ---

        } catch (err) {
            console.error(err.response.data);
            setError(err.response?.data?.msg || 'Login Failed. Please try again.');
        }
    };

    return (
        <div id="login-page-container">
            {/* --- DELETED: The 3D Scene component --- */}
            {/* <Scene3D /> */}

            {/* This is the two-column box */}
            <div className="login-layout-box">
                
                {/* --- 1. LEFT SIDE (FORM) --- */}
                <div className="login-form-side">
                    <div className="login-header">
                        <h2>College Portal</h2>
                         <p>Please sign in to continue</p>
                    </div>
                    
                    <form onSubmit={onSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={onChange}
                                placeholder="user@college.edu"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={onChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        
                        {error && <p className="login-error-message">{error}</p>}
                        
                        <button type="submit" className="login-button">Login</button>
                    </form>

                    {/* --- "Register here" Link section --- */}
                    <p style={{textAlign: 'center', marginTop: '1.5rem', color: '#a0a0b0'}}>
                        Don't have an account? 
                        <Link to="/register" style={{color: '#6e8efb', fontWeight: 'bold'}}> Register here</Link>
                    </p>
                    {/* --- END OF Link SECTION --- */}
                </div>

                {/* --- 2. RIGHT SIDE (INFO) --- */}
                <div className="login-info-side">
                    <img src="/amet_niat_logo.png" alt="AMET-NIAT Logo" className="login-info-logo" />
                    <h3>AMET University</h3>
                    <p className="login-info-text">
                        In collaboration with NIAT, offering next-generation programs 
                        in engineering, and technology.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;