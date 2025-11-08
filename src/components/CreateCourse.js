/* src/components/CreateCourse.js */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const CreateCourse = () => {
    // --- UPDATED: Added 'faculty' to state ---
    const [formData, setFormData] = useState({
        code: '',
        title: '',
        description: '',
        syllabusUrl: '',
        timetableUrl: '',
        faculty: '' // This will hold the selected faculty ID
    });
    
    // --- NEW: State for the faculty dropdown ---
    const [facultyList, setFacultyList] = useState([]);
    
    const [statusMessage, setStatusMessage] = useState('');
    const navigate = useNavigate();

    // --- NEW: Fetch the list of faculty when the page loads ---
    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                
                // Call our new API route
                const res = await axios.get('https://niat-amet-college-portal-api.onrender.com/api/users/faculty', config);
                setFacultyList(res.data);
            } catch (err) {
                console.error("Error fetching faculty:", err);
                setStatusMessage('Error: Could not load faculty list.');
            }
        };
        fetchFaculty();
    }, []); // Runs once on page load

    // --- UPDATED: Destructure new 'faculty' field ---
    const { code, title, description, syllabusUrl, timetableUrl, faculty } = formData;
    
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
        };
        
        // --- UPDATED: Send all fields (including faculty) ---
        const body = JSON.stringify({ code, title, description, syllabusUrl, timetableUrl, faculty });
        
        try {
            await axios.post('https://niat-amet-college-portal-api.onrender.com/api/courses', body, config);
            setStatusMessage('Course created successfully!');
            // --- UPDATED: Reset all fields ---
            setFormData({ 
                code: '', title: '', description: '', 
                syllabusUrl: '', timetableUrl: '', faculty: '' 
            }); 
            setTimeout(() => navigate('/curriculum'), 2000);
        } catch (err) {
            console.error(err.response.data);
            setStatusMessage('Error: ' + (err.response.data.msg || 'Server Error'));
        }
    };

    return (
        <div className="dashboard-container">
            <Link to="/curriculum" className="back-link">← Back to Manage Courses</Link>
            
            <h1>Add New Course</h1>
            <p>Add a new course to the student curriculum.</p>

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

                {/* --- NEW: Faculty Assignment Dropdown --- */}
                <div className="form-group">
                    <label>Assign Faculty (Optional)</label>
                    <select name="faculty" value={faculty} onChange={onChange}>
                        <option value="">-- Unassigned --</option>
                        {facultyList.length > 0 ? (
                            facultyList.map(prof => (
                                <option key={prof._id} value={prof._id}>
                                    {prof.name}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>Loading faculty...</option>
                        )}
                    </select>
                </div>
                {/* --- END NEW --- */}

                <div className="form-group">
                    <label>Syllabus URL (Optional)</label>
                    <input type="text" name="syllabusUrl" value={syllabusUrl} onChange={onChange} placeholder="https://.../syllabus.pdf" />
                </div>
                <div className="form-group">
                    <label>Timetable URL (Optional)</label>
                    <input type="text" name="timetableUrl" value={timetableUrl} onChange={onChange} placeholder="https://.../timetable.png" />
                </div>
                <button type="submit" className="form-submit-button">Add Course</button>
                {statusMessage && <p className="form-message">{statusMessage}</p>}
            </form>
        </div>
    );
};

export default CreateCourse;