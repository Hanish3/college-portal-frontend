import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
// import Navbar from './Navbar'; // <-- DELETED

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

        const body = JSON.stringify({ title, description, date });

        try {
            await axios.post('http://localhost:5000/api/events', body, config);
            
            setMessage('Event created successfully!');
            setFormData({ title: '', description: '', date: '' });

            setTimeout(() => navigate('/admin-manage-events'), 2000); // Go to manage page

        } catch (err) {
            console.error(err.response.data);
            setMessage('Error: ' + err.response.data.msg);
        }
    };

    return (
        // DELETED parent <div> and <Navbar />
        <div className="dashboard-container">
            <Link to="/admin-manage-events" className="back-link">← Back to Manage Events</Link>
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
    );
};

export default CreateEvent;