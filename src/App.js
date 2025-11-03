import React from 'react';
// 1. Added useParams to get the ID from the URL
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';

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
        </div>
    );
};

const AdminDashboard = () => {
    return (
        <div className="p-8 font-sans">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Admin Dashboard</h1>
            <p className="text-lg text-gray-700">Welcome, Admin! Manage students, faculty, and events here.</p>
            {/* Admin-specific tools and data would go here */}
        </div>
    );
};

// 2. This is the new component you wanted to import.
//    We're using useParams to get the :userId from the URL.
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
                {/* In a real app, you would use this userId to fetch data */}
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


// --- Main App Component ---
// This is your original App component, now using the
// placeholder components defined above.
function App() {
    return (
        <Router>
            <div className="App bg-gray-50 min-h-screen">
                <Routes>
                    {/* The login page is our default route */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* These are the new dashboard routes */}
                    <Route path="/student-dashboard" element={<StudentDashboard />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />

                    {/* 2. ADDED THIS NEW DYNAMIC ROUTE */}
                    <Route path="/student/:userId" element={<StudentProfile />} />

                    {/* Redirects any unknown URL to the login page */}
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

