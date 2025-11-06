/* src/components/CreateUser.js */
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const CreateUser = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student', // Default role is student
    });
    const [statusMessage, setStatusMessage] = useState('');
    const navigate = useNavigate();

    const { name, email, password, role } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setStatusMessage('Creating user...');
        
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
        };

        const body = JSON.stringify({ name, email, password, role });

        try {
            // We use the 'api/auth/register' route we discussed
            await axios.post('http://localhost:5000/api/auth/register', body, config);
            
            setStatusMessage(`User '${name}' created successfully as a ${role}!`);
            setFormData({ name: '', email: '', password: '', role: 'student' }); // Reset form

            // After 2 seconds, redirect to the main admin dashboard
            setTimeout(() => navigate('/admin-dashboard'), 2000);

        } catch (err) {
            console.error(err.response.data);
            setStatusMessage('Error: ' + (err.response?.data?.msg || 'Server Error'));
        }
    };

    return (
        <div className="dashboard-container">
            <Link to="/admin-dashboard" className="back-link">← Back to Dashboard</Link>
            <h1>Create New User</h1>
            <p>Add a new student, faculty, or admin to the system.</p>

            <form className="admin-form" onSubmit={onSubmit}>
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
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        placeholder="e.g., priya.k@student.amet.in"
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
                        placeholder="Set a temporary password"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Role</label>
                    <select name="role" value={role} onChange={onChange}>
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                
                <button type="submit" className="form-submit-button">Create User</button>
                
                {statusMessage && <p className="form-message">{statusMessage}</p>}
            </form>
        </div>
    );
};

export default CreateUser;