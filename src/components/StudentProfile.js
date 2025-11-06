/* src/components/StudentProfile.js */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // <-- 1. IMPORT jwtDecode

const StudentProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate(); // <-- 2. ADD useNavigate
    
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // --- 3. ADD STATE FOR ADMIN ---
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('No token, authorization denied.');
                    setLoading(false);
                    return;
                }
                
                // Check if user is an admin
                const decoded = jwtDecode(token);
                if (decoded.user.role === 'admin') {
                    setIsAdmin(true);
                }

                const config = {
                    headers: { 'x-auth-token': token },
                };
                
                // This route now correctly populates 'courses'
                const res = await axios.get(`http://localhost:5000/api/students/${userId}`, config);
                setProfile(res.data);
                setLoading(false);
            } catch (err) {
                const errMsg = err.response?.data?.msg || 'Failed to fetch profile data.';
                console.error(errMsg);
                setError(`Error: ${errMsg}`);
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    // --- 4. ADD HANDLERS FOR ADMIN ACTIONS ---
    const handleSuspend = async () => {
        if (!window.confirm(`Are you sure you want to SUSPEND ${profile.firstName}? They will be unable to log in.`)) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`http://localhost:5000/api/users/suspend/${userId}`, null, config);
            setMessage('User has been suspended. They must be reactivated from the "Manage Users" page.');
            setError('');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to suspend user.');
            setMessage('');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE ${profile.firstName}? This cannot be undone.`)) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.delete(`http://localhost:5000/api/users/${userId}`, config);
            alert('User has been permanently deleted.');
            navigate('/admin-dashboard'); // Go back to dashboard after deletion
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to delete user.');
        }
    };
    // --- END OF NEW HANDLERS ---


    if (loading) {
        return (
            <div className="profile-container">
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <p className="login-error-message">{error}</p>
            </div>
        );
    }
    
    if (!profile) {
         return (
            <div className="profile-container">
                <p>No profile data found for this user.</p>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-actions">
                <Link to={isAdmin ? "/admin-dashboard" : "/faculty-dashboard"} className="back-link">
                    ← Back to Dashboard
                </Link>
                
                {/* --- Admin & Faculty Buttons --- */}
                <Link 
                    to={`/admin/mark-attendance/${userId}`} 
                    className="action-button" 
                    style={{ backgroundColor: '#28a745' }}
                >
                    Mark Attendance
                </Link>
                <Link 
                    to={`/admin/edit-student/${userId}`} 
                    className="action-button"
                >
                    Edit Profile
                </Link>

                {/* --- 5. ADMIN-ONLY BUTTONS --- */}
                {isAdmin && (
                    <>
                        <button 
                            onClick={handleSuspend}
                            className="action-button" 
                            style={{ backgroundColor: '#f0ad4e', color: '#333' }}
                        >
                            Suspend User
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="action-button" 
                            style={{ backgroundColor: '#d9534f' }}
                        >
                            Remove User
                        </button>
                    </>
                )}
            </div>
            
            {message && <p className="form-message" style={{color: '#28a745'}}>{message}</p>}
            
            <div className="text-center mb-8">
                <h1>{profile.firstName} {profile.surname}</h1>
                <img 
                    src={profile.photo || "/default-avatar.png"} 
                    alt="avatar" 
                    className="profile-avatar" 
                    onError={(e) => { e.target.onerror = null; e.target.src="/default-avatar.png" }}
                />
            </div>
            
            <section className="space-y-6">
                <div>
                    <h2>Personal Details</h2>
                    <p><strong>First Name:</strong> {profile.firstName}</p>
                    <p><strong>Surname:</strong> {profile.surname}</p>
                    <p><strong>Registered Email:</strong> {profile.email}</p>
                    <p><strong>Personal Email:</strong> {profile.personalEmail || 'Not set'}</p>
                    <p><strong>Mobile Number:</strong> {profile.mobileNumber || 'Not set'}</p>
                    <p><strong>WhatsApp Number:</strong> {profile.isWhatsappSame ? profile.mobileNumber : (profile.whatsappNumber || 'Not set')}</p>
                </div>
                
                {/* --- 6. NEW ENROLLED COURSES SECTION --- */}
                <div>
                    <h2>Enrolled Courses</h2>
                    <div className="item-list" style={{maxHeight: '200px'}}>
                        {profile.courses && profile.courses.length > 0 ? (
                            profile.courses.map(course => (
                                <div key={course._id} className="course-card">
                                    <div className="course-card-info">
                                        <h3>{course.code} - {course.title}</h3>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>This student is not enrolled in any courses.</p>
                        )}
                    </div>
                </div>
                {/* --- END OF NEW SECTION --- */}

                <div>
                    <h2>Confidential Information</h2>
                    <p><strong>Family Income:</strong> ${profile.familyIncome || 'Not set'}</p>
                </div>

                <div>
                    <h2>Academic Details</h2>
                    <p><strong>Marks:</strong> {profile.marks || 'Not set'}</p>
                </div>

                <div>
                    <h2>Certificates</h2>
                    {profile.certificates && profile.certificates.length > 0 ? (
                        <ul>
                            {profile.certificates.map((cert, index) => (
                                <li key={cert._id || index}>
                                    {cert.title} - <a href={cert.url} target="_blank" rel="noopener noreferrer">View Certificate</a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No certificates uploaded.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default StudentProfile;