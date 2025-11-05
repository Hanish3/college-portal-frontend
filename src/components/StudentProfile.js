import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const StudentProfile = () => {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
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
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="profile-container">
            {/* --- THIS BLOCK IS NOW UPDATED --- */}
            <div className="profile-actions">
                <Link to="/admin-dashboard" className="back-link">← Back to Search</Link>
                
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
            </div>
            {/* --- END OF UPDATE --- */}
            
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