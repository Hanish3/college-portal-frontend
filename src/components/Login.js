import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // IMPORT THIS
import { jwtDecode } from 'jwt-decode'; // IMPORT THIS

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const navigate = useNavigate(); // ADD THIS HOOK

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- THIS IS THE UPDATED ONSUBMIT FUNCTION ---
    const onSubmit = async e => {
        e.preventDefault();

        try {
            const res = await axios.post(
                'http://localhost:5000/api/auth/login',
                formData
            );

            // --- ALL THIS IS NEW ---
            // 1. Get the token from the response
            const { token } = res.data;

            // 2. Save the token to localStorage (so we can stay logged in)
            localStorage.setItem('token', token);

            // 3. Decode the token to get the user's role
            const decoded = jwtDecode(token);
            const userRole = decoded.user.role; // This gets 'student', 'admin', etc.

            // 4. Redirect based on the role
            if (userRole === 'admin' || userRole === 'faculty') {
                navigate('/admin-dashboard');
            } else {
                navigate('/student-dashboard');
            }
            // --- END OF NEW CODE ---

        } catch (err) {
            console.error(err.response.data);
            alert('Login Failed: ' + err.response.data.msg);
        }
    };

    return (
        <div className="login-container">
            {/* ...the rest of your form JSX is unchanged... */}
            <h2>Login</h2>
            <form onSubmit={onSubmit}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={onChange}
                        required
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={onChange}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;