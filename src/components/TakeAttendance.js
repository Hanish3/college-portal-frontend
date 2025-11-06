/* src/components/TakeAttendance.js (NEW FILE) */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

const TakeAttendance = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [students, setStudents] = useState([]);
    // This state will hold the status for each student
    // e.g., { "studentId1": "Present", "studentId2": "Present", ... }
    const [attendanceData, setAttendanceData] = useState({});
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };

                // Fetch course details and student list in parallel
                const [courseRes, studentsRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/courses/${courseId}`, config),
                    axios.get(`http://localhost:5000/api/students/by-course/${courseId}`, config)
                ]);

                setCourse(courseRes.data);
                setStudents(studentsRes.data);

                // Initialize attendance state: set all students to "Present" by default
                const initialData = {};
                for (const student of studentsRes.data) {
                    initialData[student.user] = 'Present'; // 'student.user' is the student's User ID
                }
                setAttendanceData(initialData);
                setLoading(false);

            } catch (err) {
                console.error("Error fetching data:", err);
                setError('Failed to load course or student data. Please go back and try again.');
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId]);

    // Handler to update a single student's status
    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prevData => ({
            ...prevData,
            [studentId]: status
        }));
    };

    // Handler to set all students' status at once
    const setAllStatus = (status) => {
        const allSetData = {};
        for (const student of students) {
            allSetData[student.user] = status;
        }
        setAttendanceData(allSetData);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('Submitting...');

        // Convert our state object { "id": "Status" } to the array [ { studentId: "id", status: "Status" } ]
        const formattedData = Object.keys(attendanceData).map(studentId => ({
            studentId: studentId,
            status: attendanceData[studentId]
        }));

        const body = {
            courseId,
            date,
            attendanceData: formattedData
        };

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Content-Type': 'application/json', 'x-auth-token': token } };
            
            // Call our new batch route
            const res = await axios.post('http://localhost:5000/api/attendance/batch', body, config);
            
            setMessage(res.data.msg || 'Attendance submitted successfully!');
            setTimeout(() => navigate('/faculty-dashboard'), 2000);

        } catch (err) {
            console.error("Error submitting attendance:", err);
            setError(err.response?.data?.msg || 'An error occurred. Please try again.');
            setMessage('');
        }
    };

    if (loading) {
        return <div className="dashboard-container"><p>Loading class list...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <Link to="/faculty-dashboard" className="back-link">← Back to Dashboard</Link>
            <h1>Take Attendance</h1>
            {course && <h2>{course.code} - {course.title}</h2>}

            <form className="admin-form" onSubmit={onSubmit}>
                {/* --- Date Picker --- */}
                <div className="form-group" style={{ maxWidth: '300px' }}>
                    <label>Select Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>

                {/* --- "Set All" Buttons --- */}
                <div className="admin-actions" style={{ padding: '0.5rem', marginBottom: '1rem' }}>
                    <button type="button" onClick={() => setAllStatus('Present')} className="enroll-button" style={{ width: 'auto' }}>
                        Set All Present
                    </button>
                    <button type="button" onClick={() => setAllStatus('Absent')} className="delete-button" style={{ width: 'auto' }}>
                        Set All Absent
                    </button>
                    <button type="button" onClick={() => setAllStatus('Late')} className="leave-button" style={{ width: 'auto' }}>
                        Set All Late
                    </button>
                </div>

                {/* --- Student List --- */}
                <div className="item-list">
                    {students.length > 0 ? (
                        students.map(student => (
                            <div key={student.user} className="course-card" style={{ padding: '0.75rem 1.5rem' }}>
                                <div className="course-card-info">
                                    <h3 style={{ margin: 0 }}>{student.firstName} {student.surname}</h3>
                                </div>
                                {/* --- Radio Button Group --- */}
                                <div className="admin-button-group" style={{ flexDirection: 'row', gap: '0.5rem' }}>
                                    <label className="status-radio">
                                        <input 
                                            type="radio" 
                                            name={`status-${student.user}`} 
                                            value="Present" 
                                            checked={attendanceData[student.user] === 'Present'}
                                            onChange={() => handleStatusChange(student.user, 'Present')} 
                                        /> Present
                                    </label>
                                    <label className="status-radio">
                                        <input 
                                            type="radio" 
                                            name={`status-${student.user}`} 
                                            value="Absent" 
                                            checked={attendanceData[student.user] === 'Absent'}
                                            onChange={() => handleStatusChange(student.user, 'Absent')} 
                                        /> Absent
                                    </label>
                                    <label className="status-radio">
                                        <input 
                                            type="radio" 
                                            name={`status-${student.user}`} 
                                            value="Late" 
                                            checked={attendanceData[student.user] === 'Late'}
                                            onChange={() => handleStatusChange(student.user, 'Late')} 
                                        /> Late
                                    </label>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No students are enrolled in this course yet.</p>
                    )}
                </div>

                {/* --- Submit --- */}
                <button 
                    type="submit" 
                    className="form-submit-button" 
                    style={{ marginTop: '2rem' }}
                    disabled={students.length === 0}
                >
                    Submit Attendance for {date}
                </button>
                
                {message && <p className="form-message" style={{ color: '#28a745' }}>{message}</p>}
                {error && <p className="login-error-message">{error}</p>}
            </form>
        </div>
    );
};

export default TakeAttendance;