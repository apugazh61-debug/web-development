import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Preloader from './Preloader';
import './Auth.css';
import API_BASE_URL from '../../config';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPreloader, setShowPreloader] = useState(true);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Save auth info
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('isAdmin', data.user.isAdmin ? 'true' : 'false');
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userName', data.user.fullName);

            if (data.user.isAdmin) {
                navigate('/admin');
            } else {
                // Check if user has already attempted the exam
                const attemptResponse = await fetch(`${API_BASE_URL}/api/auth/check-attempt`, {
                    headers: { 'Authorization': `Bearer ${data.token}` }
                });
                const attemptData = await attemptResponse.json();

                if (attemptData.hasAttempted) {
                    // Check if admin has enabled leaderboard
                    const statusRes = await fetch(`${API_BASE_URL}/api/exam/status`);
                    const statusData = await statusRes.json();

                    if (statusData.showLeaderboard) {
                        navigate('/leaderboard');
                    } else {
                        // Show result page
                        const resultResponse = await fetch(`${API_BASE_URL}/api/result/${data.user.id}`, {
                            headers: { 'Authorization': `Bearer ${data.token}` }
                        });
                        const resultData = await resultResponse.json();
                        navigate('/result', { state: resultData });
                    }
                } else {
                    navigate('/instructions');
                }
            }

        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'Login failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <>
            {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}
            <div className="auth-container">
                <div className="auth-card">
                    <div className="college-logo">
                        <span className="master-logo-text">Web Design</span>
                    </div>
                    <h1>Login</h1>
                    

                    {error && <div className="message error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Don't have an account? <Link to="/register">Register here</Link>
                    </p>

                    <div className="creator-credit-card">
                        <div className="credit-separator"></div>
                        <p className="credit-text-card">
                            Website Sponsored By: Pugazhenthi, Karthikeyan
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
