import { useEffect, useState } from 'react';
import './Timer.css';

const Timer = ({ onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes = 1800 seconds

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, onTimeUp]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isWarning = timeLeft < 300; // Less than 5 minutes

    return (
        <div className={`timer ${isWarning ? 'warning' : ''}`}>
            <span className="timer-icon">⏱️</span>
            <span className="timer-text">Time Left: {formatTime(timeLeft)}</span>
        </div>
    );
};

export default Timer;
