/* src/components/FacultyDashboard.js (NEW FILE) */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const FacultyDashboard = () => {
    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                
                // Call our new, faculty-only API route
                const res = await axios.get('http://localhost:5000/api/courses/my-courses', config);
                
                setMyCourses(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to load your assigned courses.');
                setLoading(false);
            }
        };
        fetchMyCourses();
    }, []); // Runs once on page load

    if (loading) {
        return <div className="dashboard-container"><p>Loading your courses...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <h1>Welcome, Faculty!</h1>
            <p>Here are the courses you are assigned to for this semester.</p>

            {error && <p className="login-error-message">{error}</p>}

            <div className="course-list">
                {myCourses.length > 0 ? (
                    myCourses.map(course => (
                        <div key={course._id} className="course-card">
                            <div className="course-card-info">
                                <h3>{course.code} - {course.title}</h3>
                                <p>{course.description}</p>
                            </div>
                            
                            {/* We will add "Take Attendance" buttons here later */}
                            <div className="admin-button-group">
                                <Link 
                                    to={`/faculty/take-attendance/${course._id}`}
                                    className="edit-button" // We can reuse this style
                                >
                                    Take Attendance
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>You have not been assigned to any courses yet.</p>
                )}
            </div>
        </div>
    );
};

export default FacultyDashboard;