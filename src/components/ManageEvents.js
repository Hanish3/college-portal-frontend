/* src/components/ManageEvents.js */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // <-- 1. IMPORT jwtDecode

const ManageEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- 2. ADD STATE FOR DASHBOARD PATH ---
    const [dashboardPath, setDashboardPath] = useState('/student-dashboard');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                
                // --- 3. SET THE CORRECT DASHBOARD PATH ---
                if (token) {
                    const decoded = jwtDecode(token);
                    if (decoded.user.role === 'admin') {
                        setDashboardPath('/admin-dashboard');
                    } else if (decoded.user.role === 'faculty') {
                        setDashboardPath('/faculty-dashboard');
                    }
                }
                
                const config = {
                    headers: { 'x-auth-token': token },
                };
                const res = await axios.get('http://localhost:5000/api/events', config);
                const sortedEvents = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setEvents(sortedEvents);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching events:', err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatDate = (dateString) => {
        // ... (this function is unchanged) ...
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleDelete = async (eventId) => {
        // ... (this function is unchanged) ...
         if (!window.confirm('Are you sure you want to permanently delete this event?')) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'x-auth-token': token },
            };
            await axios.delete(`http://localhost:5000/api/events/${eventId}`, config);
            setEvents(events.filter(event => event._id !== eventId));
            alert('Event deleted successfully.');
        } catch (err) {
            console.error('Error deleting event:', err);
            alert('Error: ' + (err.response.data.msg || 'Could not delete event.'));
        }
    };

    if (loading) {
        return <div className="dashboard-container"><p>Loading events...</p></div>;
    }

    return (
        <div className="dashboard-container">
            {/* --- 4. USE THE DYNAMIC DASHBOARD PATH --- */}
            <Link to={dashboardPath} className="back-link">← Back to Dashboard</Link>
            
            <h1>Manage Events</h1>
            <p>Here you can view, edit, and delete all past and upcoming events.</p>

            <div className="admin-actions" style={{ marginBottom: '2rem' }}>
                <Link to="/admin-create-event" className="action-button" style={{backgroundColor: '#28a745'}}>
                    + Create New Event
                </Link>
            </div>

            <div className="item-list">
                {events.length > 0 ? (
                    events.map(event => (
                        <div key={event._id} className="course-card">
                            <div className="course-card-info">
                                <h3>{event.title}</h3>
                                <p className="item-date">{formatDate(event.date)}</p>
                                <p>{event.description}</p>
                            </div>
                            <button 
                                onClick={() => handleDelete(event._id)}
                                className="delete-button"
                            >
                                Delete
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No events found.</p>
                )}
            </div>
        </div>
    );
};

export default ManageEvents;