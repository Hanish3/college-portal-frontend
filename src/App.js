import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar.js'; // <-- Import our new Sidebar

// --- Import all our component pages ---
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

/**
 * This is a helper component to manage the layout.
 * It shows the Sidebar + Page content, or just the Login page.
 */
const AppLayout = () => {
    const location = useLocation();
    
    // Check if we are on the login page
    const isLoginPage = location.pathname === '/login';

    if (isLoginPage) {
        return (
            <div id="login-page-container">
                <Login />
            </div>
        );
    }

    // If not on login, show the main app layout with sidebar
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <Routes>
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

                    {/* Shared curriculum view */}
                    <Route path="/curriculum" element={<Curriculum />} />

                    {/* Redirects any unknown URL to the login page */}
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </main>
        </div>
    );
};

// The main App component just sets up the Router
function App() {
    return (
        <Router>
            <AppLayout />
        </Router>
    );
}

export default App;