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
                    <img src="/logo.jpg" alt="College Logo" className="sidebar-logo" />
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
                        <NavLink to="/curriculum" className="nav-link">Manage Curriculum</NavLink>
                    </>
                ) : (
                    <>
                        <NavLink to="/student-dashboard" className="nav-link">Dashboard</NavLink>
                        <NavLink to="/curriculum" className="nav-link">Curriculum</NavLink>
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