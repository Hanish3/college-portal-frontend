import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './Navbar'; // <-- 1. IMPORTED NAVBAR

const Curriculum = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = localStorage.getItem('token');
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

        fetchCourses();
    }, []);

    if (loading) {
        return (
            <div> {/* WRAPPED IN A DIV */}
                <Navbar /> {/* ADDED NAVBAR */}
                <div className="dashboard-container"><p>Loading curriculum...</p></div>
            </div>
        );
    }

    return (
        <div> {/* <-- 2. WRAP in a div */}
            <Navbar /> {/* <-- 3. ADD THE NAVBAR */}
            <div className="dashboard-container">
                <Link to="/student-dashboard" className="back-link">← Back to Dashboard</Link>
                <h1>Course Curriculum</h1>
                <p>Here is the list of available courses.</p>

                <div className="course-list">
                    {courses.length > 0 ? (
                        courses.map(course => (
                            <div key={course._id} className="course-card">
                                <h3>{course.code} - {course.title}</h3>
                                <p>{course.description}</p>
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