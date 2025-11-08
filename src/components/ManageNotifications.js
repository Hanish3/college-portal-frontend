/* src/components/ManageNotifications.js */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // <-- 1. IMPORT jwtDecode

const ManageNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 2. ADD STATE FOR DASHBOARD PATH ---
    const [dashboardPath, setDashboardPath] = useState('/student-dashboard');

    useEffect(() => {
        const fetchAllNotifications = async () => {
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
                const res = await axios.get('https://niat-amet-college-portal-api.onrender.com/api/notifications', config);
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
        // ... (this function is unchanged) ...
         const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleDelete = async (notificationId) => {
        // ... (this function is unchanged) ...
        if (!window.confirm('Are you sure you want to permanently delete this notification?')) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'x-auth-token': token },
            };
            await axios.delete(`https://niat-amet-college-portal-api.onrender.com/api/notifications/${notificationId}`, config);
            setNotifications(notifications.filter(notif => notif._id !== notificationId));
            alert('Notification deleted successfully.');
        } catch (err) {
            console.error('Error deleting notification:', err);
            alert('Error: ' + (err.response.data.msg || 'Could not delete notification.'));
        }
    };

    if (loading) {
        return <div className="dashboard-container"><p>Loading notifications...</p></div>;
    }

    return (
        <div className="dashboard-container">
            {/* --- 4. USE THE DYNAMIC DASHBOARD PATH --- */}
            <Link to={dashboardPath} className="back-link">← Back to Dashboard</Link>
            
            <h1>Manage Notifications</h1>
            <p>Here you can view and delete all sent notifications.</p>

            <div className="admin-actions" style={{ marginBottom: '2rem' }}>
                <Link to="/admin-create-notification" className="action-button" style={{backgroundColor: '#28a745'}}>
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