/* src/components/ViewSurveyResults.js (UPDATED FOR COLLAPSIBLE VIEW) */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ViewSurveyResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dashboardPath, setDashboardPath] = useState('/faculty-dashboard');
    
    // --- NEW STATE: Tracks the ID of the currently open/expanded survey card ---
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };

                // Set dashboard path based on role
                const decoded = jwtDecode(token);
                if (decoded.user.role === 'admin') {
                    setDashboardPath('/admin-dashboard');
                }

                // Fetch survey results
                const res = await axios.get('http://localhost:5000/api/survey/results', config);
                setResults(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching results:', err);
                setError('Failed to load survey results.');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Helper to format the date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Helper to get CSS class for mood
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
    
    // --- NEW: Toggle function to open/close the details ---
    const toggleExpansion = (id) => {
        setExpandedId(prevId => (prevId === id ? null : id));
    };


    if (loading) {
        return <div className="dashboard-container"><p>Loading survey results...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <Link to={dashboardPath} className="back-link">← Back to Dashboard</Link>
            <h1>Student Mood Survey Results</h1>
            <p>Click on a student's name to view their detailed responses.</p>
            {error && <p className="login-error-message">{error}</p>}
            
            <div className="item-list" style={{maxHeight: 'none'}}>
                {results.length > 0 ? (
                    results.map(res => (
                        <div key={res._id} className="survey-result-card">
                            
                            {/* --- CLICKABLE HEADER --- */}
                            <div 
                                className="survey-result-header" 
                                onClick={() => toggleExpansion(res._id)}
                                style={{cursor: 'pointer', userSelect: 'none', borderBottom: expandedId === res._id ? '1px solid rgba(255,255,255,0.1)' : 'none', paddingBottom: expandedId === res._id ? '1rem' : '0'}}
                            >
                                <span className="survey-student-name" style={{color: expandedId === res._id ? '#6e8efb' : '#ffffff'}}>
                                    {res.student ? res.student.name : 'Unknown Student'}
                                </span>
                                <span className="item-date">{formatDate(res.date)} 
                                    <span style={{marginLeft: '1rem'}}>
                                        {expandedId === res._id ? '▲' : '▼'}
                                    </span>
                                </span>
                            </div>
                            
                            {/* --- COLLAPSIBLE CONTENT --- */}
                            {expandedId === res._id && (
                                <div style={{paddingTop: '1rem'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                                        <div className={`survey-mood-badge ${getMoodClass(res.mood)}`}>
                                            Mood: {res.mood}
                                        </div>
                                        <span style={{color: '#ccc'}}>Total Score: {res.totalScore}</span>
                                    </div>

                                    <div className="survey-responses-list" style={{marginTop: '1.5rem'}}>
                                        {res.responses && res.responses.map((r, index) => (
                                            <div key={index} style={{
                                                background: 'rgba(0,0,0,0.2)', 
                                                padding: '0.75rem 1rem', 
                                                borderRadius: '4px', 
                                                marginBottom: '0.5rem'
                                            }}>
                                                <p style={{margin: 0, color: '#a0a0b0'}}>
                                                    <strong>Q:</strong> {r.questionText}
                                                </p>
                                                <p style={{margin: '0.25rem 0 0 0', color: '#fff', fontWeight: '500'}}>
                                                    <strong>A:</strong> {r.answerText} (Score: {r.score})
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {res.comments && (
                                        <p className="survey-result-comment">
                                            <strong>Comments:</strong> "{res.comments}"
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No survey responses have been submitted yet.</p>
                )}
            </div>
        </div>
    );
};

export default ViewSurveyResults;