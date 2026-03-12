import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API_BASE_URL from '../config';
import './Result.css';

const Result = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [resultData, setResultData] = useState(location.state || null);
    const [showAnswers, setShowAnswers] = useState(false);
    const [statusLoaded, setStatusLoaded] = useState(false);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        const loadResult = async () => {
            let data = location.state;

            // If no state (e.g., page refresh), fetch from API
            if (!data && userId && token) {
                try {
                    const r = await fetch(`${API_BASE_URL}/api/result/${userId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (r.ok) {
                        data = await r.json();
                        setResultData(data);
                    } else {
                        navigate('/login');
                        return;
                    }
                } catch {
                    navigate('/login');
                    return;
                }
            } else if (!data) {
                navigate('/login');
                return;
            }

            // Check if admin has enabled Show Answers
            try {
                const sr = await fetch(`${API_BASE_URL}/api/exam/status`);
                const sd = await sr.json();
                setShowAnswers(sd.showAnswers === true);
            } catch { /* default false */ }

            setStatusLoaded(true);
        };

        loadResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (!resultData || !statusLoaded) return null;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins} minutes ${secs} seconds`;
    };

    const { totalScore, correctCount, wrongCount, timeTaken, answerDetails } = resultData;
    const unansweredCount = answerDetails ? answerDetails.filter(a => !a.isAnswered).length : 0;

    return (
        <div className="result-container">
            <div className="result-card">
                <div className="result-header">
                    <h1>🎉 Exam Completed!</h1>
                    <p>Thank you for participating. Your response has been recorded.</p>
                </div>

                <div className="result-content">

                    {showAnswers && (
                        <div className="answer-summary">
                            <div className="summary-card correct">
                                <div className="summary-icon">✅</div>
                                <div className="summary-content">
                                    <div className="summary-label">Correct Answers</div>
                                    <div className="summary-value">{correctCount}</div>
                                </div>
                            </div>
                            <div className="summary-card info">
                                <div className="summary-icon">📝</div>
                                <div className="summary-content">
                                    <div className="summary-label">Questions Attempted</div>
                                    <div className="summary-value">{answerDetails ? (answerDetails.length - unansweredCount) : 0} / {answerDetails ? answerDetails.length : 0}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="time-taken">
                        <span className="time-icon">⏱️</span>
                        <span className="time-label">Time Taken:</span>
                        <span className="time-value">{formatTime(timeTaken)}</span>
                    </div>

                    {/* Detailed Answer Analysis — only if admin enabled */}
                    {showAnswers && answerDetails && answerDetails.length > 0 && (
                        <div className="answer-details-section">
                            <div className="details-header">
                                <h2>Detailed Answer Analysis</h2>
                            </div>
                            <div className="answer-list">
                                {answerDetails.map((answer, idx) => (
                                    <div
                                        key={answer.questionId}
                                        className={`answer-item ${answer.isCorrect ? 'correct' : answer.isAnswered ? 'wrong' : 'unanswered'}`}
                                    >
                                        <div className="answer-item-header">
                                            <span className="question-number">Q{idx + 1}</span>
                                            <span className={`answer-status ${answer.isCorrect ? 'correct' : answer.isAnswered ? 'wrong' : 'unanswered'}`}>
                                                {answer.isCorrect ? '✅ Correct' : answer.isAnswered ? '❌ Wrong' : '⚠️ Unanswered'}
                                            </span>
                                        </div>
                                        <div className="question-text">{answer.question}</div>
                                        <div className="options-list">
                                            {answer.options.map((option, optIndex) => (
                                                <div
                                                    key={optIndex}
                                                    className={`option-item ${optIndex === answer.correctAnswer ? 'correct-answer' : ''
                                                        } ${optIndex === answer.userAnswer && !answer.isCorrect ? 'wrong-answer' : ''
                                                        } ${optIndex === answer.userAnswer && answer.isCorrect ? 'user-correct' : ''
                                                        }`}
                                                >
                                                    <span className="option-label">{String.fromCharCode(65 + optIndex)}.</span>
                                                    <span className="option-text">{option}</span>
                                                    {optIndex === answer.correctAnswer && (
                                                        <div className="correct-badge">Correct Answer</div>
                                                    )}
                                                    {optIndex === answer.userAnswer && !answer.isCorrect && (
                                                        <div className="wrong-badge">Your Answer</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {!answer.isAnswered && (
                                            <div className="not-answered-msg">
                                                You did not answer this question
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="result-footer">
                        <div className="info-box">
                            <p>✅ Your exam has been submitted successfully</p>
                            <p>⚠️ You cannot reattempt this examination</p>
                        </div>
                        <button onClick={handleLogout} className="logout-btn-result">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result;
