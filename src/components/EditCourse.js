import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';

const EditCourse = () => {
    const [formData, setFormData] = useState({
        code: '',
        title: '',
        description: '',
        syllabusUrl: '',
        timetableUrl: ''
    });
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const { courseId } = useParams(); // Get the ID from the URL
    const navigate = useNavigate();

    // 1. Fetch existing course data
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                
                // Use our new API route
                const res = await axios.get(`http://localhost:5000/api/courses/${courseId}`, config);
                
                // Set the form data with the existing course details
                setFormData({
                    code: res.data.code || '',
                    title: res.data.title || '',
                    description: res.data.description || '',
                    syllabusUrl: res.data.syllabusUrl || '',
                    timetableUrl: res.data.timetableUrl || ''
                });
                setLoading(false);
            } catch (err) {
                console.error(err);
                setStatusMessage('Error: Could not load course data.');
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]); // Re-run if ID changes

    const { code, title, description, syllabusUrl, timetableUrl } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    // 2. Submit the *updated* data
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
            // Use the PUT route to update
            await axios.put(`http://localhost:5000/api/courses/${courseId}`, formData, config);
            
            setStatusMessage('Course updated successfully!');
            setTimeout(() => navigate('/curriculum'), 2000); // Go back to the list

        } catch (err) {
            console.error(err.response.data);
            setStatusMessage('Error: ' + (err.response.data.msg || 'Server Error'));
        }
    };

    if (loading) {
        return <div className="dashboard-container"><p>Loading course for editing...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <Link to="/curriculum" className="back-link">← Back to Manage Courses</Link>
            <h1>Edit Course</h1>
            <p>Update the details for this course.</p>

            <form className="admin-form" onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Course Code (e.g., CS101)</label>
                    <input type="text" name="code" value={code} onChange={onChange} required />
                </div>
                <div className="form-group">
                    <label>Course Title</label>
                    <input type="text" name="title" value={title} onChange={onChange} required />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={description} onChange={onChange}></textarea>
                </div>
                
                <div className="form-group">
                    <label>Syllabus URL (Optional)</label>
                    <input type="text" name="syllabusUrl" value={syllabusUrl} onChange={onChange} placeholder="https://.../syllabus.pdf" />
                </div>
                <div className="form-group">
                    <label>Timetable URL (Optional)</label>
                    <input type="text" name="timetableUrl" value={timetableUrl} onChange={onChange} placeholder="https://.../timetable.png" />
                </div>

                <button type="submit" className="form-submit-button">Save Changes</button>
                
                {statusMessage && <p className="form-message">{statusMessage}</p>}
            </form>
        </div>
    );
};

export default EditCourse;