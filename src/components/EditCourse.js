/* src/components/EditCourse.js */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';

const EditCourse = () => {
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
    const [loading, setLoading] = useState(true);
    const { courseId } = useParams(); // Get the ID from the URL
    const navigate = useNavigate();

    // --- UPDATED: Fetch both course details AND faculty list ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                
                // Fetch both sets of data in parallel
                const [courseRes, facultyRes] = await Promise.all([
                    axios.get(`https://niat-amet-college-portal-api.onrender.com/api/courses/${courseId}`, config),
                    axios.get('https://niat-amet-college-portal-api.onrender.com/api/users/faculty', config)
                ]);

                // Set the faculty list for the dropdown
                setFacultyList(facultyRes.data);

                // Set the form data with the existing course details
                setFormData({
                    code: courseRes.data.code || '',
                    title: courseRes.data.title || '',
                    description: courseRes.data.description || '',
                    syllabusUrl: courseRes.data.syllabusUrl || '',
                    timetableUrl: courseRes.data.timetableUrl || '',
                    // The backend populates faculty, so we get an object.
                    // We must store just the ID in our form state.
                    faculty: courseRes.data.faculty ? courseRes.data.faculty._id : ''
                });
                
                setLoading(false);
            } catch (err) {
                console.error(err);
                setStatusMessage('Error: Could not load course data.');
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId]); // Re-run if ID changes

    // --- UPDATED: Destructure new 'faculty' field ---
    const { code, title, description, syllabusUrl, timetableUrl, faculty } = formData;
    
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
            // The 'formData' object now correctly includes the 'faculty' ID
            await axios.put(`https://niat-amet-college-portal-api.onrender.com/api/courses/${courseId}`, formData, config);
            
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

                <button type="submit" className="form-submit-button">Save Changes</button>
                
                {statusMessage && <p className="form-message">{statusMessage}</p>}
            </form>
        </div>
    );
};

export default EditCourse;