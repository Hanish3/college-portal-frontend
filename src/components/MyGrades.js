/* src/components/MyGrades.js (NEW FILE) */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MyGrades = () => {
    const [myGrades, setMyGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyGrades = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                
                // Call our new 'me' route for grades
                const res = await axios.get('http://localhost:5000/api/grades/me', config);
                
                setMyGrades(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching grades:', err);
                setError('Failed to load your grades. Please try again later.');
                setLoading(false);
            }
        };

        fetchMyGrades();
    }, []);

    // Helper to calculate percentage and color
    const getGradeDetails = (grade) => {
        if (!grade.totalMarks || grade.totalMarks === 0) {
            return { percentage: 'N/A', color: '#e0e0e0' };
        }
        
        const percentage = (grade.marksObtained / grade.totalMarks) * 100;
        let color;

        if (percentage >= 85) {
            color = '#28a745'; // Green
        } else if (percentage >= 70) {
            color = '#5bc0de'; // Blue
        } else if (percentage >= 50) {
            color = '#f0ad4e'; // Yellow
        } else {
            color = '#d9534f'; // Red
        }

        return { percentage: percentage.toFixed(1), color };
    };

    if (loading) {
        return <div className="dashboard-container"><p>Loading your grades...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <Link to="/student-dashboard" className="back-link">← Back to Dashboard</Link>
            <h1>My Grades</h1>
            <p>Here are your grades for the semester.</p>

            {error && <p className="login-error-message">{error}</p>}

            <div className="item-list">
                {myGrades.length > 0 ? (
                    myGrades.map(grade => {
                        const { percentage, color } = getGradeDetails(grade);
                        return (
                            <div key={grade._id} className="course-card">
                                <div className="course-card-info">
                                    <h3>{grade.course.code} - {grade.course.title}</h3>
                                    <p style={{color: '#a0a0b0', margin: '0.5rem 0 0 0'}}>
                                        Assessment: <strong>{grade.assessmentTitle}</strong>
                                    </p>
                                </div>
                                
                                <div className="attendance-percentage-box">
                                    <h2 style={{ color: color }}>
                                        {percentage}%
                                    </h2>
                                    <p style={{color: '#e0e0e0', fontWeight: 'bold'}}>
                                        {grade.marksObtained} / {grade.totalMarks}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p>Your grades have not been posted yet.</p>
                )}
            </div>
        </div>
    );
};

export default MyGrades;