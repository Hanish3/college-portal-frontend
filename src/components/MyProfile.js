/* src/components/MyProfile.js (NEW FILE) */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- (State for suspension is unchanged) ---
    const [isSuspended, setIsSuspended] = useState(false);
    const [suspensionMessage, setSuspensionMessage] = useState('');

    useEffect(() => {
        const fetchMyProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('No token, authorization denied.');
                    setLoading(false);
                    return;
                }
                const config = {
                    headers: { 'x-auth-token': token },
                };
                
                const res = await axios.get(`http://localhost:5000/api/students/me`, config);
                setProfile(res.data);
                setLoading(false);
            } catch (err) {
                // --- (Suspension check is unchanged) ---
                if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                    setIsSuspended(true);
                    setSuspensionMessage(err.response.data.msg || 'Your account is suspended.');
                } else {
                    const errMsg = err.response?.data?.msg || 'Failed to fetch profile data.';
                    console.error(errMsg);
                    setError(`Error: ${errMsg}`);
                }
                setLoading(false);
            }
        };
        fetchMyProfile();
    }, []);


    if (loading) {
        return (
            <div className="profile-container">
                <p>Loading your profile...</p>
            </div>
        );
    }

    // --- (Suspension render block is unchanged) ---
    if (isSuspended) {
        return (
            <div className="profile-container">
                <div className="profile-actions">
                    <Link to="/student-dashboard" className="back-link">← Back to Dashboard</Link>
                </div>
                <h1>My Profile</h1>
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

    if (error) {
        return (
            <div className="profile-container">
                 <div className="profile-actions">
                    <Link to="/student-dashboard" className="back-link">← Back to Dashboard</Link>
                </div>
                <p className="login-error-message">{error}</p>
            </div>
        );
    }

    return (
        <div className="profile-container">
            {/* --- Student-facing buttons --- */}
            <div className="profile-actions">
                <Link to="/student-dashboard" className="back-link">← Back to Dashboard</Link>
                
                <Link 
                    to={`/student/edit-profile`} 
                    className="action-button"
                >
                    Edit My Profile
                </Link>
            </div>
            
            <div className="text-center mb-8">
                <h1>{profile.firstName} {profile.surname}</h1>
                
                {/* *** THIS IS THE UPDATED IMAGE TAG *** */}
                <img 
                    src={profile.photo} 
                    alt="avatar" 
                    className="profile-avatar" 
                    onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src="https://res.cloudinary.com/dbsovavaw/image/upload/v1762574486/08350cafa4fabb8a6a1be2d9f18f2d88_kqvnyw.jpg" 
                    }}
                />
                {/* *** END OF UPDATE *** */}
            </div>
            
            {/* --- (Rest of the page is unchanged) --- */}
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
                
                <div>
                    <h2>Confidential Information</h2>
                    <p><strong>Family Income:</strong> ${profile.familyIncome || 'Not set'}</p>
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

export default MyProfile;