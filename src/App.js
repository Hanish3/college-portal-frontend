import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// Import all our real components from their files, with the correct .js extension
import Login from './components/Login.js';
import StudentDashboard from './components/StudentDashboard.js';
import AdminDashboard from './components/AdminDashboard.js';
import StudentProfile from './components/StudentProfile.js';
import Curriculum from './components/Curriculum.js';
import CreateEvent from './components/CreateEvent.js';
import CreateNotification from './components/CreateNotification.js';
import CreateCourse from './components/CreateCourse.js';
import ManageEvents from './components/ManageEvents.js';
import ManageNotifications from './components/ManageNotifications.js';
import EditStudentProfile from './components/EditStudentProfile.js';
import EditMyProfile from './components/EditMyProfile.js';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* The login page is our default route */}
                    <Route 
                        path="/login" 
                        element={
                            <div id="login-page-container">
                                <Login />
                            </div>
                        } 
                    />
                    
                    {/* Dashboard routes */}
                    <Route path="/student-dashboard" element={<StudentDashboard />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />

                    {/* Admin's detail view */}
                    <Route path="/student/:userId" element={<StudentProfile />} />

                    {/* Admin action pages (Creation) */}
                    <Route path="/admin-create-event" element={<CreateEvent />} /> 
                    <Route path="/admin-create-notification" element={<CreateNotification />} />
                    <Route path="/admin-create-course" element={<CreateCourse />} />
                    
                    {/* Admin action pages (Management/Editing) */}
                    <Route path="/admin-manage-events" element={<ManageEvents />} />
                    <Route path="/admin-manage-notifications" element={<ManageNotifications />} />
                    
                    {/* Admin edit route (editing another student) */}
                    <Route path="/admin/edit-student/:userId" element={<EditStudentProfile />} />

                    {/* Student edit route (editing their own profile) */}
                    <Route path="/student/edit-profile" element={<EditMyProfile />} />

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