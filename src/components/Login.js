import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
                'http://localhost:5000/api/auth/login',
                formData
            );

            const { token } = res.data;
            localStorage.setItem('token', token);
            const decoded = jwtDecode(token);
            const userRole = decoded.user.role;

            if (userRole === 'admin' || userRole === 'faculty') {
                navigate('/admin-dashboard');
            } else {
                navigate('/student-dashboard');
            }

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