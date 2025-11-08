/* src/components/StudentDashboard.js */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // <-- IMPORT jwtDecode

const StudentDashboard = () => {
    const [events, setEvents] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- NEW STATE FOR SUSPENSION ---
    const [isSuspended, setIsSuspended] = useState(false);
    const [suspensionMessage, setSuspensionMessage] = useState('');
    // --- THIS IS THE FIX: 'setUserName' is removed ---
    const [userName] = useState('Student');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }
                
                // Set the user's name from the token
                try {
                    // --- THIS IS THE FIX: 'decoded' is removed ---
                    jwtDecode(token);
                    // We need a user model/profile to get the name, 
                    // but for this dashboard, we can just use a placeholder
                } catch (e) { console.error("Error decoding token:", e); }


                const config = {
                    headers: { 'x-auth-token': token },
                };
                
                // --- THIS WILL NOW BE BLOCKED BY THE MIDDLEWARE IF SUSPENDED ---
                const [eventsRes, notificationsRes] = await Promise.all([
                    axios.get('https://niat-amet-college-portal-api.onrender.com/api/events', config),
                    axios.get('https://niat-amet-college-portal-api.onrender.com/api/notifications', config)
                ]);
                
                setEvents(eventsRes.data);
                setNotifications(notificationsRes.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                
                // --- THIS IS THE CRITICAL CHANGE ---
                // Check if the error is the 403 (Forbidden) from our new middleware
                if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                    setIsSuspended(true);
                    setSuspensionMessage(err.response.data.msg || 'Your account is suspended.');
                }
                // --- END CHANGE ---
                
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return <div className="dashboard-container"><p>Loading dashboard...</p></div>;
    }

    // --- RENDER THE SUSPENSION MESSAGE ---
    if (isSuspended) {
        return (
            <div className="dashboard-container">
                <h1>Welcome, {userName}!</h1>
                <div 
                    className="login-error-message" 
                    style={{
                        textAlign: 'center', 
                        padding: '2rem', 
                        fontSize: '1.2rem'
                    }}
                >
                    {suspensionMessage}
                    <p style={{fontSize: '1rem', color: '#e0e0e0', marginTop: '1rem'}}>
                        Please contact an administrator to resolve this issue.
                    </p>
                </div>
            </div>
        );
    }
    // --- END RENDER ---

    return (
        <div className="dashboard-container">
            
            <h1>Welcome, Student!</h1>
            <p>This is your dashboard. See your events and notifications below.</p>

            {/* --- SURVEY COMPONENT REMOVED FROM HERE --- */}

            <div className="dashboard-columns" style={{marginTop: '2rem'}}>
                {/* --- EVENTS COLUMN --- */}
                <div className="dashboard-column">
                    <h2>Upcoming Events</h2>
                    <div className="item-list">
                        {events.length > 0 ? (
                            events.map(event => (
                                <div key={event._id} className="item-card">
                                    <h3>{event.title}</h3>
                                    <p className="item-date">{formatDate(event.date)}</p>
                                    <p>{event.description}</p>
                                </div>
                            ))
                        ) : (
                            <p>No upcoming events.</p>
                        )}
                    </div>
                </div>
                {/* --- NOTIFICATIONS COLUMN --- */}
                <div className="dashboard-column">
                    <h2>Notifications</h2>
                    <div className="item-list">
                        {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <div key={notification._id} className="item-card">
                                    <h3>{notification.title}</h3>
                                    <p className="item-date">{formatDate(notification.date)}</p>
                                    <p>{notification.message}</p>
                                </div>
                            ))
                        ) : (
                            <p>No new notifications.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;