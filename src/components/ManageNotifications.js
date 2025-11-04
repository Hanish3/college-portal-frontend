import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

const ManageNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { 'x-auth-token': token },
                };

                // We need to fetch ALL notifications, not just 'all'
                const res = await axios.get('http://localhost:5000/api/notifications', config);
                
                // Sort by date, newest first (which our API already does)
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
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // The Delete Function
    const handleDelete = async (notificationId) => {
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
        return (
            <div>
                <Navbar />
                <div className="dashboard-container"><p>Loading notifications...</p></div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
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
        </div>
    );
};

export default ManageNotifications;