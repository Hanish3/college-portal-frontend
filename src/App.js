import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// Import all our real components from their files
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import StudentProfile from './components/StudentProfile';
import Curriculum from './components/Curriculum'; // Import our new page

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* The login page is our default route */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* Dashboard routes */}
                    <Route path="/student-dashboard" element={<StudentDashboard />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />

                    {/* Admin's detail view */}
                    <Route path="/student/:userId" element={<StudentProfile />} />

                    {/* Student's curriculum view */}
                    <Route path="/curriculum" element={<Curriculum />} />

                    {/* Redirects any unknown URL to the login page */}
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;