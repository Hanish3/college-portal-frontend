/* src/components/ManageUsers.js */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 

// --- (Helper component is unchanged) ---
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
    const [isAdmin, setIsAdmin] = useState(false);
    
    // --- UPDATED: State for all lists ---
    const [pendingStudents, setPendingStudents] = useState([]);
    const [pendingFaculty, setPendingFaculty] = useState([]);
    const [pendingAdmins, setPendingAdmins] = useState([]); // <-- NEW LIST
    const [activeUsers, setActiveUsers] = useState([]);
    const [suspendedUsers, setSuspendedUsers] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAllUsers = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };

                const decoded = jwtDecode(token);
                const userIsAdmin = decoded.user.role === 'admin';
                setIsAdmin(userIsAdmin);
                
                // EVERYONE (Admin+Faculty) gets pending students
                const studentRes = await axios.get('http://localhost:5000/api/users/pending/students', config);
                setPendingStudents(studentRes.data);

                // ONLY ADMINS get the other lists
                if (userIsAdmin) {
                    const [facultyRes, adminRes, activeRes, suspendedRes] = await Promise.all([
                        axios.get('http://localhost:5000/api/users/pending/faculty', config),
                        axios.get('http://localhost:5000/api/users/pending/admins', config), // <-- Fetch pending admins
                        axios.get('http://localhost:5000/api/users/active', config),
                        axios.get('http://localhost:5000/api/users/suspended', config)
                    ]);
                    setPendingFaculty(facultyRes.data);
                    setPendingAdmins(adminRes.data); // <-- Set pending admins
                    setActiveUsers(activeRes.data);
                    setSuspendedUsers(suspendedRes.data);
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load user lists.');
                setLoading(false);
            }
        };
        fetchAllUsers();
    }, []); 

    // --- Action Handlers (UPDATED) ---

    const handleApprove = async (user) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`http://localhost:5000/api/users/approve/${user._id}`, null, config);
            
            // Remove from correct pending list
            if (user.role === 'student') {
                setPendingStudents(pendingStudents.filter(u => u._id !== user._id));
            } else if (user.role === 'faculty') {
                setPendingFaculty(pendingFaculty.filter(u => u._id !== user._id));
            } else if (user.role === 'admin') {
                setPendingAdmins(pendingAdmins.filter(u => u._id !== user._id));
            }
            
            // Admins don't show up in the 'active' list, so only add if not admin
            if (user.role !== 'admin') {
                setActiveUsers([user, ...activeUsers]);
            }
            setMessage(`User ${user.name} has been approved.`);
        } catch (err) { setError(err.response?.data?.msg || 'Failed to approve user.'); }
    };

    const handleReject = async (user) => {
        if (!window.confirm('Are you sure you want to REJECT and DELETE this pending user?')) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.delete(`http://localhost:5000/api/users/reject/${user._id}`, config);
            
            if (user.role === 'student') {
                setPendingStudents(pendingStudents.filter(u => u._id !== user._id));
            } else if (user.role === 'faculty') {
                setPendingFaculty(pendingFaculty.filter(u => u._id !== user._id));
            } else if (user.role === 'admin') {
                setPendingAdmins(pendingAdmins.filter(u => u._id !== user._id));
            }
            setMessage('Pending user has been rejected and deleted.');
        } catch (err) { setError(err.response?.data?.msg || 'Failed to reject user.'); }
    };

    // --- (Admin-only actions are unchanged) ---
    const handleSuspend = async (user) => {
        // ... (code is correct)
        if (!window.confirm(`Are you sure you want to SUSPEND ${user.name}? They will be unable to log in.`)) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`http://localhost:5000/api/users/suspend/${user._id}`, null, config);
            setActiveUsers(activeUsers.filter(u => u._id !== user._id));
            setSuspendedUsers([user, ...suspendedUsers]);
            setMessage(`User ${user.name} has been suspended.`);
        } catch (err) { setError('Failed to suspend user.'); }
    };
    const handleReactivate = async (user) => {
        // ... (code is correct)
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`http://localhost:5000/api/users/reactivate/${user._id}`, null, config);
            setSuspendedUsers(suspendedUsers.filter(u => u._id !== user._id));
            setActiveUsers([user, ...activeUsers]);
            setMessage(`User ${user.name} has been reactivated.`);
        } catch (err) { setError('Failed to reactivate user.'); }
    };
    const handleDelete = async (user) => {
        // ... (code is correct)
        if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE ${user.name}? This cannot be undone.`)) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.delete(`http://localhost:5000/api/users/${user._id}`, config);
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
            <Link to={isAdmin ? "/admin-dashboard" : "/faculty-dashboard"} className="back-link">
                ← Back to Dashboard
            </Link>
            <h1>Manage User Registrations</h1>
            
            {message && <p className="form-message" style={{color: '#28a745'}}>{message}</p>}
            {error && <p className="login-error-message">{error}</p>}

            {/* --- SECTION 1: PENDING STUDENTS (Admin + Faculty) --- */}
            <h2 style={{marginTop: '2rem'}}>Pending Student Requests</h2>
            <p>Approve or reject new students who have signed up.</p>
            <div className="item-list" style={{maxHeight: '300px'}}>
                {pendingStudents.length > 0 ? (
                    pendingStudents.map(user => (
                        <UserCard user={user} key={user._id}>
                            <button onClick={() => handleApprove(user)} className="enroll-button">
                                Approve
                            </button>
                            <button onClick={() => handleReject(user)} className="delete-button">
                                Reject
                            </button>
                        </UserCard>
                    ))
                ) : (
                    <p>No pending student registrations found.</p>
                )}
            </div>

            {/* --- ALL SECTIONS BELOW ARE ADMIN-ONLY --- */}
            {isAdmin && (
                <>
                    {/* --- SECTION 2: PENDING FACULTY (Admin-Only) --- */}
                    <h2 style={{marginTop: '2rem'}}>Pending Faculty Requests</h2>
                    <p>Approve or reject new faculty who have signed up.</p>
                    <div className="item-list" style={{maxHeight: '300px'}}>
                        {pendingFaculty.length > 0 ? (
                            pendingFaculty.map(user => (
                                <UserCard user={user} key={user._id}>
                                    <button onClick={() => handleApprove(user)} className="enroll-button">
                                        Approve
                                    </button>
                                    <button onClick={() => handleReject(user)} className="delete-button">
                                        Reject
                                    </button>
                                </UserCard>
                            ))
                        ) : (
                            <p>No pending faculty registrations found.</p>
                        )}
                    </div>
                    
                    {/* --- SECTION 3: PENDING ADMINS (Admin-Only) --- */}
                    <h2 style={{marginTop: '2rem'}}>Pending Admin Requests</h2>
                    <p>Approve or reject new admins who have signed up.</p>
                    <div className="item-list" style={{maxHeight: '300px'}}>
                        {pendingAdmins.length > 0 ? (
                            pendingAdmins.map(user => (
                                <UserCard user={user} key={user._id}>
                                    <button onClick={() => handleApprove(user)} className="enroll-button">
                                        Approve
                                    </button>
                                    <button onClick={() => handleReject(user)} className="delete-button">
                                        Reject
                                    </button>
                                </UserCard>
                            ))
                        ) : (
                            <p>No pending admin registrations found.</p>
                        )}
                    </div>

                    {/* --- SECTION 4: ACTIVE USERS (Admin-Only) --- */}
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

                    {/* --- SECTION 5: SUSPENDED USERS (Admin-Only) --- */}
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
                </>
            )}
        </div>
    );
};

export default ManageUsers;