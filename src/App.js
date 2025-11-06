/* src/App.js */
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar.js'; 

// Import all our component pages
import Login from './components/Login.js';
import Register from './components/Register.js';
import StudentDashboard from './components/StudentDashboard.js'; 
import AdminDashboard from './components/AdminDashboard.js'; 
import FacultyDashboard from './components/FacultyDashboard.js'; // <-- 1. IMPORT THE NEW DASHBOARD
import StudentProfile from './components/StudentProfile.js'; 
import Curriculum from './components/Curriculum.js'; 
import CreateEvent from './components/CreateEvent.js'; 
import CreateNotification from './components/CreateNotification.js'; 
import CreateCourse from './components/CreateCourse.js'; 
import ManageEvents from './components/ManageEvents.js'; 
import ManageNotifications from './components/ManageNotifications.js';
import ManageUsers from './components/ManageUsers.js';
import EditStudentProfile from './components/EditStudentProfile.js'; 
import EditMyProfile from './components/EditMyProfile.js'; 
import MarkAttendance from './components/MarkAttendance.js'; 
import MyAttendance from './components/MyAttendance.js'; 
import CourseAttendance from './components/CourseAttendance.js';
import Timetable from './components/Timetable.js';
import EditCourse from './components/EditCourse.js';

/**
 * This is our new "private" layout.
 * It shows the Sidebar + Page content for all logged-in pages.
 * The <Outlet /> renders the specific page (e.g., Dashboard).
 */
const PrivateLayout = () => {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <Outlet /> {/* Child routes will render here */}
            </main>
        </div>
    );
};


// The main App component just sets up the Router
function App() {
    return (
        <Router>
            <Routes>
                {/* --- Public Routes --- */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* --- Private Routes --- */}
                <Route element={<PrivateLayout />}>
                    <Route path="/student-dashboard" element={<StudentDashboard />} />
                    
                    {/* --- UPDATED: Split Admin & Faculty Dashboards --- */}
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/faculty-dashboard" element={<FacultyDashboard />} /> {/* <-- 2. ADD THE NEW ROUTE */}

                    <Route path="/student/:userId" element={<StudentProfile />} />
                    <Route path="/admin-create-event" element={<CreateEvent />} /> 
                    <Route path="/admin-create-notification" element={<CreateNotification />} />
                    <Route path="/admin-create-course" element={<CreateCourse />} />
                    <Route path="/admin-manage-events" element={<ManageEvents />} />
                    <Route path="/admin-manage-notifications" element={<ManageNotifications />} />
                    <Route path="/admin-manage-users" element={<ManageUsers />} />
                    <Route path="/admin/edit-student/:userId" element={<EditStudentProfile />} />
                    <Route path="/admin/mark-attendance/:userId" element={<MarkAttendance />} />
                    <Route path="/admin/edit-course/:courseId" element={<EditCourse />} />
                    
                    <Route path="/student/edit-profile" element={<EditMyProfile />} />
                    <Route path="/my-attendance" element={<MyAttendance />} />
                    <Route path="/my-attendance/:courseId" element={<CourseAttendance />} />
                    <Route path="/curriculum" element={<Curriculum />} /> 
                    <Route path="/timetable" element={<Timetable />} /> 
                </Route>

                {/* Redirects any other URL to the login page */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;