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
    // --- (Search state is unchanged) ---
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [message, setMessage] = useState('Search for students by name.');

    // --- (Stats state is unchanged) ---
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    // --- NEW STATE FOR COURSE EXPORT ---
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState('');

    // --- UPDATED useEffect to fetch STATS AND COURSES ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                
                // Fetch stats and courses in parallel
                const [statsRes, coursesRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/dashboard/admin-stats', config),
                    axios.get('http://localhost:5000/api/courses', config) // Fetches all courses
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
    }, []); // Runs once on load

    // --- (Search function is unchanged) ---
    const onSearch = async (e) => {
        // ... (same as before)
    };
    
    // --- (formatDate function is unchanged) ---
    const formatDate = (dateString) => {
        // ... (same as before)
    };

    // --- DOWNLOAD HANDLER FOR SPECIFIC COURSE ---
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
                `http://localhost:5000/api/students/export/${selectedCourse}`,
                {
                    headers: { 'x-auth-token': token },
                    responseType: 'blob' 
                }
            );
            
            // Get filename from the response header
            const contentDisposition = res.headers['content-disposition'];
            let filename = 'course_report.xlsx'; // default
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

    // --- DOWNLOAD HANDLER FOR ALL STUDENTS (Master Report) ---
    const handleDownloadAll = async () => {
        setIsDownloading(true);
        setDownloadError('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(
                'http://localhost:5000/api/students/export/all',
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


    return (
        <div className="dashboard-container">
            <h1>Welcome, Admin!</h1>

            {/* --- STATS SECTION (unchanged) --- */}
            <h2 className="section-title">At a Glance</h2>
            {loadingStats ? (
                <p>Loading stats...</p>
            ) : stats && (
                <div className="stats-grid">
                    {/* ... (StatCards are unchanged) ... */}
                </div>
            )}
            
            {/* --- UPDATED EXPORT SECTION --- */}
            <div className="admin-actions" style={{
                marginBottom: '2rem', 
                flexDirection: 'column', 
                alignItems: 'flex-start'
            }}>
                <h2 className="section-title" style={{margin: 0, padding: 0}}>Admin Reports</h2>
                
                {/* Course-Specific Export */}
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

                {/* Master Export */}
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
            {/* --- END OF UPDATED SECTION --- */}


            {/* --- (Survey and Search sections are unchanged) --- */}
            
            {stats && stats.recentSurveys.length > 0 && (
                <div className="survey-results-widget">
                    {/* ... (same as before) ... */}
                </div>
            )}

            <div className="search-container" style={{borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', marginTop: '2rem'}}>
                {/* ... (same as before) ... */}
            </div>
            <div className="results-container">
                {/* ... (same as before) ... */}
            </div>
        </div>
    );
};

export default AdminDashboard;