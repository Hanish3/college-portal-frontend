import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';

const CreateEvent = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const { title, description, date } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
        };

        // The date needs to be in the correct format
        const body = JSON.stringify({ title, description, date });

        try {
            await axios.post('http://localhost:5000/api/events', body, config);
            
            setMessage('Event created successfully!');
            // Clear the form
            setFormData({ title: '', description: '', date: '' });

            // Optional: redirect back to admin dashboard after a delay
            setTimeout(() => navigate('/admin-dashboard'), 2000);

        } catch (err) {
            console.error(err.response.data);
            setMessage('Error: ' + err.response.data.msg);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="dashboard-container">
                <Link to="/admin-dashboard" className="back-link">← Back to Dashboard</Link>
                <h1>Create New Event</h1>
                <p>Fill out the form below to post a new event for students.</p>

                <form className="admin-form" onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Event Title</label>
                        <input
                            type="text"
                            name="title"
                            value={title}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={description}
                            onChange={onChange}
                            required
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label>Event Date</label>
                        <input
                            type="date"
                            name="date"
                            value={date}
                            onChange={onChange}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="form-submit-button">Create Event</button>
                    
                    {message && <p className="form-message">{message}</p>}
                </form>
            </div>
        </div>
    );
};

export default CreateEvent;