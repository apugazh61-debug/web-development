import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminAccessModal from './AdminAccessModal';
import './Auth.css';
import API_BASE_URL from '../../config';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
                    let al = true;
                    if (data.allowLogin !== undefined) al = data.allowLogin !== false;
                    else if (data.showAnswers && typeof data.showAnswers === 'object' && data.showAnswers.allowLogin !== undefined) {
                        al = data.showAnswers.allowLogin !== false;
                    } else if (localStorage.getItem('adminAllowLogin') !== null) {
                        al = localStorage.getItem('adminAllowLogin') !== 'false';
                    }

                    let ar = true;
                    if (data.allowRegister !== undefined) ar = data.allowRegister !== false;
                    else if (data.showAnswers && typeof data.showAnswers === 'object' && data.showAnswers.allowRegister !== undefined) {
                        ar = data.showAnswers.allowRegister !== false;
                    } else if (localStorage.getItem('adminAllowRegister') !== null) {
                        ar = localStorage.getItem('adminAllowRegister') !== 'false';
                    }

                    setPortalSettings({
                        allowLogin: al,
                        allowRegister: ar
                    });
                }
            } catch (err) {
                console.error('Error fetching portal settings:', err);
                const localL = localStorage.getItem('adminAllowLogin');
                const localR = localStorage.getItem('adminAllowRegister');
                if (localL !== null || localR !== null) {
                    setPortalSettings({
                        allowLogin: localL !== 'false',
                        allowRegister: localR !== 'false'
                    });
                }
            }
        };
        fetchStatus();
    }, []);

    const validatePassword = (password) => {
        const errs = [];
        if (password.length < 8) errs.push('Minimum 8 characters required');
        return errs;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field
        setErrors(prev => ({ ...prev, [name]: '' }));

        // Real-time password validation
        if (name === 'password') {
            const passwordErrors = validatePassword(value);
            if (passwordErrors.length > 0) {
                setErrors(prev => ({ ...prev, password: passwordErrors.join(', ') }));
            }
        }
    };

    const handleThendralClick = () => {
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        if (isAdmin) {
            navigate('/admin');
        } else {
            setShowAdminModal(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const newErrors = {};

        // Validation
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';

        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
            newErrors.password = passwordErrors.join(', ');
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setMessage('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);
            setMessage(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
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
            const guestEmail = `guest_${Date.now()}_${Math.floor(Math.random() * 10000)}@thendral.quiz`;
            const guestPass = 'Guest@Thendral123';

            // Attempt backend registration up to 3 times to ensure user is saved in DB & dashboard
            for (let attempt = 1; attempt <= 3 && !authSuccess; attempt++) {
                try {
                    // Try 1: Dedicated guest entry endpoint if available
                    try {
                        const guestRes = await fetch(`${API_BASE_URL}/api/auth/guest-entry`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ fullName: name })
                        });
                        if (guestRes.ok) {
                            const data = await guestRes.json();
                            if (data.token && data.user) {
                                localStorage.setItem('token', data.token);
                                localStorage.setItem('userId', data.user.id);
                                localStorage.setItem('isAdmin', 'false');
                                localStorage.setItem('userEmail', data.user.email);
                                localStorage.setItem('userName', data.user.fullName || name);
                                authSuccess = true;
                                break;
                            }
                        }
                    } catch (e1) {
                        // ignore and try register
                    }

                    // Try 2: Standard register + login endpoint
                    const regRes = await fetch(`${API_BASE_URL}/api/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fullName: name,
                            email: guestEmail,
                            password: guestPass
                        })
                    });

                    if (regRes.ok || regRes.status === 400) {
                        const logRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email: guestEmail,
                                password: guestPass
                            })
                        });
                        if (logRes.ok) {
                            const logData = await logRes.json();
                            if (logData.token && logData.user) {
                                localStorage.setItem('token', logData.token);
                                localStorage.setItem('userId', logData.user.id);
                                localStorage.setItem('isAdmin', 'false');
                                localStorage.setItem('userEmail', logData.user.email);
                                localStorage.setItem('userName', logData.user.fullName || name);
                                authSuccess = true;
                                break;
                            }
                        }
                    }
                } catch (err) {
                    console.warn(`Direct entry connection attempt ${attempt} note:`, err);
                }

                if (!authSuccess && attempt < 3) {
                    await new Promise(r => setTimeout(r, 1200));
                }
            }

            if (authSuccess) {
                navigate('/instructions');
            } else {
                setGuestError('Connecting to server... Please check internet and click Start Exam again. (சர்வரோடு இணைய முடியவில்லை, மீண்டும் அழுத்தவும்)');
            }
        } catch (err) {
            console.error('Guest login error:', err);
            setGuestError('Could not start exam. Please try again.');
        } finally {
            setGuestLoading(false);
        }
    };

    const isBothOff = !portalSettings.allowLogin && !portalSettings.allowRegister;
    const isRegisterOnlyOff = !portalSettings.allowRegister && portalSettings.allowLogin;

    return (
        <>
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
                    ) : isRegisterOnlyOff ? (
                        <div className="guest-entry-box">
                            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                                <div style={{ fontSize: '42px', marginBottom: '6px' }}>📝</div>
                                <h1 style={{ fontSize: '22px', margin: '0 0 6px 0', color: '#ffb703' }}>
                                    Direct Exam Entry
                                </h1>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
                                    Student registration is closed. Enter your Name to write the exam directly!
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
                                Already registered? <Link to="/login">Login here</Link>
                            </p>
                        </div>
                    ) : (
                        <>
                            <h1>Register</h1>

                            {message && (
                                <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="fullName">Full Name *</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                    />
                                    {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                    />
                                    {errors.email && <span className="error-text">{errors.email}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">Password *</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter your password"
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
                                    {errors.password && <span className="error-text">{errors.password}</span>}
                                    <small className="password-hint">
                                        Minimum 8 characters required
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm Password *</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm your password"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                                </div>

                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Registering...' : 'Register'}
                                </button>
                            </form>

                            {portalSettings.allowLogin && (
                                <p className="auth-footer">
                                    Already have an account? <Link to="/login">Login here</Link>
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

export default Register;
