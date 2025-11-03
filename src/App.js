import React, { useState } from 'react';
// 1. Importing all necessary router components and hooks
import { BrowserRouter as Router, Route, Routes, Navigate, useParams, Link } from 'react-router-dom';
// We'll mock axios for this single-file example
// import axios from 'axios'; 

// --- Placeholder Components ---
// To fix the "Could not resolve" errors in this environment,
// we must define all components in this single file.

const Login = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 font-sans">
            <div className="p-8 bg-white rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login</h2>
                <form>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                        <input type="email" id="email" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="user@example.com" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
                        <input type="password" id="password" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="********" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

const StudentDashboard = () => {
    return (
        <div className="p-8 font-sans">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Student Dashboard</h1>
            <p className="text-lg text-gray-700">Welcome, Student!</p>
            {/* You would fetch and display student-specific data here */}
            <nav className="mt-6">
                <Link to="/curriculum" className="text-blue-600 hover:underline">View Curriculum</Link>
            </nav>
        </div>
    );
};

const AdminDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    // Mock student data
    const mockStudents = [
        { _id: '1', user: 'u123', name: 'Hanish Sharma', email: 'hanish@example.com' },
        { _id: '2', user: 'u456', name: 'Jane Doe', email: 'jane@example.com' },
    ];
    const [students, setStudents] = useState(mockStudents);
    const [message, setMessage] = useState('Search for students by name.');

    const onSearch = (e) => {
        e.preventDefault();
        setMessage('Searching...');
        const filteredStudents = mockStudents.filter(s => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setStudents(filteredStudents);
        setMessage(filteredStudents.length === 0 ? 'No students found.' : '');
    };

    return (
        <div className="p-8 font-sans">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Admin Dashboard</h1>
            <div className="search-container mb-6">
                <form onSubmit={onSearch}>
                    <input
                        type="text"
                        placeholder="Search student name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="search-button bg-blue-600 text-white py-2 px-4 rounded-lg ml-2 hover:bg-blue-700 transition duration-300">Search</button>
                </form>
            </div>
            <div className="results-container">
                {message && <p className="text-gray-600">{message}</p>}
                {students.length > 0 && (
                    <ul className="mt-4 space-y-3">
                        {students.map((student) => (
                            <Link to={`/student/${student.user}`} key={student._id} className="student-link block p-4 bg-white rounded-lg shadow hover:shadow-md transition duration-300">
                                <li className="student-item flex items-center">
                                    <img 
                                        src={`https://placehold.co/60x60/E2E8F0/64748B?text=${student.name.charAt(0)}`}
                                        alt="avatar" 
                                        className="avatar w-12 h-12 rounded-full mr-4" 
                                    />
                                    <div className="student-info">
                                        <strong className="text-lg text-gray-800">{student.name}</strong>
                                        <span className="block text-gray-600">{student.email}</span>
                                    </div>
                                </li>
                            </Link>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const StudentProfile = () => {
    const { userId } = useParams();
    return (
        <div className="p-8 max-w-2xl mx-auto font-sans">
            <div className="bg-white shadow-md rounded-lg p-6 mt-10">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">Student Profile</h1>
                <p className="text-lg text-gray-700">
                    Displaying profile for user ID: 
                    <span className="font-medium text-blue-600 ml-2">{userId}</span>
                </p>
                <div className="mt-6 border-t pt-4">
                    <h3 className="text-xl font-semibold text-gray-700">Details</h3>
                    <p className="text-gray-600 mt-2">Name: (Student Name)</p>
                    <p className="text-gray-600">Email: (Student Email)</p>
                    <p className="text-gray-600">Major: (Student Major)</p>
                </div>
            </div>
        </div>
    );
};

// 3. This is the new component you wanted to import.
const Curriculum = () => {
    // Mock course data
    const semesters = [
        { 
            name: "Semester 1", 
            courses: [
                { code: "CS101", title: "Introduction to Programming" },
                { code: "MA101", title: "Calculus I" },
            ] 
        },
        { 
            name: "Semester 2", 
            courses: [
                { code: "CS102", title: "Data Structures" },
                { code: "PH101", title: "Physics I" },
            ] 
        },
    ];

    return (
        <div className="p-8 max-w-4xl mx-auto font-sans">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Curriculum - Computer Science</h1>
            <div className="space-y-6">
                {semesters.map(semester => (
                    <div key={semester.name} className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{semester.name}</h2>
                        <ul className="space-y-2">
                            {semester.courses.map(course => (
                                <li key={course.code} className="p-3 bg-gray-50 rounded-md">
                                    <span className="font-medium text-gray-900">{course.code}:</span>
                                    <span className="text-gray-700 ml-2">{course.title}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Main App Component ---
function App() {
    return (
        <Router>
            <div className="App bg-gray-50 min-h-screen">
                <Routes>
                    {/* The login page is our default route */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* These are the dashboard routes */}
                    <Route path="/student-dashboard" element={<StudentDashboard />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />

                    {/* This is the new dynamic route for a student's profile */}
                    <Route path="/student/:userId" element={<StudentProfile />} />

                    {/* 2. ADDED THIS NEW ROUTE */}
                    <Route path="/curriculum" element={<Curriculum />} />

                    {/* Redirects any unknown URL to the login page */}
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

