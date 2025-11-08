import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Timetable = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
         const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                
                if (token) {
                    const decoded = jwtDecode(token);
                    setUserRole(decoded.user.role);
                }

                const config = {
                    headers: { 'x-auth-token': token },
                };

                // Just fetch all courses
                const res = await axios.get('https://niat-amet-college-portal-api.onrender.com/api/courses', config);
                setCourses(res.data);
                setLoading(false);

            } catch (err) {
                console.error('Error fetching courses:', err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const isAdmin = userRole === 'admin' || userRole === 'faculty';
    const dashboardPath = isAdmin ? '/admin-dashboard' : '/student-dashboard';

    if (loading) {
        return <div className="dashboard-container"><p>Loading timetable...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <Link to={dashboardPath} className="back-link">← Back to Dashboard</Link>
            <h1>Course Timetables & Syllabus</h1>
            <p>Here you can view the official timetables and syllabus for all available courses.</p>

            <div className="course-list">
                {courses.length > 0 ? (
                    courses.map(course => (
                        <div key={course._id} className="course-card">
                            <div className="course-card-info">
                                <h3>{course.code} - {course.title}</h3>
                                <p>{course.description}</p>
                                
                                <div className="course-links">
                                    {/* Only show link if URL exists */}
                                    {course.syllabusUrl && (
                                        <a href={course.syllabusUrl} target="_blank" rel="noopener noreferrer" className="course-link">
                                            View Syllabus
                                        </a>
                                    )}
                                    {course.timetableUrl && (
                                        <a href={course.timetableUrl} target="_blank" rel="noopener noreferrer" className="course-link">
                                            View Timetable
                                        </a>
                                    )}
                                    {/* Show message if no links */}
                                    {!course.syllabusUrl && !course.timetableUrl && (
                                        <p style={{color: '#888', fontSize: '0.9rem', margin: '0.5rem 0 0 0'}}>
                                            No syllabus or timetable added for this course yet.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No courses have been added yet.</p>
                )}
            </div>
        </div>
    );
};

export default Timetable;