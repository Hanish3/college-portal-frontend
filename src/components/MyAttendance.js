import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MyAttendance = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { 'x-auth-token': token },
                };
                
                // Call our NEW backend route for courses
                const res = await axios.get('http://localhost:5000/api/attendance/me/courses', config);
                
                setCourses(res.data);
                setLoading(false);

            } catch (err) {
                console.error('Error fetching courses:', err);
                setLoading(false);
            }
        };

        fetchMyCourses();
    }, []);

    if (loading) {
        return <div className="dashboard-container"><p>Loading your courses...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <Link to="/student-dashboard" className="back-link">← Back to Dashboard</Link>
            <h1>My Attendance</h1>
            <p>Select a course to view your monthly attendance report.</p>

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