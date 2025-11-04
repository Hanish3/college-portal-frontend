import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { jwtDecode } from 'jwt-decode'; // <-- 1. IMPORT DECODER

const Curriculum = () => {
    const [courses, setCourses] =useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null); // <-- 2. ADD STATE FOR ROLE

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                
                // --- 3. DECODE TOKEN TO GET ROLE ---
                if (token) {
                    const decoded = jwtDecode(token);
                    setUserRole(decoded.user.role);
                }
                // --- END ROLE CHECK ---

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
    }, []); // This still runs once on load

    // --- 4. ADD THE DELETE FUNCTION ---
    const handleDelete = async (courseId) => {
        // Confirm before deleting
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

            // Call the new DELETE API endpoint
            await axios.delete(`http://localhost:5000/api/courses/${courseId}`, config);

            // Update the UI by filtering out the deleted course
            // This is faster than re-fetching from the server
            setCourses(courses.filter(course => course._id !== courseId));
            
            alert('Course deleted successfully.');

        } catch (err) {
            console.error('Error deleting course:', err);
            alert('Error: ' + (err.response.data.msg || 'Could not delete course.'));
        }
    };

    // Check if user is an admin
    const isAdmin = userRole === 'admin' || userRole === 'faculty';

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
                <Link to="/student-dashboard" className="back-link">← Back to Dashboard</Link>
                <h1>Course Curriculum</h1>
                <p>Here is the list of available courses.</p>

                <div className="course-list">
                    {courses.length > 0 ? (
                        courses.map(course => (
                            // --- 5. MODIFY THE COURSE CARD ---
                            <div key={course._id} className="course-card">
                                <div className="course-card-info">
                                    <h3>{course.code} - {course.title}</h3>
                                    <p>{course.description}</p>
                                </div>
                                
                                {/* 6. THIS IS THE CONDITIONAL BUTTON! */}
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