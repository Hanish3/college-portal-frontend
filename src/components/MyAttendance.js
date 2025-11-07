/* src/components/MyAttendance.js */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MyAttendance = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- 1. ADD STATE FOR SUSPENSION AND ERRORS ---
    const [error, setError] = useState('');
    const [isSuspended, setIsSuspended] = useState(false);
    const [suspensionMessage, setSuspensionMessage] = useState('');

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { 'x-auth-token': token },
                };
                
                const res = await axios.get('http://localhost:5000/api/attendance/me/courses', config);
                
                setCourses(res.data);
                setLoading(false);

            } catch (err) {
                // --- 2. ADD SUSPENSION CHECK ---
                if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                    setIsSuspended(true);
                    setSuspensionMessage(err.response.data.msg || 'Your account is suspended.');
                } else {
                    console.error('Error fetching courses:', err);
                    setError('Failed to load your courses. Please try again later.');
                }
                setLoading(false);
            }
        };

        fetchMyCourses();
    }, []);

    if (loading) {
        return <div className="dashboard-container"><p>Loading your courses...</p></div>;
    }

    // --- 3. ADD RENDER BLOCK FOR SUSPENSION ---
    if (isSuspended) {
        return (
            <div className="dashboard-container">
                <Link to="/student-dashboard" className="back-link">← Back to Dashboard</Link>
                <h1>My Attendance</h1>
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
            <Link to="/student-dashboard" className="back-link">← Back to Dashboard</Link>
            <h1>My Attendance</h1>
            <p>Select a course to view your monthly attendance report.</p>

            {/* --- 4. DISPLAY OTHER ERRORS --- */}
            {error && <p className="login-error-message">{error}</p>}

            <div className="item-list">
                {courses.length > 0 ? (
                    // Loop over the courses
                    courses.map(course => (
                        // Link to the new detail page
                        <Link to={`/my-attendance/${course._id}`} key={course._id} className="course-card-link">
                            <div className="course-card">
                                <div className="course-card-info">
                                    <h3>{course.code} - {course.title}</h3>
                                    <p>{course.description}</p>
                                </div>
                                <div className="attendance-percentage-box">
                                    <span className="view-details-arrow">→</span>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p>No attendance records found for any courses.</p>
                )}
            </div>
        </div>
    );
};

export default MyAttendance;