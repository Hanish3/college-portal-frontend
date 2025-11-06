/* src/components/Register.js */
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student', // Default role
    });
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const navigate = useNavigate();

    const { name, email, password, confirmPassword, role } = formData;

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setStatusMessage('');

        // 1. Check if passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const newUser = { name, email, password, role };
            const body = JSON.stringify(newUser);
            const config = {
                headers: { 'Content-Type': 'application/json' }
            };

            // 2. Call the register API
            const res = await axios.post(
                'http://localhost:5000/api/auth/register',
                body,
                config
            );

            // 3. Show success message from the server
            setStatusMessage(res.data.msg || 'Registration successful!');
            
            // Clear form
            setFormData({
                name: '', email: '', password: '', 
                confirmPassword: '', role: 'student'
            });

            // 4. Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            console.error(err.response.data);
            setError(err.response?.data?.msg || 'Registration failed. Please try again.');
        }
    };

    return (
        <div id="login-page-container">
            <div className="login-layout-box">
                
                {/* --- 1. LEFT SIDE (FORM) --- */}
                <div className="login-form-side">
                    <div className="login-header">
                        <h2>Create Account</h2>
                         <p>Join the college portal</p>
                    </div>
                    
                    <form onSubmit={onSubmit}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={name}
                                onChange={onChange}
                                placeholder="e.g., Priya Kumar"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={email}
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
                                value={password}
                                onChange={onChange}
                                placeholder="••••••••"
                                minLength="6"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={onChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>I am a...</label>
                            <select name="role" value={role} onChange={onChange} style={{ width: '100%', padding: '0.75rem 1rem' }}>
                                <option value="student">Student</option>
                                <option value="faculty">Faculty / Teacher</option>
                            </select>
                        </div>
                        
                        {error && <p className="login-error-message">{error}</p>}
                        {statusMessage && <p className="form-message">{statusMessage}</p>}
                        
                        <button type="submit" className="login-button">Register</button>
                    </form>

                    <p style={{textAlign: 'center', marginTop: '1.5rem', color: '#a0a0b0'}}>
                        Already have an account? 
                        <Link to="/login" style={{color: '#6e8efb', fontWeight: 'bold'}}> Login here</Link>
                    </p>
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

export default Register;