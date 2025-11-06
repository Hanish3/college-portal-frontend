/* src/components/StudentProfile.js (Final Code with Enrollment Management) */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const StudentProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    
    const [profile, setProfile] = useState(null);
    const [allCourses, setAllCourses] = useState([]); // NEW state for all courses
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    // --- Function to fetch all data ---
    const fetchProfileAndCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token, authorization denied.');
                setLoading(false);
                return;
            }
            
            const decoded = jwtDecode(token);
            // Check if the current user is an Admin
            if (decoded.user.role === 'admin') {
                setIsAdmin(true);
            }

            const config = { headers: { 'x-auth-token': token } };
            
            // Fetch student profile AND all courses in parallel
            const [profileRes, allCoursesRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/students/${userId}`, config),
                axios.get('http://localhost:5000/api/courses', config) // Get all courses
            ]);
            
            setProfile(profileRes.data);
            setAllCourses(allCoursesRes.data);
            setLoading(false);
        } catch (err) {
            const errMsg = err.response?.data?.msg || 'Failed to fetch profile data.';
            console.error(errMsg);
            setError(`Error: ${errMsg}`);
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchProfileAndCourses();
    }, [userId]);
    
    // --- NEW: Enrollment Handlers ---
    const handleEnrollmentChange = async (courseId, action) => {
        const actionText = action === 'enroll' ? 'enrolling' : 'unenrolling';
        setMessage(`Processing ${actionText}...`);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            
            let res;
            if (action === 'enroll') {
                // Calls the new 'manage-enroll' route on the backend
                res = await axios.put(`http://localhost:5000/api/students/manage-enroll/${userId}/${courseId}`, {}, config);
            } else {
                // Calls the new 'manage-unenroll' route on the backend
                res = await axios.put(`http://localhost:5000/api/students/manage-unenroll/${userId}/${courseId}`, {}, config);
            }
            
            // The response contains the updated list of enrolled courses
            setProfile(prevProfile => ({
                ...prevProfile,
                courses: res.data // Replace the old courses list with the new one
            }));
            
            setMessage(`Student successfully ${action === 'enroll' ? 'enrolled in' : 'unenrolled from'} the course.`);

        } catch (err) {
            setError(err.response?.data?.msg || `Failed to ${actionText} student.`);
            setMessage('');
        }
    };
    
    // --- Existing Admin Handlers ---
    const handleSuspend = async () => {
        if (!window.confirm(`Are you sure you want to SUSPEND ${profile.firstName}? They will be unable to log in.`)) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`http://localhost:5000/api/users/suspend/${userId}`, null, config);
            setMessage('User has been suspended. They must be reactivated from the "Manage Users" page.');
            setError('');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to suspend user.');
            setMessage('');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE ${profile.firstName}? This cannot be undone.`)) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.delete(`http://localhost:5000/api/users/${userId}`, config);
            alert('User has been permanently deleted.');
            navigate('/admin-dashboard'); // Go back to dashboard after deletion
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to delete user.');
        }
    };

    if (loading) {
        return ( <div className="profile-container"> <p>Loading profile...</p> </div> );
    }

    if (error) {
        return ( <div className="profile-container"> <p className="login-error-message">{error}</p> </div> );
    }
    
    if (!profile) {
         return ( <div className="profile-container"> <p>No profile data found for this user.</p> </div> );
    }

    // Convert the enrolled course array to a Set for quick lookups
    const enrolledCourseIds = new Set(profile.courses.map(c => c._id));
    
    // Determine back path based on who's viewing (Admin or Faculty)
    const backPath = isAdmin ? "/admin-dashboard" : "/faculty-dashboard";

    return (
        <div className="dashboard-container">
            <div className="profile-actions">
                <Link to={backPath} className="back-link">
                    ← Back to Dashboard
                </Link>
                
                {/* --- Admin & Faculty Buttons --- */}
                <Link 
                    to={`/admin/mark-attendance/${userId}`} 
                    className="action-button" 
                    style={{ backgroundColor: '#28a745' }}
                >
                    Mark Attendance
                </Link>
                <Link 
                    to={`/admin/edit-student/${userId}`} 
                    className="action-button"
                >
                    Edit Profile
                </Link>

                {/* --- ADMIN-ONLY BUTTONS --- */}
                {isAdmin && (
                    <>
                        <button 
                            onClick={handleSuspend}
                            className="action-button" 
                            style={{ backgroundColor: '#f0ad4e', color: '#333' }}
                        >
                            Suspend User
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="action-button" 
                            style={{ backgroundColor: '#d9534f' }}
                        >
                            Remove User
                        </button>
                    </>
                )}
            </div>
            
            {message && <p className="form-message" style={{color: '#28a745'}}>{message}</p>}
            
            <div className="text-center mb-8">
                <h1>{profile.firstName} {profile.surname}</h1>
                <img 
                    src={profile.photo || "/default-avatar.png"} 
                    alt="avatar" 
                    className="profile-avatar" 
                    onError={(e) => { e.target.onerror = null; e.target.src="/default-avatar.png" }}
                />
            </div>
            
            <section className="space-y-6">
                
                {/* --- NEW: COURSE ENROLLMENT MANAGEMENT SECTION --- */}
                <div>
                    <h2>Course Enrollment Management</h2>
                    <p>Modify the courses this student is currently enrolled in.</p>
                    
                    <div className="item-list" style={{maxHeight: '350px'}}>
                        {allCourses.length > 0 ? (
                            allCourses.map(course => {
                                const isEnrolled = enrolledCourseIds.has(course._id);
                                return (
                                    <div key={course._id} className="course-card">
                                        <div className="course-card-info">
                                            <h3>{course.code} - {course.title}</h3>
                                        </div>
                                        <div className="admin-button-group" style={{flexDirection: 'row', gap: '1rem'}}>
                                            {isEnrolled ? (
                                                <button 
                                                    onClick={() => handleEnrollmentChange(course._id, 'unenroll')}
                                                    className="delete-button"
                                                >
                                                    Unenroll
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleEnrollmentChange(course._id, 'enroll')}
                                                    className="enroll-button"
                                                >
                                                    Enroll
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p>No courses available to manage.</p>
                        )}
                    </div>
                </div>

                {/* --- EXISTING SECTIONS BELOW --- */}

                <div>
                    <h2>Personal Details</h2>
                    <p><strong>First Name:</strong> {profile.firstName}</p>
                    <p><strong>Surname:</strong> {profile.surname}</p>
                    <p><strong>Registered Email:</strong> {profile.email}</p>
                    <p><strong>Personal Email:</strong> {profile.personalEmail || 'Not set'}</p>
                    <p><strong>Mobile Number:</strong> {profile.mobileNumber || 'Not set'}</p>
                    <p><strong>WhatsApp Number:</strong> {profile.isWhatsappSame ? profile.mobileNumber : (profile.whatsappNumber || 'Not set')}</p>
                </div>
                
                <div>
                    <h2>Academic Details</h2>
                    <p><strong>Marks:</strong> {profile.marks || 'Not set'}</p>
                </div>

                <div>
                    <h2>Certificates</h2>
                    {profile.certificates && profile.certificates.length > 0 ? (
                        <ul>
                            {profile.certificates.map((cert, index) => (
                                <li key={cert._id || index}>
                                    {cert.title} - <a href={cert.url} target="_blank" rel="noopener noreferrer">View Certificate</a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No certificates uploaded.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default StudentProfile;