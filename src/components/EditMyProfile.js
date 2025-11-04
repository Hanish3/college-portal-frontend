import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';

const EditMyProfile = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        surname: '',
        mobileNumber: '',
        personalEmail: '',
        isWhatsappSame: false,
        whatsappNumber: '',
        photo: '',
        familyIncome: '',
    });
    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState('');
    const navigate = useNavigate();

    // Fetch *all* our data when the page loads
    useEffect(() => {
        const fetchMyProfile = async () => {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'x-auth-token': token },
            };

            try {
                const res = await axios.get('http://localhost:5000/api/students/me', config);
                
                // Set all the fields in the form
                setFormData({
                    firstName: res.data.firstName || '',
                    surname: res.data.surname || '',
                    mobileNumber: res.data.mobileNumber || '',
                    personalEmail: res.data.personalEmail || '',
                    isWhatsappSame: res.data.isWhatsappSame || false,
                    whatsappNumber: res.data.whatsappNumber || '',
                    photo: res.data.photo || '',
                    familyIncome: res.data.familyIncome || '',
                });
                setLoading(false);

            } catch (err) {
                console.error(err);
                setStatusMessage('Error: Could not load profile data.');
                setLoading(false);
            }
        };

        fetchMyProfile();
    }, []);

    // Destructure all the fields
    const { 
        firstName, 
        surname, 
        mobileNumber, 
        personalEmail, 
        isWhatsappSame, 
        whatsappNumber, 
        photo, 
        familyIncome 
    } = formData;

    const onChange = e => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value 
        });
    };
    
    const onSubmit = async e => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
        };
        
        try {
            // formData now contains all the new fields
            await axios.put('http://localhost:5000/api/students/me', formData, config);
            
            setStatusMessage('Profile updated successfully!');
            setTimeout(() => navigate('/student-dashboard'), 2000);

        } catch (err) {
            console.error(err.response.data);
            setStatusMessage('Error: ' + (err.response.data.msg || 'Server Error'));
        }
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="dashboard-container"><p>Loading your profile...</p></div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="dashboard-container">
                <Link to="/student-dashboard" className="back-link">← Back to Dashboard</Link>
                <h1>Edit My Profile</h1>
                
                <form className="admin-form" onSubmit={onSubmit}>
                    {/* --- UPDATED SECTION: PERSONAL --- */}
                    <h2>Personal Details</h2>
                    <div className="form-group">
                        <label>First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            value={firstName}
                            onChange={onChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Surname</label>
                        <input
                            type="text"
                            name="surname"
                            value={surname}
                            onChange={onChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Registered Mobile Number</label>
                        <input
                            type="tel"
                            name="mobileNumber"
                            value={mobileNumber}
                            onChange={onChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Personal Email</label>
                        <input
                            type="email"
                            name="personalEmail"
                            value={personalEmail}
                            onChange={onChange}
                        />
                    </div>
                    <div className="form-group-checkbox"> {/* Added a new class for checkbox styling */}
                        <input
                            type="checkbox"
                            name="isWhatsappSame"
                            checked={isWhatsappSame}
                            onChange={onChange}
                            id="whatsapp-check"
                        />
                        <label htmlFor="whatsapp-check">Is this same as your WhatsApp Number?</label>
                    </div>
                    {/* Only show WhatsApp field if the box is NOT checked */}
                    {!isWhatsappSame && (
                        <div className="form-group">
                            <label>WhatsApp Number</label>
                            <input
                                type="tel"
                                name="whatsappNumber"
                                value={whatsappNumber}
                                onChange={onChange}
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Photo URL</label>
                        <input
                            type="text"
                            name="photo"
                            value={photo}
                            onChange={onChange}
                        />
                    </div>

                    {/* --- UPDATED SECTION: CONFIDENTIAL --- */}
                    <h2>Confidential Information</h2>
                    <div className="form-group">
                        <label>Family Income</label>
                        <input
                            type="number"
                            name="familyIncome"
                            value={familyIncome}
                            onChange={onChange}
                        />
                    </div>
                    {/* We would add certificates here */}
                    
                    <button type="submit" className="form-submit-button">Save Changes</button>
                    
                    {statusMessage && <p className="form-message">{statusMessage}</p>}
                </form>
            </div>
        </div>
    );
};

export default EditMyProfile;