/* src/components/StudentMarkAttendance.js (NEW FILE) */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const StudentMarkAttendance = () => {
    const [myCourses, setMyCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // 1. Fetch the student's enrolled courses for the dropdown
    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                
                // This route already exists and is used by the Curriculum page
                // Note: We should probably use 'api/students/me/courses' for accuracy
                const res = await axios.get('https://niat-amet-college-portal-api.onrender.com/api/students/me/courses', config);
                
                setMyCourses(res.data);
                if (res.data.length > 0) {
                    setSelectedCourse(res.data[0]._id); // Default to the first course
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching courses:', err);
                if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                     setError(err.response.data.msg || 'Your account is suspended.');
                } else {
                    setError('Failed to load your courses. You may not be enrolled in any.');
                }
                setLoading(false);
            }
        };
        fetchMyCourses();
    }, []);

    // 2. Handle the form submission
    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!selectedCourse) {
            setError('Please select a course.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = { 
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': token 
                } 
            };
            // Only send the courseId. The server will handle the date.
            const body = JSON.stringify({ courseId: selectedCourse });

            // Call our new backend route
            const res = await axios.post('https://niat-amet-college-portal-api.onrender.com/api/attendance/me', body, config);
            
            setMessage(res.data.msg || 'Attendance marked successfully!');

        } catch (err) {
            // This will catch the "already marked" error from the backend
            setError(err.response?.data?.msg || 'An error occurred. Please try again.');
        }
    };

    if (loading) {
        return <div className="dashboard-container"><p>Loading your courses...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <Link to="/student-dashboard" className="back-link">← Back to Dashboard</Link>
            <h1>Mark My Attendance</h1>
            <p>Select your course to mark yourself as "Present" for **today**.</p>
            <p style={{color: '#a0a0b0', fontSize: '0.9rem'}}>This can only be done once per day, per course.</p>

            {/* Show this error if the student is suspended or has no courses */}
            {error && myCourses.length === 0 && (
                <p className="login-error-message">{error}</p>
            )}

            {myCourses.length > 0 ? (
                <form className="admin-form" onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Select Course</label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            {myCourses.map(course => (
                                <option key={course._id} value={course._id}>
                                    {course.code} - {course.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="form-submit-button">
                        Mark Me Present for Today
                    </button>

                    {message && <p className="form-message" style={{color: '#28a745'}}>{message}</p>}
                    {error && <p className="login-error-message">{error}</p>}
                </form>
            ) : (
                !error && <p>You are not enrolled in any courses to mark attendance for.</p>
            )}
        </div>
    );
};

export default StudentMarkAttendance;