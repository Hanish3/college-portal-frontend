import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
// import Navbar from './Navbar'; // <-- DELETE THIS LINE

const AdminDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [message, setMessage] = useState('Search for students by name.');

    const onSearch = async (e) => {
        // ... (your existing onSearch code is perfect) ...
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
        // REMOVED NAVBAR AND PARENT DIV
        <div className="dashboard-container">
            <h1>Welcome, Admin/Faculty!</h1>
            <div className="admin-actions">
                <Link to="/admin-manage-events" className="action-button">
                    Manage Events
                </Link>
                <Link to="/admin-manage-notifications" className="action-button" style={{backgroundColor: '#f0ad4e'}}>
                    Manage Notifications
                </Link>
                <Link to="/curriculum" className="action-button" style={{backgroundColor: '#d9534f'}}>
                    Manage Curriculum
                </Link>
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
                                        <strong>{student.firstName} {student.surname}</strong> {/* Use firstName/surname from your DB model */}
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

