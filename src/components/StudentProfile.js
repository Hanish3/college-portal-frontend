/* src/components/StudentProfile.js */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const StudentProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    
    // State for data
    const [profile, setProfile] = useState(null);
    const [allCourses, setAllCourses] = useState([]); 
    const [grades, setGrades] = useState([]); 
    
    // State for UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    
    // State for 3-dot menu
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null); 

    const getPercentageColor = (percentage) => {
        if (percentage >= 75) return '#28a745';
        if (percentage >= 50) return '#f0ad4e';
        return '#d9534f';
    };

    const getGradeDetails = (grade) => {
        if (!grade.totalMarks || grade.totalMarks === 0) {
            return { percentage: 'N/A', color: '#e0e0e0' };
        }
        const percentage = (grade.marksObtained / grade.totalMarks) * 100;
        let color;
        if (percentage >= 85) color = '#28a745';
        else if (percentage >= 70) color = '#5bc0de';
        else if (percentage >= 50) color = '#f0ad4e';
        else color = '#d9534f';
        return { percentage: percentage.toFixed(1), color };
    };

    const fetchProfileData = async () => {
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
            
            const [profileRes, allCoursesRes, gradesRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/students/${userId}`, config),
                axios.get('http://localhost:5000/api/courses', config),
                axios.get(`http://localhost:5000/api/grades/student/${userId}`, config)
            ]);
            
            setProfile(profileRes.data);
            setAllCourses(allCoursesRes.data);
            setGrades(gradesRes.data);
            setLoading(false);
        } catch (err) {
            const errMsg = err.response?.data?.msg || 'Failed to fetch profile data.';
            console.error(errMsg);
            setError(`Error: ${errMsg}`);
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchProfileData();
    }, [userId]);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false); 
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuRef]);
    
    
    // --- (Action Handlers are unchanged) ---
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
            setProfile(prevProfile => ({ ...prevProfile, courses: res.data }));
            setMessage(`Student successfully ${action === 'enroll' ? 'enrolled in' : 'unenrolled from'} the course.`);
        } catch (err) {
            setError(err.response?.data?.msg || `Failed to ${actionText} student.`);
            setMessage('');
        }
    };
    const handleSuspend = async () => {
        setError('');
        setMessage('');
        const startDate = prompt(`Suspension START date for ${profile.firstName}:\n(YYYY-MM-DD)`);
        if (!startDate) return; 
        const endDate = prompt(`Suspension END date for ${profile.firstName}:\n(YYYY-MM-DD)`);
        if (!endDate) return; 
        if (new Date(endDate) <= new Date(startDate)) {
            setError('End date must be after start date.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            const body = { startDate, endDate };
            await axios.put(`http://localhost:5000/api/users/suspend/${userId}`, body, config);
            setMessage(`User has been suspended from ${startDate} to ${endDate}. They must be reactivated from the "Manage Users" page.`);
            setError('');
            setMenuOpen(false);
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
            navigate('/admin-dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to delete user.');
        }
    };
    // --- (End Handlers) ---


    if (loading) {
        return ( <div className="profile-container"> <p>Loading profile...</p></div> );
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
            
            {/* --- THIS "Back to Dashboard" LINK IS CORRECT FOR THE VIEW PAGE --- */}
            <div className="profile-actions">
                <Link to={backPath} className="back-link">
                    ← Back to Dashboard
                </Link>
                
                <div className="actions-menu-wrapper" ref={menuRef}>
                    <button 
                        onClick={() => setMenuOpen(!menuOpen)} 
                        className="actions-menu-button"
                    >
                        &#8942; {/* Vertical ellipsis icon */}
                    </button>
                    
                    {menuOpen && (
                        <div className="dropdown-menu">
                            <Link 
                                to={`/admin/edit-student/${userId}`} 
                                className="dropdown-menu-item"
                            >
                                Edit Profile
                            </Link>
                            <Link 
                                to={`/admin/mark-attendance/${userId}`} 
                                className="dropdown-menu-item" 
                            >
                                Mark Attendance
                            </Link>
                            
                            {isAdmin && (
                                <>
                                    <button 
                                        onClick={handleSuspend}
                                        className="dropdown-menu-item dropdown-menu-item-suspend" 
                                    >
                                        Suspend User
                                    </button>
                                    <button 
                                        onClick={handleDelete}
                                        className="dropdown-menu-item dropdown-menu-item-remove"
                                    >
                                        Remove User
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {message && <p className="form-message" style={{color: '#28a745'}}>{message}</p>}
            {error && <p className="login-error-message">{error}</p>}
            
            {/* --- (Header/Avatar Section is unchanged) --- */}
            <div className="text-center mb-8" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem'}}>
                
                <img 
                    src={profile.photo} 
                    alt="avatar" 
                    className="profile-avatar" 
                    onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src="https://res.cloudinary.com/dbsovavaw/image/upload/v1762574486/08350cafa4fabb8a6a1be2d9f18f2d88_kqvnyw.jpg" 
                    }}
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
                
                {/* --- (Course Enrollment Section is unchanged) --- */}
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

                {/* --- (Academic Performance Section is unchanged) --- */}
                <div>
                    <h2>Academic Performance</h2>
                    <div className="item-list" style={{maxHeight: '330px'}}>
                        {grades.length > 0 ? (
                            grades.map(grade => {
                                const { percentage, color } = getGradeDetails(grade);
                                return (
                                    <div key={grade._id} className="course-card">
                                        <div className="course-card-info">
                                            <h3>{grade.course.code} - {grade.course.title}</h3>
                                            <p style={{color: '#a0a0b0', margin: '0.5rem 0 0 0'}}>
                                                Assessment: <strong>{grade.assessmentTitle}</strong>
                                            </p>
                                        </div>
                                        <div className="attendance-percentage-box">
                                            <h2 style={{ color: color }}>
                                                {percentage}%
                                            </h2>
                                            <p style={{color: '#e0e0e0', fontWeight: 'bold'}}>
                                                {grade.marksObtained} / {grade.totalMarks}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p>No grades have been posted for this student yet.</p>
                        )}
                    </div>
                </div>

                {/* --- (Personal Details Section is unchanged) --- */}
                <div>
                    <h2>Personal Details</h2>
                    <p><strong>First Name:</strong> {profile.firstName}</p>
                    <p><strong>Surname:</strong> {profile.surname}</p>
                    <p><strong>Registered Email:</strong> {profile.email}</p>
                    <p><strong>Personal Email:</strong> {profile.personalEmail || 'Not set'}</p>
                    <p><strong>Mobile Number:</strong> {profile.mobileNumber || 'Not set'}</p>
                    <p><strong>WhatsApp Number:</strong> {profile.isWhatsappSame ? profile.mobileNumber : (profile.whatsappNumber || 'Not set')}</p>
                </div>
                
                {/* --- (Certificates Section is unchanged) --- */}
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