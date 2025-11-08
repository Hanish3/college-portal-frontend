/* src/components/Curriculum.js */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Curriculum = () => {
    const [allCourses, setAllCourses] = useState([]);
    const [myCourseIds, setMyCourseIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // --- 1. ADD STATE FOR SUSPENSION/ERROR ---
    const [error, setError] = useState('');
    const [isSuspended, setIsSuspended] = useState(false);
    const [suspensionMessage, setSuspensionMessage] = useState('');
    
    // --- (Roster state is unchanged) ---
    const [expandedCourseId, setExpandedCourseId] = useState(null);
    const [rosterData, setRosterData] = useState([]);
    const [rosterLoading, setRosterLoading] = useState(false);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            let role = 'student';
            if (token) {
                const decoded = jwtDecode(token);
                role = decoded.user.role;
                setUserRole(role);
                if (role === 'admin') {
                    setIsAdmin(true);
                }
            }
            
            const allCoursesRes = await axios.get('https://niat-amet-college-portal-api.onrender.com/api/courses', config);
            setAllCourses(allCoursesRes.data);
            
            if (role === 'student') {
                const myCoursesRes = await axios.get('https://niat-amet-college-portal-api.onrender.com/api/students/me/courses', config);
                const enrolledIds = new Set(myCoursesRes.data.map(course => course._id));
                setMyCourseIds(enrolledIds);
            }
            setLoading(false);
        } catch (err) {
            // --- 2. ADD SUSPENSION CHECK ---
            if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                setIsSuspended(true);
                setSuspensionMessage(err.response.data.msg || 'Your account is suspended.');
            } else {
                console.error('Error fetching courses:', err);
                setError('Failed to load course data.');
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- (All handler functions: toggleRoster, handleEnroll, handleUnenroll, handleDelete are unchanged) ---
    const toggleRoster = async (course) => {
        if (expandedCourseId === course._id) {
            setExpandedCourseId(null);
            setRosterData([]);
            return;
        }
        setExpandedCourseId(course._id);
        setRosterLoading(true);
        setRosterData([]);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.get(`https://niat-amet-college-portal-api.onrender.com/api/students/by-course/${course._id}`, config);
            setRosterData(res.data);
            setRosterLoading(false);
        } catch (err) {
            console.error("Error fetching roster:", err);
            setRosterLoading(false);
        }
    };
    const handleEnroll = async (courseId) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            const body = { courseId };
            await axios.put('https://niat-amet-college-portal-api.onrender.com/api/students/me/enroll', body, config);
            setMyCourseIds(prevIds => new Set(prevIds).add(courseId));
        } catch (err) { 
            // Also check for suspension on action
            if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                setIsSuspended(true);
                setSuspensionMessage(err.response.data.msg || 'Your account is suspended.');
            } else {
                console.error('Error enrolling:', err); 
            }
        }
    };
    const handleUnenroll = async (courseId) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            const body = { courseId };
            await axios.put('https://niat-amet-college-portal-api.onrender.com/api/students/me/unenroll', body, config);
            setMyCourseIds(prevIds => {
                const newIds = new Set(prevIds);
                newIds.delete(courseId);
                return newIds;
            });
        } catch (err) { 
            // Also check for suspension on action
            if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                setIsSuspended(true);
                setSuspensionMessage(err.response.data.msg || 'Your account is suspended.');
            } else {
                console.error('Error unenrolling:', err); 
            }
        }
    };
    const handleDelete = async (courseId) => {
        if (!window.confirm('Are you sure you want to permanently delete this course?')) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.delete(`https://niat-amet-college-portal-api.onrender.com/api/courses/${courseId}`, config);
            setAllCourses(allCourses.filter(course => course._id !== courseId));
            alert('Course deleted successfully.');
        } catch (err) {
            console.error('Error deleting course:', err);
            alert('Error: ' + (err.response.data.msg || 'Could not delete course.'));
        }
    };
    // --- (End of handlers) ---


    const getDashboardPath = () => {
        if (userRole === 'admin') return '/admin-dashboard';
        if (userRole === 'faculty') return '/faculty-dashboard';
        return '/student-dashboard';
    };
    const dashboardPath = getDashboardPath();

    if (loading) {
        return <div className="dashboard-container"><p>Loading courses...</p></div>;
    }

    // --- 3. ADD RENDER BLOCK FOR SUSPENSION ---
    // Only show suspension error if the user is a student
    if (isSuspended && userRole === 'student') {
        return (
            <div className="dashboard-container">
                <Link to={dashboardPath} className="back-link">← Back to Dashboard</Link>
                <h1>Course Enrollment</h1>
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
            <Link to={dashboardPath} className="back-link">← Back to Dashboard</Link>
            
            {isAdmin ? ( <h1>Manage Courses</h1> ) : ( <h1>Course Enrollment</h1> )}
            {isAdmin ? ( <p>Here you can add, edit, or delete all available courses.</p> ) : ( <p>Here you can enroll in or leave courses for the semester.</p> )}

            {/* --- 4. DISPLAY OTHER ERRORS --- */}
            {error && <p className="login-error-message">{error}</p>}

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
                            <div key={course._id} className="course-card-column">
                                <div className="course-card">
                                    <div className="course-card-info">
                                        <h3>{course.code} - {course.title}</h3>
                                        <p>{course.description}</p>
                                        
                                        {(isAdmin || userRole === 'faculty') && (
                                            <p style={{color: '#a0a0b0', margin: '0.5rem 0 0 0', fontSize: '0.9rem'}}>
                                                <strong>Faculty:</strong> {course.faculty ? course.faculty.name : 'Unassigned'}
                                            </p>
                                        )}
                                    </div>
                                    
                                    {/* --- (Button logic is unchanged) --- */}
                                    {isAdmin ? (
                                        <div className="admin-button-group">
                                            <button
                                                onClick={() => toggleRoster(course)}
                                                className="enroll-button"
                                                style={{backgroundColor: '#28a745'}}
                                            >
                                                {expandedCourseId === course._id ? 'Hide Roster' : 'View Roster'}
                                            </button>
                                            <Link 
                                                to={`/admin/edit-course/${course._id}`}
                                                className="edit-button"
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
                                    ) : userRole === 'faculty' ? (
                                        <div className="admin-button-group">
                                            <button
                                                onClick={() => toggleRoster(course)}
                                                className="enroll-button"
                                                style={{backgroundColor: '#28a745'}}
                                            >
                                                {expandedCourseId === course._id ? 'Hide Roster' : 'View Roster'}
                                            </button>
                                        </div>
                                    ) : isEnrolled ? (
                                        <button onClick={() => handleUnenroll(course._id)} className="enroll-button leave-button">
                                            Leave Course
                                        </button>
                                    ) : (
                                        <button onClick={() => handleEnroll(course._id)} className="enroll-button">
                                            Enroll
                                        </button>
                                    )}
                                </div>
                                
                                {/* --- (Roster display logic is unchanged) --- */}
                                {expandedCourseId === course._id && (
                                    <div className="roster-details">
                                        {rosterLoading ? (
                                            <p>Loading roster...</p>
                                        ) : (
                                            <>
                                                <h4>Enrolled Students ({rosterData.length})</h4>
                                                {rosterData.length > 0 ? (
                                                    <ul>
                                                        {rosterData.map(student => (
                                                            <li key={student.user}>
                                                                {student.firstName} {student.surname}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p>No students are enrolled in this course.</p>
                                                )}
                                            </>
                                        )}
                                    </div>
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