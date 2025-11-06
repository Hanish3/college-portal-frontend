/* src/components/MarkAttendance.js */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

// --- (Alert component is unchanged) ---
const Alert = ({ message, type }) => (
    <div style={{
        padding: '10px',
        backgroundColor: type === 'error' ? '#f8d7da' : '#d4edda',
        color: type ==='error' ? '#721c24' : '#155724',
        border: `1px solid ${type === 'error' ? '#f5c6cb' : '#c3e6cb'}`,
        borderRadius: '5px',
        margin: '10px 0'
    }}>
        {message}
    </div>
);

const MarkAttendance = () => {
    const { userId } = useParams(); // Get student ID from the URL
    const navigate = useNavigate();

    // --- State for the form data ---
    const [selectedCourse, setSelectedCourse] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState('Present');

    // --- State for populating dropdowns ---
    const [studentName, setStudentName] = useState('');
    const [courses, setCourses] = useState([]); // Student's enrolled courses
    const [loading, setLoading] = useState(true);

    // --- State for messages ---
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // --- This runs ONCE to fetch the student's data ---
    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const token = localStorage.getItem('token'); 
                const config = { headers: { 'x-auth-token': token } };
                if (!token) {
                    setError('No auth token found. Please log in again.');
                    setLoading(false);
                    return; 
                }
                
                // Fetch the student profile, which now includes their courses
                const res = await axios.get(`http://localhost:5000/api/students/${userId}`, config);
                
                const profile = res.data;
                setStudentName(`${profile.firstName} ${profile.surname}`);
                setCourses(profile.courses || []); // Set their enrolled courses
                
                // Set default course
                if (profile.courses && profile.courses.length > 0) {
                    setSelectedCourse(profile.courses[0]._id);
                }
                setLoading(false);

            } catch (err) {
                 console.error("Error fetching student data:", err);
                 setError('Failed to load student data.');
                 setLoading(false);
            }
        };
        fetchStudentData();
    }, [userId]); // Runs only when the userId changes

    // --- Form submission handler ---
    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!selectedCourse) {
            setError('Please select a course. (Is this student enrolled in any?)');
            return;
        }

        const formData = {
            studentId: userId, // We already have this from the URL
            courseId: selectedCourse,
            date,
            status
        };

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Content-Type': 'application/json', 'x-auth-token': token } };
            
            // This still uses the single-student 'POST /api/attendance' route
            await axios.post('http://localhost:5000/api/attendance', formData, config);
            
            setSuccess(`Attendance marked for ${studentName} as ${status} on ${date}!`);
            
            // Navigate back to the student's profile after 2 seconds
            setTimeout(() => navigate(`/student/${userId}`), 2000);
        
        } catch (err) {
            if (err.response && err.response.data && err.response.data.msg) {
                setError(err.response.data.msg);
            } else {
                console.error("Submission error:", err);
                setError('A server error occurred. Please try again.');
            }
        }
    };
    
    if (loading) {
        return <div className="dashboard-container"><p>Loading student's course list...</p></div>;
    }

    // --- JSX (HTML) part ---
    return (
        <div className="dashboard-container">
            <Link to={`/student/${userId}`} className="back-link">← Back to Profile</Link>
            
            <h2>Mark Attendance for {studentName}</h2>
            
            <form className="admin-form" onSubmit={onSubmit}>
                {/* --- 1. Student (Read-only) --- */}
                <div className="form-group">
                    <label>Student</label>
                    <input 
                        type="text"
                        value={studentName}
                        disabled
                        style={{ background: '#222', color: '#aaa' }}
                    />
                </div>

                {/* --- 2. Course Dropdown (NOW FILTERED) --- */}
                <div className="form-group">
                    <label>Course</label>
                    <select 
                        value={selectedCourse} 
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        required
                        disabled={courses.length === 0}
                    >
                        {courses.length === 0 ? (
                            <option value="">This student is not enrolled in any courses</option>
                        ) : (
                            courses.map(course => (
                                <option key={course._id} value={course._id}>
                                    {course.title} ({course.code})
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {/* --- 3. Date Input (Unchanged) --- */}
                <div className="form-group">
                    <label>Date</label>
                    <input 
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>

                {/* --- 4. Status Dropdown (Unchanged) --- */}
                <div className="form-group">
                    <label>Status</label>
                    <select 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value)}
                        required
                    >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option> {/* <-- THIS LINE IS FIXED */}
                    </select>
                </div>

                {/* --- Submit Button & Messages --- */}
                <button 
                    type="submit" 
                    className="form-submit-button"
                    disabled={courses.length === 0}
                >
                    Submit Attendance
                </button>

                {error && <Alert message={error} type="error" />}
                {success && <Alert message={success} type="success" />}

            </form>
        </div>
    );
};

export default MarkAttendance;