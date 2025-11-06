/* src/components/ManageUsers.js */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// --- (Helper component for styling user cards) ---
const UserCard = ({ user, children }) => (
    <div className="course-card">
        <div className="course-card-info">
            <h3>{user.name}</h3>
            <p style={{ color: '#a0a0b0', margin: 0 }}>
                Email: {user.email} <br />
                Role: <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{user.role}</span>
            </p>
        </div>
        <div className="admin-button-group">
            {children}
        </div>
    </div>
);

const ManageUsers = () => {
    // --- NEW: State for all three user lists ---
    const [pendingUsers, setPendingUsers] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [suspendedUsers, setSuspendedUsers] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // --- Function to fetch all user data ---
    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            
            // Fetch all three lists in parallel
            const [pendingRes, activeRes, suspendedRes] = await Promise.all([
                axios.get('http://localhost:5000/api/users/pending', config),
                axios.get('http://localhost:5000/api/users/active', config),
                axios.get('http://localhost:5000/api/users/suspended', config)
            ]);
            
            setPendingUsers(pendingRes.data);
            setActiveUsers(activeRes.data);
            setSuspendedUsers(suspendedRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load user lists.');
            setLoading(false);
        }
    };

    // Fetch users on page load
    useEffect(() => {
        fetchAllUsers();
    }, []);

    // --- Action Handlers ---

    const handleApprove = async (user) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`http://localhost:5000/api/users/approve/${user._id}`, null, config);
            
            // Move user from 'pending' to 'active' list in the UI
            setPendingUsers(pendingUsers.filter(u => u._id !== user._id));
            setActiveUsers([user, ...activeUsers]);
            setMessage(`User ${user.name} has been approved.`);
        } catch (err) { setError('Failed to approve user.'); }
    };

    const handleReject = async (userId) => {
        if (!window.confirm('Are you sure you want to REJECT and DELETE this pending user?')) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.delete(`http://localhost:5000/api/users/reject/${userId}`, config);
            
            // Remove user from 'pending' list
            setPendingUsers(pendingUsers.filter(u => u._id !== userId));
            setMessage('Pending user has been rejected and deleted.');
        } catch (err) { setError('Failed to reject user.'); }
    };

    const handleSuspend = async (user) => {
        if (!window.confirm(`Are you sure you want to SUSPEND ${user.name}? They will be unable to log in.`)) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`http://localhost:5000/api/users/suspend/${user._id}`, null, config);

            // Move user from 'active' to 'suspended' list
            setActiveUsers(activeUsers.filter(u => u._id !== user._id));
            setSuspendedUsers([user, ...suspendedUsers]);
            setMessage(`User ${user.name} has been suspended.`);
        } catch (err) { setError('Failed to suspend user.'); }
    };

    const handleReactivate = async (user) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`http://localhost:5000/api/users/reactivate/${user._id}`, null, config);

            // Move user from 'suspended' to 'active' list
            setSuspendedUsers(suspendedUsers.filter(u => u._id !== user._id));
            setActiveUsers([user, ...activeUsers]);
            setMessage(`User ${user.name} has been reactivated.`);
        } catch (err) { setError('Failed to reactivate user.'); }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE ${user.name}? This cannot be undone.`)) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.delete(`http://localhost:5000/api/users/${user._id}`, config);

            // Remove user from whichever list they were in
            setActiveUsers(activeUsers.filter(u => u._id !== user._id));
            setSuspendedUsers(suspendedUsers.filter(u => u._id !== user._id));
            setMessage(`User ${user.name} has been permanently deleted.`);
        } catch (err) { setError('Failed to delete user.'); }
    };

    // --- Render Logic ---
    if (loading) {
        return <div className="dashboard-container"><p>Loading user lists...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <Link to="/admin-dashboard" className="back-link">← Back to Dashboard</Link>
            <h1>Manage All Users</h1>
            
            {message && <p className="form-message" style={{color: '#28a745'}}>{message}</p>}
            {error && <p className="login-error-message">{error}</p>}

            {/* --- SECTION 1: PENDING USERS --- */}
            <h2 style={{marginTop: '2rem'}}>Pending Registrations</h2>
            <p>Approve or reject new users who have signed up.</p>
            <div className="item-list" style={{maxHeight: '300px'}}>
                {pendingUsers.length > 0 ? (
                    pendingUsers.map(user => (
                        <UserCard user={user} key={user._id}>
                            <button onClick={() => handleApprove(user)} className="enroll-button">
                                Approve
                            </button>
                            <button onClick={() => handleReject(user._id)} className="delete-button">
                                Reject
                            </button>
                        </UserCard>
                    ))
                ) : (
                    <p>No pending user registrations found.</p>
                )}
            </div>

            {/* --- SECTION 2: ACTIVE USERS --- */}
            <h2 style={{marginTop: '2rem'}}>Active Users</h2>
            <p>Suspend or permanently remove active students and faculty.</p>
            <div className="item-list" style={{maxHeight: '300px'}}>
                {activeUsers.length > 0 ? (
                    activeUsers.map(user => (
                        <UserCard user={user} key={user._id}>
                            <button onClick={() => handleSuspend(user)} className="leave-button">
                                Suspend
                            </button>
                            <button onClick={() => handleDelete(user)} className="delete-button">
                                Remove
                            </button>
                        </UserCard>
                    ))
                ) : (
                    <p>No active users found.</p>
                )}
            </div>

            {/* --- SECTION 3: SUSPENDED USERS --- */}
            <h2 style={{marginTop: '2rem'}}>Suspended Users</h2>
            <p>Re-activate or permanently remove suspended users.</p>
            <div className="item-list" style={{maxHeight: '300px'}}>
                {suspendedUsers.length > 0 ? (
                    suspendedUsers.map(user => (
                        <UserCard user={user} key={user._id}>
                            <button onClick={() => handleReactivate(user)} className="enroll-button">
                                Re-activate
                            </button>
                            <button onClick={() => handleDelete(user)} className="delete-button">
                                Remove
                            </button>
                        </UserCard>
                    ))
                ) : (
                    <p>No suspended users found.</p>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;