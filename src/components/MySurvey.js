/* src/components/MySurvey.js (NEW VERSION) */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MySurvey = () => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({}); // Stores { questionId: { ...answer object } }
    const [comments, setComments] = useState('');
    
    const [submittedToday, setSubmittedToday] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- 1. ADD STATE FOR SUSPENSION ---
    const [isSuspended, setIsSuspended] = useState(false);
    const [suspensionMessage, setSuspensionMessage] = useState('');

    // 2. Check submission status AND fetch questions
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };

                // First, check if they already submitted
                const checkRes = await axios.get('https://niat-amet-college-portal-api.onrender.com/api/survey/check-today', config);
                
                if (checkRes.data.submitted) {
                    setSubmittedToday(true);
                    setLoading(false);
                } else {
                    // If not submitted, fetch the random questions
                    const questionsRes = await axios.get('https://niat-amet-college-portal-api.onrender.com/api/survey-questions/random', config);
                    setQuestions(questionsRes.data);
                    setLoading(false);
                }
            } catch (err) {
                // --- 3. ADD SUSPENSION CHECK ---
                if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                    setIsSuspended(true);
                    setSuspensionMessage(err.response.data.msg || 'Your account is suspended.');
                } else {
                    console.error("Error fetching survey data:", err);
                    setError('Failed to load survey. Please try again later.');
                }
                setLoading(false); 
            }
        };
        fetchData();
    }, []);

    // 4. Handle when a user selects an answer
    const handleAnswerChange = (question, answer) => {
        setAnswers(prev => ({
            ...prev,
            [question._id]: {
                questionText: question.text,
                answerText: answer.text,
                score: answer.score
            }
        }));
    };

    // 5. Handle the form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check if all questions have been answered
        if (Object.keys(answers).length < questions.length) {
            setError('Please answer all questions before submitting.');
            return;
        }
        setError('');

        // Format the 'responses' array for the backend
        const formattedResponses = Object.values(answers);

        try {
            const token = localStorage.getItem('token');
            const config = { 
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': token 
                } 
            };
            
            const body = JSON.stringify({
                responses: formattedResponses,
                comments: comments
            });
            
            await axios.post('https://niat-amet-college-portal-api.onrender.com/api/survey', body, config);
            setSubmittedToday(true); // Hide the form on success
        } catch (err) {
            // Check for suspension *again* on submit, just in case
            if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                setIsSuspended(true);
                setSuspensionMessage(err.response.data.msg || 'Your account is suspended.');
            } else {
                setError(err.response?.data?.msg || 'Failed to submit survey. Please try again.');
            }
        }
    };


    if (loading) {
        return <div className="dashboard-container"><p>Loading survey...</p></div>;
    }

    // --- 6. ADD RENDER BLOCK FOR SUSPENSION ---
    if (isSuspended) {
        return (
            <div className="dashboard-container">
                <Link to="/student-dashboard" className="back-link">← Back to Dashboard</Link>
                <h1>My Daily Survey</h1>
                <div 
                    className="login-error-message" 
                    style={{
                        textAlign: 'center', 
                        padding: '2rem', 
                        fontSize: '1.2rem'
                    }}
                >
                    {suspensionMessage}
                    <p style={{fontSize: '1rem', color: '#e0e0e0', marginTop: '1rem'}}>
                        Please contact an administrator to resolve this issue.
                    </p>
                </div>
            </div>
        );
    }
    // --- END RENDER BLOCK ---

    return (
        <div className="dashboard-container">
            <Link to="/student-dashboard" className="back-link">← Back to Dashboard</Link>
            <h1>My Daily Survey</h1>
            
            {submittedToday ? (
                // Show this if already submitted
                <div style={{textAlign: 'center', marginTop: '2rem'}}>
                    <h2 style={{color: '#28a745'}}>Thanks for your feedback today!</h2>
                    <p>Your response has been recorded.</p>
                </div>
            ) : (
                // Show the form if not submitted
                <form className="admin-form" onSubmit={handleSubmit} style={{maxWidth: '800px', margin: '2rem auto'}}>
                    <p>Your response helps us understand student well-being. Please answer all questions.</p>
                    
                    {questions.length > 0 ? (
                        questions.map((q, index) => (
                            <div key={q._id} className="form-group" style={{
                                background: 'rgba(0,0,0,0.1)', 
                                padding: '1.5rem', 
                                borderRadius: '8px'
                            }}>
                                <label style={{fontSize: '1.1rem', color: '#fff'}}>
                                    {index + 1}. {q.text}
                                </label>
                                <div className="admin-button-group" style={{ 
                                    flexDirection: 'column', 
                                    alignItems: 'flex-start', 
                                    gap: '0.75rem',
                                    marginTop: '1rem'
                                }}>
                                    {q.answers.map(a => (
                                        <label key={a.text} className="status-radio" style={{width: '10R_E_M_I_N_D_E_R_S_E_N_T_I_N_E_L_E_R_R_O_R_S_E_N_T_I_N_E_L%'}}>
                                            <input 
                                                type="radio" 
                                                name={`status-${q._id}`} 
                                                value={a.text} 
                                                checked={answers[q._id]?.answerText === a.text}
                                                onChange={() => handleAnswerChange(q, a)} 
                                            /> 
                                            {a.text}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No survey questions found. Please contact an administrator.</p>
                    )}

                    <div className="form-group" style={{marginTop: '2rem'}}>
                        <label>Any additional comments? (Optional)</label>
                        <textarea
                            name="comments"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Let us know what's on your mind..."
                        ></textarea>
                    </div>

                    {error && <p className="login-error-message">{error}</p>}
                    
                    <button 
                        type="submit" 
                        className="form-submit-button" 
                        style={{width: '100%', marginTop: '1.5rem'}}
                        disabled={questions.length === 0}
                    >
                        Submit My Survey
                    </button>
                </form>
            )}
        </div>
    );
};

export default MySurvey;