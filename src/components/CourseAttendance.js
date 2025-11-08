/* src/components/CourseAttendance.js */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const CourseAttendance = () => {
    const { courseId } = useParams(); // Get course ID from the URL

    const [monthlyStats, setMonthlyStats] = useState([]);
    const [dailyRecords, setDailyRecords] = useState([]);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(null);
    
    // --- 1. ADD STATE FOR SUSPENSION AND ERRORS ---
    const [error, setError] = useState('');
    const [isSuspended, setIsSuspended] = useState(false);
    const [suspensionMessage, setSuspensionMessage] = useState('');


    useEffect(() => {
        const fetchMonthlyStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                
                const res = await axios.get(`https://niat-amet-college-portal-api.onrender.com/api/attendance/me/stats/${courseId}`, config);
                
                setMonthlyStats(res.data);
                if (res.data.length > 0) {
                    setCourse(res.data[0].course); // Set the course details
                }
                setLoading(false);
            } catch (err) {
                // --- 2. ADD SUSPENSION CHECK ---
                if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                    setIsSuspended(true);
                    setSuspensionMessage(err.response.data.msg || 'Your account is suspended.');
                } else {
                    console.error('Error fetching stats:', err);
                    setError('Failed to load attendance stats.');
                }
                setLoading(false);
            }
        };

        fetchMonthlyStats();
    }, [courseId]);

    // (This function is unchanged, but we'll add error handling inside)
    const onMonthClick = async (year, month) => {
        try {
            setDailyRecords([]); 
            setSelectedMonth({ year, month });
            
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };

            const res = await axios.get(`https://niat-amet-college-portal-api.onrender.com/api/attendance/me/daily/${courseId}/${year}/${month}`, config);
            
            setDailyRecords(res.data);
        } catch (err) {
            // No need to show suspension message here, it's already on the page
            console.error('Error fetching daily records:', err);
        }
    };

    // --- (All helper functions are unchanged) ---
    const getMonthName = (monthNumber) => {
        if (!monthNumber) return "Invalid Month";
        const date = new Date();
        date.setMonth(monthNumber - 1);
        return date.toLocaleString('default', { month: 'long' });
    };
    const getPercentageColor = (percentage) => {
        if (percentage >= 75) return '#28a745';
        if (percentage >= 50) return '#f0ad4e';
        return '#d9534f';
    };
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    const getStatusClass = (status) => {
        if (status === 'Present') return 'status-present';
        if (status === 'Absent') return 'status-absent';
        if (status === 'Late') return 'status-late';
        return '';
    };

    if (loading) {
        return <div className="dashboard-container"><p>Loading attendance report...</p></div>;
    }

    // --- 3. ADD RENDER BLOCK FOR SUSPENSION ---
    if (isSuspended) {
        return (
            <div className="dashboard-container">
                <Link to="/my-attendance" className="back-link">← Back to Courses</Link>
                <h1>{course ? `${course.code} - ${course.title}` : 'Attendance'}</h1>
                <div 
                    className="login-error-message" 
                    style={{
                        textAlign: 'center', 
                        padding: '2rem', 
                        fontSize: '1.2rem'
                    }}
                >
                    {suspensionMessage}
                    <p style={{fontSize: '1rem', color: '#e0e0e0', marginTop: '1rem'}}>
                        Please contact an administrator to resolve this issue.
                    </p>
                </div>
            </div>
        );
    }
    // --- END RENDER BLOCK ---

    return (
        <div className="dashboard-container">
            <Link to="/my-attendance" className="back-link">← Back to Courses</Link>
            <h1>{course ? `${course.code} - ${course.title}` : 'Attendance'}</h1>
            <p>Select a month to view your day-by-day attendance.</p>
            
            {/* --- 4. DISPLAY OTHER ERRORS --- */}
            {error && <p className="login-error-message">{error}</p>}

            <div className="monthly-stats-list">
                {monthlyStats.length > 0 ? (
                    monthlyStats.map(stat => (
                        <div 
                            key={stat.year + stat.month} 
                            className="course-card clickable"
                            onClick={() => onMonthClick(stat.year, stat.month)}
                        >
                            <div className="course-card-info">
                                <h3>{getMonthName(stat.month)} {stat.year}</h3>
                                <p className="attendance-details">
                                    <span>Present: {stat.present}</span>
                                    <span>Absent: {stat.absent}</span>
                                    <span>Late: {stat.late}</span>
                                    <span>Total: {stat.total}</span>
                                </p>
                            </div>
                            <div className="attendance-percentage-box">
                                <h2 style={{ color: getPercentageColor(stat.percentage) }}>
                                    {stat.percentage.toFixed(1)}%
                                </h2>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No attendance records found for this course.</p>
                )}
            </div>

            {/* --- Daily Records Section --- */}
            {selectedMonth && (
                <div className="daily-records-container">
                    <h2>
                        Daily Report for {getMonthName(selectedMonth.month)} {selectedMonth.year}
                    </h2>
                    {dailyRecords.length > 0 ? (
                        dailyRecords.map(record => (
                            <div key={record._id} className="daily-record-item">
                                <span className="daily-record-date">{formatDate(record.date)}</span>
                                <span className={`attendance-status ${getStatusClass(record.status)}`}>
                                    {record.status}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p>Loading daily records...</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default CourseAttendance;