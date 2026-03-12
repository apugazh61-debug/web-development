import { useState, useEffect, useCallback } from 'react';
import './Preloader.css';

const Preloader = ({ onComplete }) => {
    const [show, setShow] = useState(true);

    const handleVideoEnd = useCallback(() => {
        setShow(false);
        if (onComplete) {
            onComplete();
        }
    }, [onComplete]);

    useEffect(() => {
        // Fallback: remove preloader after 5 seconds anyway
        const timer = setTimeout(() => {
            handleVideoEnd();
        }, 3000);
        return () => clearTimeout(timer);
    }, [handleVideoEnd]);

    if (!show) return null;

    return (
        <div className="preloader-overlay danger-theme">
            <div className="preloader-content">
                <div className="danger-container">
                    <svg viewBox="0 0 24 24" className="danger-icon">
                        <path d="M12 2L1 21H23L12 2Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M12 9V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <h2 className="danger-text">DANGER</h2>
                </div>
                <div className="loading-container">
                    <div className="loading-bar"></div>
                    <p className="loading-text">System Loading...</p>
                </div>
            </div>
        </div>
    );
};

export default Preloader;
