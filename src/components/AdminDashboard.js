import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './Navbar'; // <-- This is correct

const AdminDashboard = () => {
    // ... all your state and onSearch code ...
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [message, setMessage] = useState('Search for students by name.');

    const onSearch = async (e) => {
        e.preventDefault();
        setMessage('Searching...');

        try {
            // 1. Get the token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage('You are not logged in.');
                return;
            }

            // 2. Create the headers for the request
            const config = {
                headers: {
                    'x-auth-token': token,
                },
            };

            // 3. Make the secure GET request
            const res = await axios.get(
                `http://localhost:5000/api/students/search?name=${searchTerm}`,
                config // <-- Pass the headers here!
            );

            // 4. Update state with the results
            if (res.data.length === 0) {
                setMessage('No students found.');
            } else {
                setStudents(res.data);
                setMessage(''); // Clear message
            }

        } catch (err) {
            console.error(err.response.data);
            // This will catch "No token" or "Token invalid" errors
            setMessage(`Error: ${err.response.data.msg}`);
            setStudents([]); // Clear any old results
        }
    };

    return (
        <div>
            <Navbar />
            
            {/* The rest of your admin dashboard JSX */}
            <div className="dashboard-container">
                <h1>Welcome, Admin/Faculty!</h1>
                
                <div className="admin-actions">
                    <Link to="/admin-create-event" className="action-button">
                        Create New Event
                    </Link>
                    
                    <Link to="/admin-create-notification" className="action-button" style={{backgroundColor: '#f0ad4e'}}>
                        Send Notification
                    </Link>

                    <Link to="/admin-create-course" className="action-button" style={{backgroundColor: '#5bc0de'}}>
                        Add New Course
                    </Link>

                    {/* --- ADDED NEW LINK --- */}
                    <Link to="/curriculum" className="action-button" style={{backgroundColor: '#d9534f'}}>
                        Manage Curriculum
                    </Link>
                    {/* --- END OF NEW LINK --- */}
                </div>
                
                <div className="search-container">
                    <h2>Search Students</h2>
                    <form onSubmit={onSearch}>
                        <input
                            type="text"
                            placeholder="Search student name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="search-button">Search</button>
                    </form>
                </div>

                <div className="results-container">
                    {/* Show a message or the list of students */}
                    {message && <p>{message}</p>}

                    {students.length > 0 && (
                        <ul>
                            {students.map((student) => (
                                <Link to={`/student/${student.user}`} key={student._id} className="student-link">
                                    <li className="student-item">
                                        <img 
                                            src="default-avatar.png" // We'll use a placeholder for now
                                            alt="avatar" 
                                            className="avatar" 
                                        />
                                        <div className="student-info">
                                            <strong>{student.name}</strong>
                                            <span>{student.email}</span>
                                        </div>
                                    </li>
                                </Link>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

