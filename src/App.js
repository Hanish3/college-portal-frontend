import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* The login page is our default route */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* These are the new dashboard routes */}
                    <Route path="/student-dashboard" element={<StudentDashboard />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />

                    {/* Redirects any unknown URL to the login page */}
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;