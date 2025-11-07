/* src/components/EditStudentProfile.js */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';

const EditStudentProfile = () => {
    // --- 1. 'marks' REMOVED FROM STATE ---
    const [formData, setFormData] = useState({
        firstName: '',
        surname: '',
        mobileNumber: '',
        personalEmail: '',
        isWhatsappSame: false,
        whatsappNumber: '',
        photo: '',
        familyIncome: '',
        // marks: '', // <-- This field is obsolete
    });
    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState('');
    const { userId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
         const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'x-auth-token': token },
            };
            try {
                const res = await axios.get(`http://localhost:5000/api/students/${userId}`, config);
                // --- 2. 'marks' REMOVED FROM setFormData ---
                setFormData({
                    firstName: res.data.firstName || '',
                    surname: res.data.surname || '',
                    mobileNumber: res.data.mobileNumber || '',
                    personalEmail: res.data.personalEmail || '',
                    isWhatsappSame: res.data.isWhatsappSame || false,
                    whatsappNumber: res.data.whatsappNumber || '',
                    photo: res.data.photo || '',
                    familyIncome: res.data.familyIncome || '',
                    // marks: res.data.marks || '', // <-- This field is obsolete
                });
                setLoading(false);
            } catch (err) {
                console.error(err);
                setStatusMessage('Error: Could not load profile data.');
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    // --- 3. 'marks' REMOVED FROM DESTRUCTURING ---
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
            // formData no longer contains 'marks', so it won't be sent
            await axios.put(`http://localhost:5000/api/students/${userId}`, formData, config);
            setStatusMessage('Profile updated successfully!');
            setTimeout(() => navigate(`/student/${userId}`), 2000);
        } catch (err) {
            console.error(err.response.data);
            setStatusMessage('Error: ' + (err.response.data.msg || 'Server Error'));
        }
    };

    if (loading) {
        return <div className="dashboard-container"><p>Loading profile for editing...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <Link to={`/student/${userId}`} className="back-link">← Cancel and Go Back</Link>
            <h1>Edit Student Profile</h1>
            
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
                
                {/* --- 4. ACADEMIC DETAILS SECTION REMOVED FROM HERE --- */}
                
                <button type="submit" className="form-submit-button">Save Changes</button>
                {statusMessage && <p className="form-message">{statusMessage}</p>}
            </form>
        </div>
    );
};

export default EditStudentProfile;