import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    // --- State for the form data ---
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState('Present');

    // --- State for populating dropdowns ---
    const [students, setStudents] = useState([]); // Students (filtered)
    const [courses, setCourses] = useState([]); // All courses
    const [loadingStudents, setLoadingStudents] = useState(false);

    // --- State for messages ---
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // --- 1. This runs ONCE to fetch all courses ---
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = localStorage.getItem('token'); 
                const config = { headers: { 'x-auth-token': token } };
                if (!token) {
                    setError('No auth token found. Please log in again.');
                    return; 
                }
                const courseRes = await axios.get('http://localhost:5000/api/courses', config);
                setCourses(courseRes.data);
                
                // Set default course
                if (courseRes.data.length > 0) {
                    setSelectedCourse(courseRes.data[0]._id);
                }
            } catch (err) {
                 console.error("Error fetching courses:", err);
                 setError('Failed to load courses.');
            }
        };
        fetchCourses();
    }, []); // Runs only on mount

    // --- 2. This runs when `selectedCourse` changes ---
    useEffect(() => {
        const fetchStudentsForCourse = async () => {
            if (!selectedCourse) {
                setStudents([]); // Clear student list if no course is selected
                return;
            }
            
            setLoadingStudents(true);
            setError(''); // Clear old errors
            try {
                const token = localStorage.getItem('token'); 
                const config = { headers: { 'x-auth-token': token } };
                
                // Call our NEW API route to get students *for this course*
                const studentRes = await axios.get(
                    `http://localhost:5000/api/students/by-course/${selectedCourse}`, 
                    config
                );

                setStudents(studentRes.data);
                
                // Set default student
                if (studentRes.data.length > 0) {
                    setSelectedStudent(studentRes.data[0].user);
                } else {
                    setSelectedStudent(''); // No students enrolled
                }
                setLoadingStudents(false);

            } catch (err) {
                 console.error("Error fetching students:", err);
                 setError('Failed to load students for this course.');
                 setLoadingStudents(false);
                 setStudents([]); // Clear list on error
            }
        };

        fetchStudentsForCourse();
    }, [selectedCourse]); // Re-runs every time selectedCourse changes

    // --- 3. Form submission handler ---
    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!selectedStudent) {
            setError('Please select a student. (Is anyone enrolled in this course?)');
            return;
        }

        const formData = {
            studentId: selectedStudent,
            courseId: selectedCourse,
            date,
            status
        };

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            if (!token) {
                setError('No auth token found. Please log in again.');
                return;
            }
            
            const res = await axios.post('http://localhost:5000/api/attendance', formData, config);
            setSuccess(`Attendance marked for ${status} on ${date}!`);
        
        } catch (err) {
            if (err.response && err.response.data && err.response.data.msg) {
                setError(err.response.data.msg);
            } else {
                console.error("Submission error:", err);
                setError('A server error occurred. Please try again.');
            }
        }
    };

    // --- JSX (HTML) part ---
    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
            <h2>Mark Attendance</h2>
            
            <form onSubmit={onSubmit}>
                {/* --- 1. Course Dropdown (NOW CONTROLS STUDENTS) --- */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Course</label>
                    <select 
                        value={selectedCourse} 
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    >
                        {courses.length === 0 ? (
                            <option value="">Loading courses...</option>
                        ) : (
                            courses.map(course => (
                                <option key={course._id} value={course._id}>
                                    {course.title} ({course.code})
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {/* --- 2. Student Dropdown (NOW FILTERED) --- */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Student</label>
                    <select 
                        value={selectedStudent} 
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        required
                        disabled={loadingStudents || students.length === 0} // Disable if loading or empty
                        style={{ width: '100%', padding: '8px' }}
                    >
                        {loadingStudents ? (
                            <option value="">Loading students...</option>
                        ) : students.length === 0 ? (
                            <option value="">No students enrolled in this course</option>
                        ) : (
                            students.map(student => (
                                <option key={student._id} value={student.user}>
                                    {student.firstName} {student.surname}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {/* --- 3. Date Input --- */}
                <div style={{ marginBottom: '15px' }}>
                    {/* ... (date input is unchanged) ... */}
                    <label>Date</label>
                    <input 
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                {/* --- 4. Status Dropdown --- */}
                <div style={{ marginBottom: '15px' }}>
                    {/* ... (status input is unchanged) ... */}
                    <label>Status</label>
                    <select 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                    </select>
                </div>

                {/* --- Submit Button & Messages --- */}
                <button 
                    type="submit" 
                    style={{ width: '100%', padding: '12px', cursor: 'pointer' }}
                    disabled={loadingStudents || students.length === 0}
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