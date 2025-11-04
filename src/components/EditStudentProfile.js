import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';

const EditStudentProfile = () => {
    // --- UPDATED STATE TO INCLUDE ALL FIELDS ---
    const [formData, setFormData] = useState({
        firstName: '',
        surname: '',
        mobileNumber: '',
        personalEmail: '',
        isWhatsappSame: false,
        whatsappNumber: '',
        photo: '',
        familyIncome: '',
        marks: '',
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
                
                // --- UPDATE TO SET ALL FIELDS ---
                setFormData({
                    firstName: res.data.firstName || '',
                    surname: res.data.surname || '',
                    mobileNumber: res.data.mobileNumber || '',
                    personalEmail: res.data.personalEmail || '',
                    isWhatsappSame: res.data.isWhatsappSame || false,
                    whatsappNumber: res.data.whatsappNumber || '',
                    photo: res.data.photo || '',
                    familyIncome: res.data.familyIncome || '',
                    marks: res.data.marks || '',
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

    // Destructure all new fields
    const { 
        firstName, 
        surname, 
        mobileNumber, 
        personalEmail, 
        isWhatsappSame, 
        whatsappNumber, 
        photo, 
        familyIncome, 
        marks 
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
            // formData now contains all the fields
            await axios.put(`http://localhost:5000/api/students/${userId}`, formData, config);
            
            setStatusMessage('Profile updated successfully!');
            setTimeout(() => navigate(`/student/${userId}`), 2000);

        } catch (err) {
            console.error(err.response.data);
            setStatusMessage('Error: ' + (err.response.data.msg || 'Server Error'));
        }
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="dashboard-container"><p>Loading profile for editing...</p></div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="dashboard-container">
                <Link to={`/student/${userId}`} className="back-link">← Cancel and Go Back</Link>
                <h1>Edit Student Profile</h1>
                
                <form className="admin-form" onSubmit={onSubmit}>
                    {/* --- ALL NEW FIELDS ADDED TO FORM --- */}
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
                    
                    <h2>Academic Details</h2>
                    <div className="form-group">
                        <label>Marks</label>
                        <input type="text" name="marks" value={marks} onChange={onChange} />
                    </div>
                    
                    <button type="submit" className="form-submit-button">Save Changes</button>
                    {statusMessage && <p className="form-message">{statusMessage}</p>}
                </form>
            </div>
        </div>
    );
};

export default EditStudentProfile;