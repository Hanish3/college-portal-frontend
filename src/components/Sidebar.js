import React, { useState, useEffect } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Sidebar = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserRole(decoded.user.role);
            } catch (error) {
                console.error('Invalid token:', error);
                handleLogout();
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const isAdmin = userRole === 'admin' || userRole === 'faculty';
    const brandTitle = isAdmin ? 'Admin Portal' : 'Student Portal';
    const brandLink = isAdmin ? '/admin-dashboard' : '/student-dashboard';

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <Link to={brandLink} className="sidebar-brand">
                    {/* --- THIS IS THE CHANGE --- */}
                    <img src="/amet_niat_logo.png" alt="AMET-NIAT Logo" />
                    {/* --- END OF CHANGE --- */}
                    <span>{brandTitle}</span>
                </Link>
            </div>

            <nav className="sidebar-nav">
                {/* Show links based on role */}
                {isAdmin ? (
                    <>
                        <NavLink to="/admin-dashboard" className="nav-link">Dashboard</NavLink>
                        <NavLink to="/admin-manage-events" className="nav-link">Manage Events</NavLink>
                        <NavLink to="/admin-manage-notifications" className="nav-link">Manage Notifications</NavLink>
                        
                        {/* --- This link text was updated based on your request --- */}
                        <NavLink to="/curriculum" className="nav-link">Manage Courses</NavLink>
                    </>
                ) : (
                    <>
                        <NavLink to="/student-dashboard" className="nav-link">Dashboard</NavLink>
                        
                        {/* --- These links were updated based on your request --- */}
                        <NavLink to="/curriculum" className="nav-link">Enroll in Courses</NavLink>
                        <NavLink to="/timetable" className="nav-link">Timetable</NavLink>
                        <NavLink to="/my-attendance" className="nav-link">My Attendance</NavLink>
                        {/* --- END OF CHANGES --- */}

                        <NavLink to="/student/edit-profile" className="nav-link">Edit My Profile</NavLink>
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;