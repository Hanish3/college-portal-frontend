/* src/components/Sidebar.js */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
// --- 1. REMOVED THE StudentSurvey IMPORT ---

const Sidebar = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded && decoded.user && decoded.user.role) {
                    setUserRole(decoded.user.role);
                } else {
                    console.error('Invalid token payload');
                    handleLogout();
                }
            } catch (error) {
                console.error('Invalid token:', error);
                handleLogout();
            }
        } else {
            handleLogout();
        }
    }, []); 

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const isStudent = userRole === 'student';
    const isFaculty = userRole ==='faculty';
    const isAdmin = userRole === 'admin';

    const getBrand = () => {
        if (isAdmin) return { title: 'Admin Portal', link: '/admin-dashboard' };
        if (isFaculty) return { title: 'Faculty Portal', link: '/faculty-dashboard' };
        return { title: 'Student Portal', link: '/student-dashboard' };
    };
    const { title: brandTitle, link: brandLink } = getBrand();

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <Link to={brandLink} className="sidebar-brand">
                    <img src="/amet_niat_logo.png" alt="AMET-NIAT Logo" />
                    <span>{brandTitle}</span>
                </Link>
            </div>

            <nav className="sidebar-nav">
                
                {/* --- STUDENT LINKS (UPDATED) --- */}
                {isStudent && (
                    <>
                        <NavLink to="/student-dashboard" className="nav-link">Dashboard</NavLink>
                        {/* --- 2. ADDED THIS NEW LINK --- */}
                        <NavLink to="/my-survey" className="nav-link">My Survey</NavLink>
                        <NavLink to="/curriculum" className="nav-link">Enroll in Courses</NavLink>
                        <NavLink to="/timetable" className="nav-link">Timetable</NavLink>
                        <NavLink to="/my-attendance" className="nav-link">My Attendance</NavLink>
                        <NavLink to="/my-profile" className="nav-link">My Profile</NavLink>
                    </>
                )}

                {/* --- FACULTY LINKS --- */}
                {isFaculty && (
                    <>
                        <NavLink to="/faculty-dashboard" className="nav-link">My Dashboard</NavLink>
                        <NavLink to="/admin-manage-users" className="nav-link">Manage Users</NavLink>
                        <NavLink to="/admin/survey-results" className="nav-link">Survey Results</NavLink>
                        <NavLink to="/admin-manage-events" className="nav-link">Manage Events</NavLink>
                        <NavLink to="/admin-manage-notifications" className="nav-link">Manage Notifications</NavLink>
                        <NavLink to="/curriculum" className="nav-link">View All Courses</NavLink>
                        <NavLink to="/timetable" className="nav-link">View Timetable</NavLink>
                    </>
                )}

                {/* --- ADMIN LINKS --- */}
                {isAdmin && (
                    <>
                        <NavLink to="/admin-dashboard" className="nav-link">Admin Dashboard</NavLink>
                        <NavLink to="/faculty-dashboard" className="nav-link">Faculty Dashboard</NavLink>
                        <NavLink to="/admin-manage-users" className="nav-link">Manage Users</NavLink>
                        <NavLink to="/curriculum" className="nav-link">Manage Courses</NavLink>
                        <NavLink to="/admin/survey-results" className="nav-link">Survey Results</NavLink>
                        <NavLink to="/admin-manage-events" className="nav-link">Manage Events</NavLink>
                        <NavLink to="/admin-manage-notifications" className="nav-link">Manage Notifications</NavLink>
                    </>
                )}
            </nav>

            {/* --- 3. REMOVED THE SURVEY WIDGET FROM HERE --- */}

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;