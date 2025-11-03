import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // 1. Remove the token from localStorage
        localStorage.removeItem('token');
        
        // 2. Redirect to the login page
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/student-dashboard" className="navbar-brand">Student Portal</Link>
            <button onClick={handleLogout} className="logout-button">
                Logout
            </button>
        </nav>
    );
};

export default Navbar;