/* src/components/EditEvent.js (NEW FILE) */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';

const EditEvent = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
    });
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const { eventId } = useParams(); // Get the ID from the URL
    const navigate = useNavigate();

    // 1. Fetch the existing event data
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                
                // Use the new GET /api/events/:id route
                const res = await axios.get(`http://localhost:5000/api/events/${eventId}`, config);

                // Format the date for the HTML date input
                const formattedDate = res.data.date ? new Date(res.data.date).toISOString().split('T')[0] : '';
                
                setFormData({
                    title: res.data.title || '',
                    description: res.data.description || '',
                    date: formattedDate,
                });
                
                setLoading(false);
            } catch (err) {
                console.error(err);
                setStatusMessage('Error: Could not load event data.');
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId]); // Re-run if ID changes

    const { title, description, date } = formData;
    
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    // 2. Submit the *updated* data
    const onSubmit = async e => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
        };
        
        try {
            // Use the new PUT /api/events/:id route
            await axios.put(`http://localhost:5000/api/events/${eventId}`, formData, config);
            
            setStatusMessage('Event updated successfully!');
            setTimeout(() => navigate('/admin-manage-events'), 2000); // Go back to the list

        } catch (err) {
            console.error(err.response.data);
            setStatusMessage('Error: ' + (err.response.data.msg || 'Server Error'));
        }
    };

    if (loading) {
        return <div className="dashboard-container"><p>Loading event for editing...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <Link to="/admin-manage-events" className="back-link">← Back to Manage Events</Link>
            <h1>Edit Event</h1>
            <p>Update the details for this event.</p>

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
                
                <button type="submit" className="form-submit-button">Save Changes</button>
                
                {statusMessage && <p className="form-message">{statusMessage}</p>}
            </form>
        </div>
    );
};

export default EditEvent;