import React, { useState, useEffect } from 'react';
import axios from 'axios';
// We no longer need the 'Link' component, so we can remove it
// import { Link } from 'react-router-dom'; 

const StudentDashboard = () => {
    const [events, setEvents] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }
                const config = {
                    headers: { 'x-auth-token': token },
                };
                const [eventsRes, notificationsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/events', config),
                    axios.get('http://localhost:5000/api/notifications', config)
                ]);
                setEvents(eventsRes.data);
                setNotifications(notificationsRes.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
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

    return (
        <div className="dashboard-container">
            
            {/* --- THIS WHOLE DIV IS NOW DELETED ---
            <div className="profile-actions"> 
                <Link to="/student/edit-profile" className="action-button" style={{backgroundColor: '#5bc0de'}}>
                    Edit My Profile
                </Link>
                <Link to="/curriculum" className="nav-link">View Curriculum →</Link>
            </div>
            --- END OF DELETED SECTION --- */}

            <h1>Welcome, Student!</h1>
            <p>This is your dashboard. See your events and notifications below.</p>
            <div className="dashboard-columns">
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