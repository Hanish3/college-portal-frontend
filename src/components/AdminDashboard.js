/* src/components/AdminDashboard.js */
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [message, setMessage] = useState('Search for students by name.');

    const onSearch = async (e) => {
        e.preventDefault();
        setMessage('Searching...');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage('You are not logged in.');
                return;
            }
            const config = {
                headers: { 'x-auth-token': token },
            };
            // This route is accessible to Admins
            const res = await axios.get(
                `http://localhost:5000/api/students/search?name=${searchTerm}`,
                config
            );
            if (res.data.length === 0) {
                setMessage('No students found.');
            } else {
                setStudents(res.data);
                setMessage('');
            }
        } catch (err) {
            console.error(err.response.data);
            setMessage(`Error: ${err.response.data.msg}`);
            setStudents([]);
        }
    };

    return (
        <div className="dashboard-container">
            {/* --- UPDATED: Title is Admin-specific --- */}
            <h1>Welcome, Admin!</h1>
            
            {/* --- DELETED "Create New User" button --- */}
            {/* The <div className="admin-actions">...</div> block has been removed */}
            
            <div className="search-container">
                <h2>Search Students</h2>
                <form onSubmit={onSearch}>
                    <input
                        type="text"
                        placeholder="Search student name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} // Fixed a small typo here
                        className="search-input"
                    />
                    <button type="submit" className="search-button">Search</button>
                </form>
            </div>
            <div className="results-container">
                {message && <p>{message}</p>}
                {students.length > 0 && (
                    <ul>
                        {students.map((student) => (
                            <Link to={`/student/${student.user}`} key={student._id} className="student-link">
                                <li className="student-item">
                                    <img 
                                        src="default-avatar.png"
                                        alt="avatar" 
                                        className="avatar" 
                                    />
                                    <div className="student-info">
                                        {/* (Updated selector, file does not show 'firstName') */}
                                        <strong>{student.name || `${student.firstName} ${student.surname}`}</strong>
                                        <span>{student.email}</span>
                                    </div>
                                </li>
                            </Link>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;