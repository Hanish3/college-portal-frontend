import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Make sure Link is imported
import Navbar from './Navbar';
import { jwtDecode } from 'jwt-decode';

const Curriculum = () => {
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
                    headers: {
                        'x-auth-token': token,
                    },
                };

                const res = await axios.get('http://localhost:5000/api/courses', config);
                setCourses(res.data);
                setLoading(false);

            } catch (err) {
                console.error('Error fetching courses:', err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDelete = async (courseId) => {
        if (!window.confirm('Are you sure you want to permanently delete this course?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'x-auth-token': token,
                },
            };

            await axios.delete(`http://localhost:5000/api/courses/${courseId}`, config);
            setCourses(courses.filter(course => course._id !== courseId));
            alert('Course deleted successfully.');

        } catch (err) {
            console.error('Error deleting course:', err);
            alert('Error: ' + (err.response.data.msg || 'Could not delete course.'));
        }
    };

    const isAdmin = userRole === 'admin' || userRole === 'faculty';
    const dashboardPath = isAdmin ? '/admin-dashboard' : '/student-dashboard';

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="dashboard-container"><p>Loading curriculum...</p></div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="dashboard-container">
                <Link to={dashboardPath} className="back-link">← Back to Dashboard</Link>
                <h1>Course Curriculum</h1>
                <p>Here you can view, edit, and delete all courses.</p>

                {/* --- THIS IS THE NEW SECTION --- */}
                {/* Only show this button if the user is an admin */}
                {isAdmin && (
                    <div className="admin-actions" style={{ marginBottom: '2rem' }}>
                        <Link to="/admin-create-course" className="action-button" style={{backgroundColor: '#28a745'}}>
                            + Add New Course
                        </Link>
                    </div>
                )}
                {/* --- END OF NEW SECTION --- */}

                <div className="course-list">
                    {courses.length > 0 ? (
                        courses.map(course => (
                            <div key={course._id} className="course-card">
                                <div className="course-card-info">
                                    <h3>{course.code} - {course.title}</h3>
                                    <p>{course.description}</p>
                                </div>
                                
                                {isAdmin && (
                                    <button 
                                        onClick={() => handleDelete(course._id)}
                                        className="delete-button"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No courses have been added yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Curriculum;