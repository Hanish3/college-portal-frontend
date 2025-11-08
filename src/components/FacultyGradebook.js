/* src/components/FacultyGradebook.js (NEW FILE) */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// --- THIS IS THE FIX: 'useNavigate' is removed ---
import { Link } from 'react-router-dom'; 

const FacultyGradebook = () => {
    // --- THIS IS THE FIX: This line is deleted ---
    // const navigate = useNavigate();

    // --- State for Data ---
    const [myCourses, setMyCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [gradebookData, setGradebookData] = useState([]); // This holds the student list
    const [totalMarks, setTotalMarks] = useState(100);

    // --- State for UI ---
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingGrades, setLoadingGrades] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // 1. Fetch the faculty's assigned courses for the dropdown
    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get('https://niat-amet-college-portal-api.onrender.com/api/courses/my-courses', config);
                setMyCourses(res.data);
                setLoadingCourses(false);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to load your assigned courses.');
                setLoadingCourses(false);
            }
        };
        fetchMyCourses();
    }, []); 

    // 2. Fetch the gradebook for the selected course
    const onCourseChange = async (courseId) => {
        if (!courseId) {
            setSelectedCourse('');
            setGradebookData([]);
            return;
        }

        setSelectedCourse(courseId);
        setLoadingGrades(true);
        setMessage('');
        setError('');
        
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            
            // Call our new API route
            const res = await axios.get(`https://niat-amet-college-portal-api.onrender.com/api/grades/course/${courseId}`, config);
            
            setGradebookData(res.data);
            
            // Set total marks based on the first student (if available)
            if (res.data.length > 0) {
                setTotalMarks(res.data[0].totalMarks);
            }

            setLoadingGrades(false);
        } catch (err) {
            console.error('Error fetching gradebook:', err);
            setError('Failed to load students for this course.');
            setLoadingGrades(false);
        }
    };

    // 3. Handle a change in a single student's grade input
    const handleMarkChange = (studentId, newMark) => {
        setGradebookData(prevData =>
            prevData.map(student =>
                student.studentId === studentId
                    ? { ...student, marksObtained: newMark }
                    : student
            )
        );
    };

    // 4. Save all grades for the course
    const onSubmit = async (e) => {
        e.preventDefault();
        setMessage('Saving grades...');
        setError('');

        // Format data for the batch API
        const formattedGrades = gradebookData.map(student => ({
            studentId: student.studentId,
            marksObtained: student.marksObtained
        }));

        const body = {
            courseId: selectedCourse,
            totalMarks: totalMarks,
            grades: formattedGrades
        };

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Content-Type': 'application/json', 'x-auth-token': token } };
            
            // Call our new batch route
            const res = await axios.post('https://niat-amet-college-portal-api.onrender.com/api/grades/batch', body, config);
            
            setMessage(res.data.msg || 'Grades saved successfully!');
            setTimeout(() => setMessage(''), 3000); // Clear message after 3s

        } catch (err) {
            console.error("Error submitting grades:", err);
            setError(err.response?.data?.msg || 'An error occurred. Please try again.');
            setMessage('');
        }
    };


    return (
        <div className="dashboard-container">
            <Link to="/faculty-dashboard" className="back-link">← Back to Dashboard</Link>
            <h1>Faculty Gradebook</h1>
            <p>Select a course to view and edit student grades.</p>

            {message && <p className="form-message" style={{color: '#28a745'}}>{message}</p>}
            {error && <p className="login-error-message">{error}</p>}

            <form className="admin-form" onSubmit={onSubmit}>
                {/* --- Course Selection Dropdown --- */}
                <div className="form-group">
                    <label>Select Course</label>
                    <select 
                        value={selectedCourse}
                        onChange={(e) => onCourseChange(e.target.value)}
                        disabled={loadingCourses}
                    >
                        <option value="">{loadingCourses ? 'Loading...' : '-- Select a Course --'}</option>
                        {myCourses.length > 0 ? (
                            myCourses.map(course => (
                                <option key={course._id} value={course._id}>
                                    {course.code} - {course.title}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>You are not assigned to any courses.</option>
                        )}
                    </select>
                </div>

                {/* --- Gradebook List --- */}
                {loadingGrades && <p>Loading class list...</p>}
                
                {gradebookData.length > 0 && (
                    <div style={{marginTop: '2rem'}}>
                        {/* --- Total Marks Input --- */}
                        <div className="form-group" style={{maxWidth: '200px'}}>
                            <label>Total Marks</label>
                            <input
                                type="number"
                                value={totalMarks}
                                onChange={(e) => setTotalMarks(e.target.value)}
                            />
                        </div>

                        {/* --- Student Grade Inputs --- */}
                        <div className="item-list">
                            {gradebookData.map(student => (
                                <div key={student.studentId} className="course-card" style={{ padding: '0.75rem 1.5rem' }}>
                                    <div className="course-card-info">
                                        <h3 style={{ margin: 0 }}>{student.name}</h3>
                                        <p style={{ margin: '0.25rem 0 0 0', color: '#a0a0b0', fontSize: '0.9rem' }}>
                                            {student.email}
                                        </p>
                                    </div>
                                    <div className="admin-button-group" style={{ flexDirection: 'row', gap: '0.5rem', alignItems: 'center' }}>
                                        <input
                                            type="number"
                                            value={student.marksObtained}
                                            onChange={(e) => handleMarkChange(student.studentId, e.target.value)}
                                            style={{ width: '80px', textAlign: 'center' }}
                                        />
                                        <span style={{color: '#c0c0c0', marginLeft: '0.25rem'}}> / {totalMarks}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* --- Submit --- */}
                        <button 
                            type="submit" 
                            className="form-submit-button" 
                            style={{ marginTop: '2rem' }}
                        >
                            Save All Grades
                        </button>
                    </div>
                )}
                
                {!loadingGrades && gradebookData.length === 0 && selectedCourse && (
                    <p>No students are enrolled in this course yet.</p>
                )}

            </form>
        </div>
    );
};

export default FacultyGradebook;