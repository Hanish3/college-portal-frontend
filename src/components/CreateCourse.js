import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
// import Navbar from './Navbar'; // <-- DELETED

const CreateCourse = () => {
    const [formData, setFormData] = useState({
        code: '',
        title: '',
        description: '',
    });
    const [statusMessage, setStatusMessage] = useState('');
    const navigate = useNavigate();

    const { code, title, description } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
        };

        const body = JSON.stringify({ code, title, description });

        try {
            await axios.post('http://localhost:5000/api/courses', body, config);
            
            setStatusMessage('Course created successfully!');
            setFormData({ code: '', title: '', description: '' }); // Clear form

            setTimeout(() => navigate('/admin-dashboard'), 2000);

        } catch (err) {
            console.error(err.response.data);
            // This will catch the 'duplicate code' error from our backend
            setStatusMessage('Error: ' + (err.response.data.msg || 'Server Error'));
        }
    };

    return (
        // DELETED parent <div> and <Navbar />
        <div className="dashboard-container">
            <Link to="/curriculum" className="back-link">← Back to Curriculum</Link>
            <h1>Add New Course</h1>
            <p>Add a new course to the student curriculum.</p>

            <form className="admin-form" onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Course Code (e.g., CS101)</label>
                    <input
                        type="text"
                        name="code"
                        value={code}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Course Title</label>
                    <input
                        type="text"
                        name="title"
                        value={title}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={description}
                        onChange={onChange}
                    ></textarea>
                </div>
                
                <button type="submit" className="form-submit-button">Add Course</button>
                
                {statusMessage && <p className="form-message">{statusMessage}</p>}
            </form>
        </div>
    );
};

export default CreateCourse;