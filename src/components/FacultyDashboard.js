/* src/components/FacultyDashboard.js (Fix Search Error Handling) */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const FacultyDashboard = () => {
    // --- (State for courses is unchanged) ---
    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- State for the search bar ---
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [message, setMessage] = useState('Search for students by name.');
    // --- END NEW ---

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                
                // NOTE: This will be empty if no courses are assigned (as seen in your screenshot)
                const res = await axios.get('http://localhost:5000/api/courses/my-courses', config);
                
                setMyCourses(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to load your assigned courses.');
                setLoading(false);
            }
        };
        fetchMyCourses();
    }, []); 

    // --- FIX: Robust Search function ---
    const onSearch = async (e) => {
        e.preventDefault();
        setMessage('Searching...');
        setError(''); // Clear previous error
        setStudents([]); // Clear previous results
        
        if (!searchTerm.trim()) {
            setMessage('Please enter a name to search.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You are not logged in.');
                return;
            }
            
            const config = {
                headers: { 'x-auth-token': token },
            };
            
            // This route should only return basic student profiles
            const res = await axios.get(
                `http://localhost:5000/api/students/search?name=${searchTerm}`,
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
            // FIX: Check for the most likely error message property first
            const errMsg = err.response?.data?.msg || err.message || 'A network error occurred. Check server logs.';
            setError(`Error: ${errMsg}`);
            setMessage('');
            setStudents([]);
        }
    };
    // --- END FIX ---

    if (loading) {
        return <div className="dashboard-container"><p>Loading your courses...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <h1>Welcome, Faculty!</h1>
            
            {/* --- SECTION 1: STUDENT SEARCH (NEW) --- */}
            <div className="search-container" style={{marginTop: '2rem'}}>
                <h2>Search Students</h2>
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
                
                {/* FIX: Display error separately from the status/message */}
                {error && <p className="login-error-message">{error}</p>}
                
                {message && <p>{message}</p>}
                
                {students.length > 0 && (
                    <ul>
                        {students.map((student) => (
                            // NOTE: student.user is the User ID used for linking to the profile
                            <Link to={`/student/${student.user}`} key={student._id} className="student-link">
                                <li className="student-item">
                                    {/* Placeholder for avatar */}
                                    <img 
                                        src="default-avatar.png"
                                        alt="avatar" 
                                        className="avatar" 
                                    />
                                    <div className="student-info">
                                        <strong>{student.firstName} {student.surname}</strong>
                                        <span>Email: {student.email}</span>
                                    </div>
                                </li>
                            </Link>
                        ))}
                    </ul>
                )}
            </div>
            {/* --- END NEW SECTION --- */}


            {/* --- SECTION 2: MY COURSES (Original) --- */}
            <a id="attendance"></a> {/* Anchor for sidebar link */}
            <h2 style={{marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem'}}>
                My Assigned Courses
            </h2>
            <p>Here are the courses you are assigned to for this semester.</p>

            {error && <p className="login-error-message">{error}</p>}

            <div className="course-list">
                {myCourses.length > 0 ? (
                    myCourses.map(course => (
                        <div key={course._id} className="course-card">
                            <div className="course-card-info">
                                <h3>{course.code} - {course.title}</h3>
                                <p>{course.description}</p>
                            </div>
                            
                            <div className="admin-button-group">
                                <Link 
                                    to={`/faculty/take-attendance/${course._id}`}
                                    className="edit-button"
                                >
                                    Take Attendance
                                </Link>
                                {/* We would add the "View Report" link here later */}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>You have not been assigned to any courses yet. An Admin must assign courses to you first.</p>
                )}
            </div>
            {/* --- END ORIGINAL SECTION --- */}
        </div>
    );
};

export default FacultyDashboard;