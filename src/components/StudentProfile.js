import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom'; // Import useParams and Link
import Navbar from './Navbar'; // <-- 1. IMPORTED NAVBAR

const StudentProfile = () => {
    // Get the 'userId' from the URL (e.g., /student/605c7... )
    const { userId } = useParams();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // 1. Get token
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('No token, authorization denied.');
                    setLoading(false);
                    return;
                }

                // 2. Set headers
                const config = {
                    headers: {
                        'x-auth-token': token,
                    },
                };

                // 3. Make the secure GET request using the userId from the URL
                const res = await axios.get(
                    `http://localhost:5000/api/students/${userId}`,
                    config
                );

                // 4. Set the profile data
                setProfile(res.data);
                setLoading(false);

            } catch (err) {
                console.error(err.response.data);
                setError(`Error: ${err.response.data.msg}`);
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]); // This 'useEffect' runs whenever the userId in the URL changes

    // --- Render logic ---
    if (loading) {
        return (
            <div> {/* WRAPPED IN A DIV */}
                <Navbar /> {/* ADDED NAVBAR */}
                <div className="profile-container"><p>Loading profile...</p></div>
            </div>
        );
    }

    if (error) {
        return (
            <div> {/* WRAPPED IN A DIV */}
                <Navbar /> {/* ADDED NAVBAR */}
                <div className="profile-container"><p>{error}</p></div>
            </div>
        );
    }

    return (
        <div> {/* <-- 2. WRAPPED IN A PARENT DIV */}
            <Navbar /> {/* <-- 3. ADDED THE NAVBAR */}
            <div className="profile-container">
                <Link to="/admin-dashboard" className="back-link">← Back to Search</Link>
                
                <h1>{profile.name}'s Profile</h1>
                <img src="/default-avatar.png" alt="avatar" className="profile-avatar" />

                <h2>Personal Details</h2>
                <p><strong>Email:</strong> {profile.email}</p>
                
                {/* This is the sensitive data only admins can see! */}
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
            </div>
        </div>
    );
};

export default StudentProfile;