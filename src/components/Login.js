import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
    // 'formData' will hold the email and password from our form
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // This function runs every time the user types in an input box
    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // This function runs when the user clicks the "Login" button
    const onSubmit = async e => {
        e.preventDefault(); // Prevents the form from refreshing the page

        try {
            // We're 'POST'ing the formData to our backend's login endpoint
            const res = await axios.post(
                'http://localhost:5000/api/auth/login', // Our backend API URL
                formData // The email and password
            );

            // If login is successful, the server sends back a token
            console.log('Login successful!', res.data);
            alert('Login Successful!');
            // In a real app, we would save this token:
            // localStorage.setItem('token', res.data.token);

        } catch (err) {
            // If the server sends a 400 (Invalid Credentials) or 500 error
            console.error(err.response.data);
            alert('Login Failed: ' + err.response.data.msg);
        }
    };

    return (
        <div className="login-container">
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