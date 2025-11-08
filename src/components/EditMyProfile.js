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
    
    // --- State for Uploading ---
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState('');
    const navigate = useNavigate();

    // --- State for Suspension/Error ---
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
                const res = await axios.get('https://niat-amet-college-portal-api.onrender.com/api/students/me', config);
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
                // --- Suspension Check ---
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

    // --- (Upload handler is unchanged) ---
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadError('');

        try {
            const token = localStorage.getItem('token');
            const sigRes = await axios.get('https://niat-amet-college-portal-api.onrender.com/api/upload/signature', {
                headers: { 'x-auth-token': token }
            });

            const { signature, timestamp, apiKey, cloudName } = sigRes.data;
            
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('timestamp', timestamp);
            uploadFormData.append('signature', signature);
            uploadFormData.append('api_key', apiKey);
            uploadFormData.append('folder', 'student_profiles');

            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
            const uploadRes = await axios.post(cloudinaryUrl, uploadFormData);

            setFormData({
                ...formData,
                photo: uploadRes.data.secure_url
            });
            
            setUploading(false);

        } catch (err) {
            console.error('Upload failed', err);
            setUploadError('Image upload failed. Please try again.');
            setUploading(false);
        }
    };
    
    // --- (Submit handler is unchanged) ---
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
            await axios.put('https://niat-amet-college-portal-api.onrender.com/api/students/me', formData, config);
            setStatusMessage('Profile updated successfully!');
            setTimeout(() => navigate('/my-profile'), 2000);
        } catch (err) {
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

    // --- (Suspension block is unchanged) ---
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

    return (
        <div className="dashboard-container">
            <Link to="/my-profile" className="back-link">← Back to My Profile</Link>
            <h1>Edit My Profile</h1>
            
            <form className="admin-form" onSubmit={onSubmit}>
                <h2>Personal Details</h2>
                
                {/* --- *** THIS IS THE UPDATED SECTION *** --- */}
                {/* The {photo && (...)} wrapper is REMOVED */}
                <div className="form-group">
                    <label>Current Photo</label>
                    <img 
                        src={photo} 
                        alt="avatar" 
                        style={{width: '100px', height: '100px', borderRadius: '50%', marginBottom: '1rem'}}
                        onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src="https://res.cloudinary.com/dbsovavaw/image/upload/v1762574486/08350cafa4fabb8a6a1be2d9f18f2d88_kqvnyw.jpg" 
                        }}
                    />
                </div>
                {/* --- *** END OF UPDATE *** --- */}
                
                {/* --- (Rest of form is unchanged) --- */}
                <div className="form-group">
                    <label>Upload New Photo</label>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        style={{
                            background: 'rgba(255,255,255,0.1)', 
                            border: 'none', 
                            padding: '0.5rem'
                        }}
                    />
                    {uploading && <p style={{color: '#6e8efb', margin: '0.5rem 0 0 0'}}>Uploading...</p>}
                    {uploadError && <p className="login-error-message" style={{margin: '0.5rem 0 0 0'}}>{uploadError}</p>}
                </div>
                
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
                
                <input type="hidden" name="photo" value={photo} />
                
                <h2>Confidential Information</h2>
                <div className="form-group">
                    <label>Family Income</label>
                    <input type="number" name="familyIncome" value={familyIncome} onChange={onChange} />
                </div>
                
                <button type="submit" className="form-submit-button" disabled={uploading}>
                    {uploading ? 'Wait for Upload...' : 'Save Changes'}
                </button>
                
                {error && <p className="login-error-message" style={{marginTop: '1rem'}}>{error}</p>}
                {statusMessage && <p className="form-message" style={{color: '#28a745', marginTop: '1rem'}}>{statusMessage}</p>}
            </form>
        </div>
    );
};

export default EditMyProfile;