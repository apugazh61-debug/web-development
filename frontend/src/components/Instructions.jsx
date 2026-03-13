import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Instructions.css';
import API_BASE_URL from '../config';

const Instructions = () => {
    const navigate = useNavigate();
    const [agreed, setAgreed] = useState(false);
    const [allowExam, setAllowExam] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/exam/status`);
                const data = await response.json();
                setAllowExam(data.allowExam);
            } catch (error) {
                console.error("Error fetching exam settings:", error);
                setAllowExam(false);
            } finally {
                setLoadingSettings(false);
            }
        };

        fetchSettings();
    }, []);

    const handleStartExam = () => {
        if (!allowExam) {
            alert("The exam is currently not open. Please wait for the admin to allow participants.");
            return;
        }

        if (agreed) {
            navigate('/exam');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="instructions-container">
            <div className="instructions-card">
                <div className="instructions-header">
                    <h1>📋 Technical Quiz Instructions</h1>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>

                <div className="instructions-content">
                    <div className="instruction-section">
                        <h2>⚠️ Important Information</h2>
                        <p>Please read the following instructions carefully before starting the Technical Quiz.</p>
                    </div>

                    <div className="instruction-section">
                        <h3>📊 Test Structure</h3>
                        <ul>
                            <li>This test contains <strong>60 multiple-choice questions</strong></li>
                            <li>Total duration of the exam is <strong>30 minutes</strong></li>
                            <li>The test covers <strong>Technical Fundamentals</strong>:
                                <ul className="subsection">
                                    <li>Data Structures & Algorithms</li>
                                    <li>Operating Systems & DBMS</li>
                                    <li>Programming Languages (Python, Java, C)</li>
                                    <li>Networking & Security</li>
                                </ul>
                            </li>
                        </ul>
                    </div>

                    <div className="instruction-section">
                        <h3>📝 Answering Questions</h3>
                        <ul>
                            <li>Each question has <strong>four options</strong>, only one is correct</li>
                            <li><strong>No negative marking</strong> - unanswered questions will not affect your score</li>
                            <li>You can navigate between questions using Next/Previous buttons</li>
                            <li>Attempted questions will be highlighted for easy tracking</li>
                        </ul>
                    </div>

                    <div className="instruction-section">
                        <h3>⏱️ Timer & Submission</h3>
                        <ul>
                            <li>The timer will start <strong>immediately after clicking "Start Exam"</strong></li>
                            <li>A countdown timer will be visible throughout the exam</li>
                            <li>The test will be <strong>auto-submitted when time ends</strong></li>
                            <li>You can manually submit before time expires</li>
                        </ul>
                    </div>

                    <div className="instruction-section warning">
                        <h3>🚫 Important Restrictions</h3>
                        <ul>
                            <li><strong>Page refresh is not allowed</strong> - refreshing will end the test</li>
                            <li><strong>Browser back button is disabled</strong> during the exam</li>
                            <li><strong>Leaving the exam page will automatically end the test</strong></li>
                            <li><strong>Using AI assistance or Screen-Circling features</strong> is strictly prohibited and will be detected.</li>
                            <li>Each candidate is allowed <strong>only ONE attempt</strong></li>
                            <li>Once submitted, you cannot retake the exam</li>
                        </ul>
                    </div>

                    <div className="instruction-section">
                        <h3>📈 Results</h3>
                        <ul>
                            <li>After submission, you will see your total score out of 30</li>
                            <li>Section-wise scores will be displayed</li>
                            <li>Time taken will be shown</li>
                        </ul>
                    </div>

                    <div className="agreement-section">
                        <label className="checkbox-container">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            <span className="agreement-text">
                                I have read and agree to all the instructions above
                            </span>
                        </label>
                    </div>

                    <button
                        onClick={handleStartExam}
                        className={`start-exam-btn ${(!agreed || !allowExam || loadingSettings) ? 'disabled' : ''}`}
                        disabled={!agreed || !allowExam || loadingSettings}
                    >
                        {loadingSettings ? '⏳ Checking Exam Status...' :
                            !allowExam ? '🔒 Exam Currently Closed' :
                                agreed ? '🚀 Start Exam' : '⚠️ Please agree to instructions first'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Instructions;
