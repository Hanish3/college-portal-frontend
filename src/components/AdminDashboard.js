/* src/components/AdminDashboard.js */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// --- NEW: Helper component for stat boxes ---
const StatCard = ({ title, value, linkTo, color }) => {
    const cardContent = (
        <div className={`stat-card ${color}`}>
            <h2>{value}</h2>
            <p>{title}</p>
        </div>
    );
    
    // If linkTo is provided, wrap the card in a Link
    if (linkTo) {
        return <Link to={linkTo} className="stat-card-link">{cardContent}</Link>;
    }
    // Otherwise, just return the card
    return cardContent;
};

const AdminDashboard = () => {
    // --- (State for search bar is unchanged) ---
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [message, setMessage] = useState('Search for students by name.');

    // --- NEW: State for statistics ---
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    // --- NEW: useEffect to fetch stats ---
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get('http://localhost:5000/api/dashboard/admin-stats', config);
                setStats(res.data);
                setLoadingStats(false);
            } catch (err) {
                console.error("Error fetching stats:", err);
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, []); // Runs once on load

    // --- (Search function is unchanged) ---
    const onSearch = async (e) => {
        e.preventDefault();
        setMessage('Searching...');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.get(
                `http://localhost:5000/api/students/search?name=${searchTerm}`,
                config
            );
            if (res.data.length === 0) setMessage('No students found.');
            else setMessage('');
            setStudents(res.data);
        } catch (err) {
            console.error(err.response.data);
            setMessage(`Error: ${err.response.data.msg}`);
            setStudents([]);
        }
    };

    // Helper for survey date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };


    return (
        <div className="dashboard-container">
            <h1>Welcome, Admin!</h1>

            {/* --- NEW STATS SECTION --- */}
            <h2 className="section-title">At a Glance</h2>
            {loadingStats ? (
                <p>Loading stats...</p>
            ) : stats && (
                <div className="stats-grid">
                    <StatCard 
                        title="Pending Approvals" 
                        value={stats.pendingStudents + stats.pendingFaculty + stats.pendingAdmins} 
                        linkTo="/admin-manage-users"
                        color="yellow"
                    />
                    <StatCard 
                        title="Active Students" 
                        value={stats.activeStudents}
                        color="green"
                    />
                    <StatCard 
                        title="Active Faculty" 
                        value={stats.activeFaculty}
                        color="blue"
                    />
                </div>
            )}
            
            {/* --- NEW SURVEY SECTION --- */}
            {stats && stats.recentSurveys.length > 0 && (
                <div className="survey-results-widget">
                    <h2 className="section-title">Recent "At-Risk" Surveys</h2>
                    <div className="item-list" style={{maxHeight: '200px'}}>
                        {stats.recentSurveys.map(res => (
                            <div key={res._id} className="survey-result-card-widget">
                                <span className={`survey-mood-badge ${res.mood.toLowerCase()}`}>
                                    {res.mood}
                                </span>
                                <strong>{res.student ? res.student.name : 'Unknown'}</strong>
                                <span className="item-date">{formatDate(res.date)}</span>
                            </div>
                        ))}
                    </div>
                    <Link to="/admin/survey-results" className="action-button" style={{width: 'auto', marginTop: '1rem'}}>
                        View All Surveys
                    </Link>
                </div>
            )}

            {/* --- STUDENT SEARCH SECTION --- */}
            <div className="search-container" style={{borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', marginTop: '2rem'}}>
                <h2 className="section-title">Search Students</h2>
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
                                        <strong>{student.firstName} {student.surname}</strong>
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