/* src/components/AdminDashboard.js */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { saveAs } from 'file-saver';

// --- (StatCard component is unchanged) ---
const StatCard = ({ title, value, linkTo, color }) => {
    const cardContent = (
        <div className={`stat-card ${color}`}>
            <h2>{value}</h2>
            <p>{title}</p>
        </div>
    );
    if (linkTo) {
        return <Link to={linkTo} className="stat-card-link">{cardContent}</Link>;
    }
    return cardContent;
};

const AdminDashboard = () => {
    // --- (All state is unchanged) ---
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [message, setMessage] = useState('Search for students by name.');
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState('');

    // --- (useEffect is unchanged) ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                
                const [statsRes, coursesRes] = await Promise.all([
                    axios.get('https://niat-amet-college-portal-api.onrender.com/api/dashboard/admin-stats', config),
                    axios.get('https://niat-amet-college-portal-api.onrender.com/api/courses', config) 
                ]);
                
                setStats(statsRes.data);
                setCourses(coursesRes.data);
                setLoadingStats(false);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setLoadingStats(false);
            }
        };
        fetchDashboardData();
    }, []); 

    // --- (onSearch function is unchanged) ---
    const onSearch = async (e) => {
        e.preventDefault();
        setMessage('Searching...');
        setStudents([]);
        
        if (!searchTerm.trim()) {
            setMessage('Please enter a name to search.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            
            const res = await axios.get(
                `https://niat-amet-college-portal-api.onrender.com/api/students/search?name=${searchTerm}`,
                config
            );
            
            if (res.data.length === 0) {
                setMessage(`No students found matching "${searchTerm}".`);
            } else {
                setStudents(res.data);
                setMessage(`Found ${res.data.length} student(s).`);
            }
            
        } catch (err) {
            console.error(err.response?.data);
            const errMsg = err.response?.data?.msg || 'Search failed. Please try again.';
            setMessage(errMsg);
            setStudents([]);
        }
    };
    
    // --- (formatDate function is unchanged) ---
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // --- (Download handlers are unchanged) ---
    const handleCourseDownload = async () => {
        if (!selectedCourse) {
            setDownloadError('Please select a course to export.');
            return;
        }
        setIsDownloading(true);
        setDownloadError('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(
                `https://niat-amet-college-portal-api.onrender.com/api/students/export/${selectedCourse}`,
                {
                    headers: { 'x-auth-token': token },
                    responseType: 'blob' 
                }
            );
            
            const contentDisposition = res.headers['content-disposition'];
            let filename = 'course_report.xlsx'; 
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch.length === 2)
                    filename = filenameMatch[1];
            }
            saveAs(res.data, filename);

        } catch (err) {
            console.error('Download error:', err);
            setDownloadError('Failed to download report. Please try again.');
        }
        setIsDownloading(false);
    };
    const handleDownloadAll = async () => {
        setIsDownloading(true);
        setDownloadError('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(
                'https://niat-amet-college-portal-api.onrender.com/api/students/export/all',
                {
                    headers: { 'x-auth-token': token },
                    responseType: 'blob'
                }
            );
            saveAs(res.data, 'all_students_export.xlsx');
        } catch (err) {
            console.error('Download error:', err);
            setDownloadError('Failed to download master report. Please try again.');
        }
        setIsDownloading(false);
    };

    // --- (Helper function is unchanged) ---
    const getMoodClass = (mood) => {
        switch (mood) {
            case 'Great': return 'mood-great';
            case 'Good': return 'mood-good';
            case 'Okay': return 'mood-okay';
            case 'Stressed': return 'mood-stressed';
            case 'Sad': return 'mood-sad';
            default: return '';
        }
    };

    return (
        <div className="dashboard-container">
            <h1>Welcome, Admin!</h1>

            {/* --- (Stats, Export, and Survey sections are unchanged) --- */}
            <h2 className="section-title">At a Glance</h2>
            {loadingStats ? (
                <p>Loading stats...</p>
            ) : stats && (
                <div className="stats-grid">
                    <StatCard title="Pending Students" value={stats.pendingStudents} linkTo="/admin-manage-users" color="yellow" />
                    <StatCard title="Pending Faculty" value={stats.pendingFaculty} linkTo="/admin-manage-users" color="yellow" />
                    <StatCard title="Active Students" value={stats.activeStudents} color="green" />
                    <StatCard title="Active Faculty" value={stats.activeFaculty} color="blue" />
                </div>
            )}
            
            <div className="admin-actions" style={{
                marginBottom: '2rem', 
                flexDirection: 'column', 
                alignItems: 'flex-start'
            }}>
                <h2 className="section-title" style={{margin: 0, padding: 0}}>Admin Reports</h2>
                
                <div style={{width: '100%', marginTop: '1rem'}}>
                    <label>1. Download Report by Course</label>
                    <div style={{display: 'flex', gap: '1rem', width: '100%'}}>
                        <select 
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            style={{flexGrow: 1}}
                        >
                            <option value="">-- Select a Course --</option>
                            {courses.map(course => (
                                <option key={course._id} value={course._id}>
                                    {course.code} - {course.title}
                                </option>
                            ))}
                        </select>
                        <button 
                            onClick={handleCourseDownload} 
                            disabled={isDownloading || !selectedCourse} 
                            className="action-button"
                            style={{backgroundColor: '#5bc0de', width: 'auto'}}
                        >
                            {isDownloading ? '...' : 'Download Course Report'}
                        </button>
                    </div>
                </div>

                <div style={{width: '100%', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                    <label>2. Download Master Report</label>
                    <button 
                        onClick={handleDownloadAll} 
                        disabled={isDownloading} 
                        className="action-button"
                        style={{backgroundColor: '#28a745', width: 'auto'}}
                    >
                        {isDownloading ? 'Generating...' : 'Download All Student Data (XLSX)'}
                    </button>
                </div>

                {downloadError && <p className="login-error-message" style={{marginTop: '1rem'}}>{downloadError}</p>}
            </div>

            {stats && stats.recentSurveys.length > 0 && (
                <Link to="/admin/survey-results" className="stat-card-link" style={{ textDecoration: 'none' }}>
                    <div className="survey-results-widget" style={{marginBottom: '2rem'}}>
                        <h2 className="section-title" style={{textAlign: 'left', border: 'none', margin: '0 0 1rem 0'}}>
                            Recent 'At-Risk' Surveys
                        </h2>
                        {stats.recentSurveys.map(survey => (
                            <div key={survey._id} className="survey-result-card-widget">
                                <span className={`survey-mood-badge ${getMoodClass(survey.mood)}`}>
                                    {survey.mood}
                                </span>
                                <strong>{survey.student ? survey.student.name : 'Unknown'}</strong>
                                <span className="item-date">{formatDate(survey.date)}</span>
                            </div>
                        ))}
                    </div>
                </Link>
            )}
            
            {/* --- SEARCH SECTION --- */}
            <div className="search-container" style={{borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', marginTop: '2rem'}}>
                <h2>Search Student Profiles</h2>
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
                    <div className="item-list" style={{maxHeight: '300px', overflowY: 'auto'}}>
                        {students.map((student) => (
                            <Link to={`/student/${student.user}`} key={student._id} className="student-link">
                                {/* *** THIS IS THE UPDATED SECTION *** */}
                                <div className="student-item course-card">
                                    <img 
                                        src={student.photo}
                                        alt="avatar" 
                                        className="profile-avatar"
                                        style={{width: '50px', height: '50px', margin: 0}}
                                        onError={(e) => { 
                                            e.target.onerror = null; 
                                            e.target.src="https://res.cloudinary.com/dbsovavaw/image/upload/v1762574486/08350cafa4fabb8a6a1be2d9f18f2d88_kqvnyw.jpg" 
                                        }}
                                    />
                                    <div className="student-info course-card-info">
                                        <h3 style={{margin: 0}}>{student.firstName} {student.surname}</h3>
                                        <p style={{margin: '0.25rem 0 0 0', color: '#a0a0b0', fontSize: '0.9rem'}}>
                                            Email: {student.email}
                                        </p>
                                    </div>
                                </div>
                                {/* *** END OF UPDATE *** */}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;