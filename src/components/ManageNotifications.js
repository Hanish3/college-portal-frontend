import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
// import Navbar from './Navbar'; // <-- DELETED

const ManageNotifications = () => {
    // ... (your existing useState/useEffect code is perfect) ...
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { 'x-auth-token': token },
                };
                const res = await axios.get('http://localhost:5000/api/notifications', config);
                setNotifications(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching notifications:', err);
                setLoading(false);
            }
        };
        fetchAllNotifications();
    }, []);

    const formatDate = (dateString) => {
        // ... (your existing formatDate code is perfect) ...
         const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleDelete = async (notificationId) => {
        // ... (your existing handleDelete code is perfect) ...
        if (!window.confirm('Are you sure you want to permanently delete this notification?')) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'x-auth-token': token },
            };
            await axios.delete(`http://localhost:5000/api/notifications/${notificationId}`, config);
            setNotifications(notifications.filter(notif => notif._id !== notificationId));
            alert('Notification deleted successfully.');
        } catch (err) {
            console.error('Error deleting notification:', err);
            alert('Error: ' + (err.response.data.msg || 'Could not delete notification.'));
        }
    };

    if (loading) {
        // REMOVED NAVBAR AND PARENT DIV
        return <div className="dashboard-container"><p>Loading notifications...</p></div>;
    }

    return (
        // REMOVED NAVBAR AND PARENT DIV
        <div className="dashboard-container">
            <Link to="/admin-dashboard" className="back-link">← Back to Dashboard</Link>
            <h1>Manage Notifications</h1>
            <p>Here you can view, edit, and delete all notifications.</p>

            <div className="admin-actions" style={{ marginBottom: '2rem' }}>
                <Link to="/admin-create-notification" className="action-button">
                    + Send New Notification
                </Link>
            </div>

            <div className="item-list">
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <div key={notif._id} className="course-card">
                            <div className="course-card-info">
                                <h3>{notif.title} (To: {notif.recipient})</h3>
                                <p className="item-date">{formatDate(notif.date)}</p>
                                <p>{notif.message}</p>
                            </div>
                            <button 
                                onClick={() => handleDelete(notif._id)}
                                className="delete-button"
                            >
                                Delete
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No notifications found.</p>
                )}
            </div>
        </div>
    );
};

export default ManageNotifications;