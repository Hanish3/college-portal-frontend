import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Curriculum = () => {
    // --- (All state and functions are unchanged) ---
    const [allCourses, setAllCourses] = useState([]);
    const [myCourseIds, setMyCourseIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    const fetchData = async () => {
        // ... (this function is unchanged and correct from last time)
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            let role = 'student';
            if (token) {
                const decoded = jwtDecode(token);
                role = decoded.user.role;
                setUserRole(role);
            }
            const allCoursesRes = await axios.get('http://localhost:5000/api/courses', config);
            setAllCourses(allCoursesRes.data);
            if (role === 'student') {
                const myCoursesRes = await axios.get('http://localhost:5000/api/students/me/courses', config);
                const enrolledIds = new Set(myCoursesRes.data.map(course => course._id));
                setMyCourseIds(enrolledIds);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEnroll = async (courseId) => {
        // ... (this function is unchanged)
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            const body = { courseId };
            await axios.put('http://localhost:5000/api/students/me/enroll', body, config);
            setMyCourseIds(prevIds => new Set(prevIds).add(courseId));
        } catch (err) { console.error('Error enrolling:', err); }
    };

    const handleUnenroll = async (courseId) => {
        // ... (this function is unchanged)
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            const body = { courseId };
            await axios.put('http://localhost:5000/api/students/me/unenroll', body, config);
            setMyCourseIds(prevIds => {
                const newIds = new Set(prevIds);
                newIds.delete(courseId);
                return newIds;
            });
        } catch (err) { console.error('Error unenrolling:', err); }
    };

    const handleDelete = async (courseId) => {
        // ... (this function is unchanged)
        if (!window.confirm('Are you sure you want to permanently delete this course?')) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.delete(`http://localhost:5000/api/courses/${courseId}`, config);
            setAllCourses(allCourses.filter(course => course._id !== courseId));
            alert('Course deleted successfully.');
        } catch (err) {
            console.error('Error deleting course:', err);
            alert('Error: ' + (err.response.data.msg || 'Could not delete course.'));
        }
    };

    const isAdmin = userRole === 'admin' || userRole === 'faculty';
    const dashboardPath = isAdmin ? '/admin-dashboard' : '/student-dashboard';

    if (loading) {
        return <div className="dashboard-container"><p>Loading courses...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <Link to={dashboardPath} className="back-link">← Back to Dashboard</Link>
            {isAdmin ? ( <h1>Manage Courses</h1> ) : ( <h1>Course Enrollment</h1> )}
            {isAdmin ? ( <p>Here you can add, edit, or delete all available courses.</p> ) : ( <p>Here you can enroll in or leave courses for the semester.</p> )}

            {isAdmin && (
                <div className="admin-actions" style={{ marginBottom: '2rem' }}>
                    <Link to="/admin-create-course" className="action-button" style={{backgroundColor: '#28a745'}}>
                        + Add New Course
                    </Link>
                </div>
            )}

            <div className="course-list">
                {allCourses.length > 0 ? (
                    allCourses.map(course => {
                        const isEnrolled = myCourseIds.has(course._id);
                        return (
                            <div key={course._id} className="course-card">
                                <div className="course-card-info">
                                    <h3>{course.code} - {course.title}</h3>
                                    <p>{course.description}</p>
                                </div>
                                
                                {isAdmin ? (
                                    // --- NEW BUTTON WRAPPER ---
                                    <div className="admin-button-group">
                                        <Link 
                                            to={`/admin/edit-course/${course._id}`}
                                            className="edit-button" // <-- NEW EDIT BUTTON
                                        >
                                            Edit
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(course._id)}
                                            className="delete-button"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ) : (
                                    // ... (student buttons are unchanged) ...
                                    isEnrolled ? (
                                        <button onClick={() => handleUnenroll(course._id)} className="enroll-button leave-button">
                                            Leave Course
                                        </button>
                                    ) : (
                                        <button onClick={() => handleEnroll(course._id)} className="enroll-button">
                                            Enroll
                                        </button>
                                    )
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p>No courses have been added yet.</p>
                )}
            </div>
        </div>
    );
};

export default Curriculum;