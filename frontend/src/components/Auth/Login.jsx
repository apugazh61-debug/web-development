import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Preloader from './Preloader';
import AdminAccessModal from './AdminAccessModal';
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
    const [portalSettings, setPortalSettings] = useState({
        allowLogin: true,
        allowRegister: true
    });
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [guestName, setGuestName] = useState('');
    const [guestLoading, setGuestLoading] = useState(false);
    const [guestError, setGuestError] = useState('');

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/exam/status`);
                if (res.ok) {
                    const data = await res.json();
                    setPortalSettings({
                        allowLogin: data.allowLogin !== false,
                        allowRegister: data.allowRegister !== false
                    });
                }
            } catch (err) {
                console.error('Error fetching portal settings:', err);
            }
        };
        fetchStatus();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleThendralClick = () => {
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        if (isAdmin) {
            navigate('/admin');
        } else {
            setShowAdminModal(true);
        }
    };

    const handleGuestSubmit = async (e) => {
        e.preventDefault();
        const name = guestName.trim();
        if (!name) {
            setGuestError('Please enter your Name / பெயரை உள்ளிடவும்');
            return;
        }

        setGuestLoading(true);
        setGuestError('');

        try {
            let authSuccess = false;
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/guest-entry`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullName: name })
                });
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.user.id);
                    localStorage.setItem('isAdmin', 'false');
                    localStorage.setItem('userEmail', data.user.email);
                    localStorage.setItem('userName', data.user.fullName || name);
                    authSuccess = true;
                }
            } catch (backendErr) {
                console.warn('Backend guest entry note:', backendErr);
            }

            if (!authSuccess) {
                localStorage.setItem('token', 'guest-token-' + Date.now());
                localStorage.setItem('userId', 'guest-' + Date.now());
                localStorage.setItem('isAdmin', 'false');
                localStorage.setItem('userEmail', 'guest@thendral.quiz');
                localStorage.setItem('userName', name);
            }

            navigate('/instructions');
        } catch (err) {
            console.error('Guest login error:', err);
            setGuestError('Could not start exam. Please try again.');
        } finally {
            setGuestLoading(false);
        }
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

    const isBothOff = !portalSettings.allowLogin && !portalSettings.allowRegister;
    const isLoginOnlyOff = !portalSettings.allowLogin && portalSettings.allowRegister;

    return (
        <>
            {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}
            <div className="auth-container">
                <div className="auth-card">
                    <div className="college-logo">
                        <span className="master-logo-text">Tech Quiz</span>
                    </div>

                    {isBothOff ? (
                        <div className="guest-entry-box">
                            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                                <div style={{ fontSize: '42px', marginBottom: '6px' }}>📝</div>
                                <h1 style={{ fontSize: '22px', margin: '0 0 6px 0', color: '#ffb703' }}>
                                    Direct Exam Entry
                                </h1>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
                                    Login & Register are closed. Enter your Name to write the exam directly!
                                </p>
                                <p style={{ margin: '4px 0 0 0', color: '#38bdf8', fontSize: '13px', fontWeight: '600' }}>
                                    (பெயரை உள்ளிட்டு உடனடியாக தேர்வு எழுதலாம்)
                                </p>
                            </div>

                            {guestError && <div className="message error">{guestError}</div>}

                            <form onSubmit={handleGuestSubmit}>
                                <div className="form-group">
                                    <label htmlFor="guestName" style={{ fontWeight: '600', color: '#cbd5e1' }}>
                                        Participant Name / உங்கள் பெயர்
                                    </label>
                                    <input
                                        type="text"
                                        id="guestName"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        placeholder="Enter your name (எ.கா: முகிலன்)"
                                        autoComplete="name"
                                        autoFocus
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={guestLoading}
                                    style={{
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        color: '#fff',
                                        fontWeight: '700',
                                        fontSize: '16px',
                                        padding: '12px',
                                        marginTop: '10px'
                                    }}
                                >
                                    {guestLoading ? 'Connecting...' : '🚀 Start Exam / தேர்வை எழுது'}
                                </button>
                            </form>
                        </div>
                    ) : isLoginOnlyOff ? (
                        <div className="guest-entry-box">
                            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                                <div style={{ fontSize: '42px', marginBottom: '6px' }}>📝</div>
                                <h1 style={{ fontSize: '22px', margin: '0 0 6px 0', color: '#ffb703' }}>
                                    Direct Exam Entry
                                </h1>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
                                    Student login is closed. Enter your Name to write the exam directly!
                                </p>
                                <p style={{ margin: '4px 0 0 0', color: '#38bdf8', fontSize: '13px', fontWeight: '600' }}>
                                    (பெயரை உள்ளிட்டு நேரடியாக தேர்வு எழுதலாம்)
                                </p>
                            </div>

                            {guestError && <div className="message error">{guestError}</div>}

                            <form onSubmit={handleGuestSubmit}>
                                <div className="form-group">
                                    <label htmlFor="guestName" style={{ fontWeight: '600', color: '#cbd5e1' }}>
                                        Participant Name / உங்கள் பெயர்
                                    </label>
                                    <input
                                        type="text"
                                        id="guestName"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        placeholder="Enter your name (எ.கா: முகிலன்)"
                                        autoComplete="name"
                                        autoFocus
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={guestLoading}
                                    style={{
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        color: '#fff',
                                        fontWeight: '700',
                                        fontSize: '16px',
                                        padding: '12px',
                                        marginTop: '10px'
                                    }}
                                >
                                    {guestLoading ? 'Connecting...' : '🚀 Start Exam / தேர்வை எழுது'}
                                </button>
                            </form>

                            <p className="auth-footer" style={{ marginTop: '16px' }}>
                                New participant? <Link to="/register">Register here</Link>
                            </p>
                        </div>
                    ) : (
                        <>
                            <h1>Login</h1>
                            {error && <div className="message error">{error}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="email">Email / ID</label>
                                    <input
                                        type="text"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter email or Admin ID (1)"
                                        autoComplete="username"
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

                            {portalSettings.allowRegister && (
                                <p className="auth-footer">
                                    Don't have an account? <Link to="/register">Register here</Link>
                                </p>
                            )}
                        </>
                    )}

                    <div className="creator-credit-card">
                        <div className="credit-separator"></div>
                        <p className="credit-text-card">
                            Product By: <span className="thendral-access-btn" onClick={handleThendralClick} title="Thendral Community - Touch for Admin Access" role="button" tabIndex={0}>Thendral Community</span>
                        </p>
                    </div>
                </div>
            </div>

            <AdminAccessModal
                isOpen={showAdminModal}
                onClose={() => setShowAdminModal(false)}
                onSuccess={() => {
                    setShowAdminModal(false);
                    navigate('/admin');
                }}
            />
        </>
    );
};

export default Login;
