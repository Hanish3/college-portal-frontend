/* src/components/StudentProfile.js */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const StudentProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    
    // --- (State is unchanged) ---
    const [profile, setProfile] = useState(null);
    const [allCourses, setAllCourses] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    
    const getPercentageColor = (percentage) => {
        if (percentage >= 75) return '#28a745';
        if (percentage >= 50) return '#f0ad4e';
        return '#d9534f';
    };

    // --- (fetchProfileAndCourses is unchanged) ---
    const fetchProfileAndCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token, authorization denied.');
                setLoading(false);
                return;
            }
            
            const decoded = jwtDecode(token);
            if (decoded.user.role === 'admin') {
                setIsAdmin(true);
            }

            const config = { headers: { 'x-auth-token': token } };
            
            const [profileRes, allCoursesRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/students/${userId}`, config),
                axios.get('http://localhost:5000/api/courses', config)
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
    
    // --- (handleEnrollmentChange is unchanged) ---
    const handleEnrollmentChange = async (courseId, action) => {
        const actionText = action === 'enroll' ? 'enrolling' : 'unenrolling';
        setMessage(`Processing ${actionText}...`);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            
            let res;
            if (action === 'enroll') {
                res = await axios.put(`http://localhost:5000/api/students/manage-enroll/${userId}/${courseId}`, {}, config);
            } else {
                res = await axios.put(`http://localhost:5000/api/students/manage-unenroll/${userId}/${courseId}`, {}, config);
            }
            
            setProfile(prevProfile => ({
                ...prevProfile,
                courses: res.data
            }));
            
            setMessage(`Student successfully ${action === 'enroll' ? 'enrolled in' : 'unenrolled from'} the course.`);

        } catch (err) {
            setError(err.response?.data?.msg || `Failed to ${actionText} student.`);
            setMessage('');
        }
    };
    
    // --- THIS IS THE UPDATED FUNCTION ---
    const handleSuspend = async () => {
        setError('');
        setMessage('');

        // 1. Get dates from the Admin
        const startDate = prompt(`Suspension START date for ${profile.firstName}:\n(YYYY-MM-DD)`);
        if (!startDate) return; // User cancelled

        const endDate = prompt(`Suspension END date for ${profile.firstName}:\n(YYYY-MM-DD)`);
        if (!endDate) return; // User cancelled

        // 2. Validate the dates
        if (new Date(endDate) <= new Date(startDate)) {
            setError('End date must be after start date.');
            return;
        }

        // 3. Send the dates to the API
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            
            // --- Send dates in the body ---
            const body = { startDate, endDate };
            await axios.put(`http://localhost:5000/api/users/suspend/${userId}`, body, config);

            setMessage(`User has been suspended from ${startDate} to ${endDate}. They must be reactivated from the "Manage Users" page.`);
            setError('');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to suspend user.');
            setMessage('');
        }
    };
    // --- END OF UPDATE ---

    // --- (handleDelete is unchanged) ---
    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE ${profile.firstName}? This cannot be undone.`)) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.delete(`http://localhost:5000/api/users/${userId}`, config);
            alert('User has been permanently deleted.');
            navigate('/admin-dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to delete user.');
        }
    };

    // --- (Render logic is unchanged) ---
    if (loading) {
        return ( <div className="profile-container"> <p>Loading profile...</p> S</div> );
    }

    if (error) {
        return ( <div className="profile-container"> <p className="login-error-message">{error}</p> </div> );
    }
    
    if (!profile) {
         return ( <div className="profile-container"> <p>No profile data found for this user.</p> </div> );
    }

    const enrolledCourseIds = new Set(profile.courses.map(c => c._id));
    const backPath = isAdmin ? "/admin-dashboard" : "/faculty-dashboard";
    
    const percentage = profile.overallAttendancePercentage !== undefined 
                       ? profile.overallAttendancePercentage.toFixed(1)
                       : 'N/A';


    return (
        <div className="dashboard-container">
            <div className="profile-actions">
                <Link to={backPath} className="back-link">
                    ← Back to Dashboard
                </Link>
                
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
            {error && <p className="login-error-message">{error}</p>}
            
            <div className="text-center mb-8" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem'}}>
                <img 
                    src={profile.photo || "/default-avatar.png"} 
                    alt="avatar" 
                    className="profile-avatar" 
                    onError={(e) => { e.target.onerror = null; e.target.src="/default-avatar.png" }}
                />
                <div style={{textAlign: 'left'}}>
                    <h1>{profile.firstName} {profile.surname}</h1>
                    <div className="attendance-percentage-box" style={{borderLeft: 'none', paddingLeft: 0, marginTop: '1rem', textAlign: 'left'}}>
                        <h2 style={{ 
                            color: getPercentageColor(profile.overallAttendancePercentage),
                            fontSize: '3rem',
                            borderBottom: 'none'
                        }}>
                            {percentage}%
                        </h2>
                        <p style={{marginTop: '-10px', color: '#ccc', fontWeight: 'bold'}}>Overall Attendance</p>
                    </div>
                </div>
            </div>
            
            <section className="space-y-6">
                
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