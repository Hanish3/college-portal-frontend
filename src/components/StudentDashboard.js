import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Already here
import Navbar from './Navbar'; // <-- 1. IMPORTED NAVBAR

const StudentDashboard = () => {
    // ... all your state and useEffect code ...
    const [events, setEvents] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get the token from localStorage
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return; // Can't fetch data if not logged in
                }

                // 2. Create the auth headers
                const config = {
                    headers: {
                        'x-auth-token': token,
                    },
                };

                // 3. Fetch both sets of data in parallel
                const [eventsRes, notificationsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/events', config),
                    axios.get('http://localhost:5000/api/notifications', config)
                ]);

                // 4. Set the data in our state
                setEvents(eventsRes.data);
                setNotifications(notificationsRes.data);
                setLoading(false);

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setLoading(false);
            }
        };

        fetchData();
    }, []); // The empty array [] means this runs only once

    // Helper function to format the date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        // Also wrap the loading state with Navbar
        return (
            <div>
                <Navbar />
                <div className="dashboard-container"><p>Loading dashboard...</p></div>
            </div>
        );
    }

    return (
        <div> {/* <-- 2. WRAPPED IN A PARENT DIV */}
            <Navbar /> {/* <-- 3. ADDED THE NAVBAR */}
            
            {/* The rest of your dashboard component */}
            <div className="dashboard-container">
    {/* We reuse the 'profile-actions' style from the admin page */}
    <div className="profile-actions"> 
        <Link to="/student/edit-profile" className="action-button" style={{backgroundColor: '#5bc0de'}}>
            Edit My Profile
             </Link>
             <Link to="/curriculum" className="nav-link">View Curriculum →</Link>
               </div>

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
        </div>
    );
};

export default StudentDashboard;