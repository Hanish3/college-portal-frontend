/* src/components/Footer.js (NEW FILE) */
import React from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Footer = () => {
    // This logic gets the correct dashboard path for the "Dashboard" link
    const getDashboardPath = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const role = decoded.user.role;
                if (role === 'admin') return '/admin-dashboard';
                if (role === 'faculty') return '/faculty-dashboard';
            } catch (e) {
                // If token is invalid, default to student
                return '/student-dashboard'; 
            }
        }
        // Default for students
        return '/student-dashboard';
    };

    return (
        <footer className="footer-container">
            <div className="footer-columns">
                <div className="footer-column">
                    <h4>Navigation</h4>
                    <Link to={getDashboardPath()}>Dashboard</Link>
                    <Link to="/my-profile">My Profile</Link>
                    <Link to="/my-grades">My Grades</Link>
                    <Link to="/timetable">Timetable</Link>
                </div>
                <div className="footer-column">
                    <h4>Resources</h4>
                    <a href="https://ametuniv.ac.in/" target="_blank" rel="noopener noreferrer">AMET University</a>
                    <a href="https://niat.edu.in/" target="_blank" rel="noopener noreferrer">NIAT</a>
                    <Link to="#">Help Center</Link>
                    <a href="mailto:admin@college.edu">Report an Issue</a>
                </div>
                <div className="footer-column">
                    <h4>Legal</h4>
                    <Link to="#">Privacy Policy</Link>
                    <Link to="#">Terms of Use</Link>
                    <Link to="#">Academic Policy</Link>
                </div>
            </div>
            <div className="footer-bottom-bar">
                <span>© {new Date().getFullYear()} AMET University & NIAT. All Rights Reserved.</span>
                <span className="developer-credit">Developed by Tompala Hanish</span>
            </div>
        </footer>
    );
};

export default Footer;