import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Timer from './Timer';
import QuestionCard from './QuestionCard';
import './ExamPage.css';
import API_BASE_URL from '../../config';

const ExamPage = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isWindowBlurred, setIsWindowBlurred] = useState(false);
    const [cheatStrikes, setCheatStrikes] = useState(0);
    const [warningMessage, setWarningMessage] = useState('');
    const startTimeRef = useRef(Date.now());
    const hasSubmittedRef = useRef(false);
    const cheatStrikesRef = useRef(0);

    // Shuffle array function (Fisher-Yates)
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Load questions from backend
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/api/exam/questions`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch questions');
                }

                const data = await response.json();
                const fetchedQuestions = data.questions || [];
                const shuffled = shuffleArray(fetchedQuestions); // Randomize order per participant
                setQuestions(shuffled);
                setAnswers(new Array(shuffled.length).fill(null));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching questions:', error);
                alert('Error loading questions. Please try again.');
                navigate('/instructions');
            }
        };

        fetchQuestions();

        // Polling to check if exam is still allowed
        const statusCheckInterval = setInterval(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/exam/status`);
                const data = await response.json();
                
                if (data.allowExam === false && !hasSubmittedRef.current) {
                    console.log('Exam closed by admin. Auto-submitting...');
                    alert('The exam has been closed by the administrator. Your progress is being submitted automatically.');
                    handleSubmit();
                }
            } catch (error) {
                console.error('Status check error:', error);
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(statusCheckInterval);
    }, [navigate]);

    // Anti-AI / Focus Loss Protection — 3 Strike System
    useEffect(() => {
        const triggerStrike = () => {
            if (hasSubmittedRef.current) return;

            cheatStrikesRef.current += 1;
            const strike = cheatStrikesRef.current;
            setCheatStrikes(strike);
            setIsWindowBlurred(true);

            if (strike === 1) {
                setWarningMessage('⚠️ WARNING (Strike 1/3): AI assistance or screen overlays (Gemini Circle) are STRICTLY PROHIBITED. Return to the exam immediately!');
            } else if (strike === 2) {
                setWarningMessage('🚨 FINAL WARNING (Strike 2/3): Last chance! Using AI tools will result in automatic exam submission. Come back NOW!');
            } else {
                setWarningMessage('❌ 3 Violations detected! Your exam is being automatically submitted.');
                setTimeout(() => {
                    handleSubmit();
                }, 2000);
            }
        };

        const handleBlur = () => {
            if (!hasSubmittedRef.current) triggerStrike();
        };

        const handleFocus = () => {
            if (cheatStrikesRef.current < 3) {
                setIsWindowBlurred(false);
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden && !hasSubmittedRef.current) {
                triggerStrike();
            } else if (!document.hidden && cheatStrikesRef.current < 3) {
                setIsWindowBlurred(false);
            }
        };

        const handleContextMenu = (e) => e.preventDefault();

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Disable browser back button
    useEffect(() => {
        window.history.pushState(null, '', window.location.href);

        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
            if (window.confirm('Going back will submit your exam. Are you sure?')) {
                handleSubmit();
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Detect page exit/refresh and auto-submit
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
            handleSubmit();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [answers]);

    const handleSubmit = async () => {
        if (hasSubmittedRef.current) return;
        hasSubmittedRef.current = true;

        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

            // Calculate results locally
            let correctCount = 0;
            let wrongCount = 0;
            const sectionScores = {};
            const answerDetails = [];

            questions.forEach((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                const isAnswered = userAnswer !== null;

                if (isCorrect) {
                    correctCount++;
                } else if (isAnswered) {
                    wrongCount++;
                }

                // Track section scores
                if (!sectionScores[question.section]) {
                    sectionScores[question.section] = { correct: 0, total: 0 };
                }
                sectionScores[question.section].total++;
                if (isCorrect) {
                    sectionScores[question.section].correct++;
                }

                // Store answer details
                answerDetails.push({
                    questionId: question.id,
                    section: question.section,
                    question: question.question,
                    options: question.options,
                    correctAnswer: question.correctAnswer,
                    userAnswer: userAnswer,
                    isCorrect: isCorrect
                });
            });

            const totalScore = correctCount;

            // Save results to backend
            const response = await fetch(`${API_BASE_URL}/api/result/submit`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    totalScore,
                    correctCount,
                    wrongCount,
                    sectionScores,
                    timeTaken,
                    answerDetails
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit exam');
            }

            // Check if admin has enabled leaderboard
            try {
                const statusRes = await fetch(`${API_BASE_URL}/api/exam/status`);
                const statusData = await statusRes.json();
                
                if (statusData.showLeaderboard) {
                    navigate('/leaderboard');
                    return;
                }
            } catch (err) {
                console.error("Failed to check leaderboard status", err);
            }

            // Navigate to result page with data
            navigate('/result', {
                state: {
                    totalScore,
                    correctCount,
                    wrongCount,
                    sectionScores,
                    timeTaken,
                    answerDetails
                }
            });
        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to submit exam. Please try again.');
            hasSubmittedRef.current = false;
            setSubmitting(false);
        }
    };

    const handleAnswerSelect = (answerIndex) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = answerIndex;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleTimeUp = () => {
        alert('Time is up! Your exam will be submitted automatically.');
        handleSubmit();
    };

    if (loading) {
        return (
            <div className="exam-loading">
                <div className="loader"></div>
                <p>Loading questions...</p>
            </div>
        );
    }

    if (submitting) {
        return (
            <div className="exam-loading">
                <div className="loader"></div>
                <p>Submitting your exam...</p>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const answeredCount = answers.filter(a => a !== null).length;

    if (questions.length === 0) {
        return (
            <div className="exam-loading">
                <p>No questions found. Please contact the administrator.</p>
                <button onClick={() => navigate('/instructions')} className="nav-btn">Go Back</button>
            </div>
        );
    }

    return (
        <div className={`exam-container ${isWindowBlurred ? 'window-blurred' : ''}`}>
            {isWindowBlurred && (
                <div className="blur-overlay">
                    <div className={`blur-content strike-${cheatStrikes}`}>
                        <div className="strike-indicator">
                            {[1,2,3].map(i => (
                                <span key={i} className={`strike-dot ${i <= cheatStrikes ? 'active' : ''}`}></span>
                            ))}
                        </div>
                        <h2 className="strike-title">
                            {cheatStrikes === 1 ? '⚠️ WARNING' : cheatStrikes === 2 ? '🚨 FINAL WARNING' : '❌ EXAM TERMINATED'}
                        </h2>
                        <p className="strike-msg">{warningMessage}</p>
                        {cheatStrikes < 3 && (
                            <p className="strike-return">Tap anywhere on the exam to continue.</p>
                        )}
                    </div>
                </div>
            )}
            <div className="exam-header">
                <div className="exam-title">
                    <h1>📝 Online Examination</h1>
                    <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
                </div>
                <Timer onTimeUp={handleTimeUp} />
            </div>

            <div className="exam-content">
                <div className="exam-sidebar">
                    <h3>Question Navigator</h3>
                    <div className="question-grid">
                        {questions.map((_, index) => (
                            <button
                                key={index}
                                className={`question-nav-btn ${index === currentQuestionIndex ? 'active' : ''
                                    } ${answers[index] !== null ? 'answered' : ''}`}
                                onClick={() => setCurrentQuestionIndex(index)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    <div className="exam-stats">
                        <p><strong>Answered:</strong> {answeredCount} / {questions.length}</p>
                        <p><strong>Unanswered:</strong> {questions.length - answeredCount}</p>
                    </div>
                </div>

                <div className="exam-main">
                    <QuestionCard
                        question={currentQuestion}
                        selectedAnswer={answers[currentQuestionIndex]}
                        onAnswerSelect={handleAnswerSelect}
                    />

                    <div className="exam-navigation">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                            className="nav-btn prev-btn"
                        >
                            ← Previous
                        </button>

                        {currentQuestionIndex === questions.length - 1 ? (
                            <button onClick={handleSubmit} className="nav-btn submit-btn">
                                Submit Exam
                            </button>
                        ) : (
                            <button onClick={handleNext} className="nav-btn next-btn">
                                Next →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamPage;
