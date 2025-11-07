/* src/components/EditMyProfile.js */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

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

    // --- 1. ADD STATE FOR SUSPENSION/ERROR ---
    const [error, setError] = useState('');
    const [isSuspended, setIsSuspended] = useState(false);
    const [suspensionMessage, setSuspensionMessage] = useState('');

    useEffect(() => {
        const fetchMyProfile = async () => {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'x-auth-token': token },
            };
            try {
                const res = await axios.get('http://localhost:5000/api/students/me', config);
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
                // --- 2. ADD SUSPENSION CHECK ---
                if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                    setIsSuspended(true);
                    setSuspensionMessage(err.response.data.msg || 'Your account is suspended.');
                } else {
                    console.error(err);
                    setError('Error: Could not load profile data.');
                }
                setLoading(false);
            }
        };
        fetchMyProfile();
    }, []);

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
            await axios.put('http://localhost:5000/api/students/me', formData, config);
            setStatusMessage('Profile updated successfully!');
            setTimeout(() => navigate('/my-profile'), 2000); // <-- Navigate back to MyProfile
        } catch (err) {
            // --- 3. ADD SUSPENSION CHECK ON SUBMIT ---
            if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                setIsSuspended(true);
                setSuspensionMessage(err.response.data.msg || 'Your account is suspended.');
            } else {
                console.error(err.response.data);
                setError('Error: ' + (err.response.data.msg || 'Server Error'));
            }
        }
    };

    if (loading) {
        return <div className="dashboard-container"><p>Loading your profile...</p></div>;
    }

    // --- 4. ADD RENDER BLOCK FOR SUSPENSION ---
    if (isSuspended) {
        return (
            <div className="dashboard-container">
                <Link to="/student-dashboard" className="back-link">← Back to Dashboard</Link>
                <h1>Edit My Profile</h1>
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
    // --- END RENDER BLOCK ---

    return (
        <div className="dashboard-container">
            <Link to="/my-profile" className="back-link">← Back to My Profile</Link>
            <h1>Edit My Profile</h1>
            
            <form className="admin-form" onSubmit={onSubmit}>
                <h2>Personal Details</h2>
                <div className="form-group">
                    <label>First Name</label>
                    <input type="text" name="firstName" value={firstName} onChange={onChange} />
                </div>
                <div className="form-group">
                    <label>Surname</label>
                    <input type="text" name="surname" value={surname} onChange={onChange} />
                </div>
                <div className="form-group">
                    <label>Registered Mobile Number</label>
                    <input type="tel" name="mobileNumber" value={mobileNumber} onChange={onChange} />
                </div>
                <div className="form-group">
                    <label>Personal Email</label>
                    <input type="email" name="personalEmail" value={personalEmail} onChange={onChange} />
                </div>
                <div className="form-group-checkbox">
                    <input type="checkbox" name="isWhatsappSame" checked={isWhatsappSame} onChange={onChange} id="whatsapp-check" />
                    <label htmlFor="whatsapp-check">Is this same as your WhatsApp Number?</label>
                </div>
                {!isWhatsappSame && (
                    <div className="form-group">
                        <label>WhatsApp Number</label>
                        <input type="tel" name="whatsappNumber" value={whatsappNumber} onChange={onChange} />
                    </div>
                )}
                <div className="form-group">
                    <label>Photo URL</label>
                    <input type="text" name="photo" value={photo} onChange={onChange} />
                </div>
                <h2>Confidential Information</h2>
                <div className="form-group">
                    <label>Family Income</label>
                    <input type="number" name="familyIncome" value={familyIncome} onChange={onChange} />
                </div>
                
                <button type="submit" className="form-submit-button">Save Changes</button>
                
                {/* Display either an error or a success message */}
                {error && <p className="login-error-message" style={{marginTop: '1rem'}}>{error}</p>}
                {statusMessage && <p className="form-message" style={{color: '#28a745', marginTop: '1rem'}}>{statusMessage}</p>}
            </form>
        </div>
    );
};

export default EditMyProfile;