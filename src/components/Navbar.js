import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import the decoder

const Navbar = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null); // Add state to hold the role

    // This hook runs once when the component loads
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Decode the token and get the user's role
                const decoded = jwtDecode(token);
                setUserRole(decoded.user.role);
            } catch (error) {
                // If token is bad, log them out
                console.error('Invalid token:', error);
                handleLogout();
            }
        }
    }, []); // The empty array [] means this runs only once on mount

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // --- NEW LOGIC ---
    // Determine the title and link based on the user's role
    const isAdmin = userRole === 'admin' || userRole === 'faculty';
    const brandTitle = isAdmin ? 'Admin Portal' : 'Student Portal';
    const brandLink = isAdmin ? '/admin-dashboard' : '/student-dashboard';
    // --- END NEW LOGIC ---

    return (
        <nav className="navbar">
            {/* These now use our new variables */}
            <Link to={brandLink} className="navbar-brand">
                {brandTitle}
            </Link>
            
            <button onClick={handleLogout} className="logout-button">
                Logout
            </button>
        </nav>
    );
};

export default Navbar;