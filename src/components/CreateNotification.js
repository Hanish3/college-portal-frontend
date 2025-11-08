import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
// import Navbar from './Navbar'; // <-- DELETED

const CreateNotification = () => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        recipient: 'all',
    });
    const [statusMessage, setStatusMessage] = useState('');
    const navigate = useNavigate();

    const { title, message, recipient } = formData;

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

        const body = JSON.stringify({ title, message, recipient });

        try {
            await axios.post('https://niat-amet-college-portal-api.onrender.com/api/notifications', body, config);
            
            setStatusMessage('Notification sent successfully!');
            setFormData({ title: '', message: '', recipient: 'all' });

            setTimeout(() => navigate('/admin-manage-notifications'), 2000); // Go to manage page

        } catch (err) {
            console.error(err.response.data);
            setStatusMessage('Error: ' + (err.response.data.msg || 'Server Error'));
        }
    };

    return (
        // DELETED parent <div> and <Navbar />
        <div className="dashboard-container">
            <Link to="/admin-manage-notifications" className="back-link">← Back to Manage Notifications</Link>
            <h1>Send New Notification</h1>
            <p>This message will appear on the student dashboard.</p>

            <form className="admin-form" onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input
                        type="text"
                        name="title"
                        value={title}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Message</label>
                    <textarea
                        name="message"
                        value={message}
                        onChange={onChange}
                        required
                    ></textarea>
                </div>
                <div className="form-group">
                    <label>Recipient</label>
                    <input
                        type="text"
                        name="recipient"
                        value={recipient}
                        onChange={onChange}
                        placeholder="Type 'all' or a specific User ID"
                        required
                    />
                </div>
                
                <button type="submit" className="form-submit-button">Send Notification</button>
                
                {statusMessage && <p className="form-message">{statusMessage}</p>}
            </form>
        </div>
    );
};

export default CreateNotification;