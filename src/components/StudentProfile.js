import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';

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
                console.error(err.response.data);
                setError(`Error: ${err.response.data.msg}`);
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="profile-container"><p>Loading profile...</p></div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Navbar />
                <div className="profile-container"><p>{error}</p></div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="profile-container">
                <div className="profile-actions">
                    <Link to="/admin-dashboard" className="back-link">← Back to Search</Link>
                    <Link to={`/admin/edit-student/${userId}`} className="action-button">
                        Edit Profile
                    </Link>
                </div>

                {/* --- UPDATED TO SHOW NEW FIELDS --- */}
                <h1>{profile.firstName} {profile.surname}</h1>
                <img src={profile.photo || "/default-avatar.png"} alt="avatar" className="profile-avatar" />

                <h2>Personal Details</h2>
                <p><strong>First Name:</strong> {profile.firstName}</p>
                <p><strong>Surname:</strong> {profile.surname}</p>
                <p><strong>Registered Email:</strong> {profile.email}</p>
                <p><strong>Personal Email:</strong> {profile.personalEmail || 'Not set'}</p>
                <p><strong>Mobile Number:</strong> {profile.mobileNumber || 'Not set'}</p>
                <p><strong>WhatsApp Number:</strong> {profile.isWhatsappSame ? profile.mobileNumber : (profile.whatsappNumber || 'Not set')}</p>
                
                <h2>Confidential Information</h2>
                <p><strong>Family Income:</strong> ${profile.familyIncome || 'Not set'}</p>
                
                <h2>Academic Details</h2>
                <p><strong>Marks:</strong> {profile.marks || 'Not set'}</p>
                
                <h2>Certificates</h2>
                {profile.certificates && profile.certificates.length > 0 ? (
                    <ul>
                        {profile.certificates.map(cert => (
                            <li key={cert._id}>{cert.title} - <a href={cert.url}>View</a></li>
                        ))}
                    </ul>
                ) : (
                    <p>No certificates uploaded.</p>
                )}
                {/* --- END OF UPDATES --- */}
            </div>
        </div>
    );
};

export default StudentProfile;