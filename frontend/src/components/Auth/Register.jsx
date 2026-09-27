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
                        <div className="portal-closed-box">
                            <div className="portal-closed-icon">🔒</div>
                            <h2 className="portal-closed-title">Portal Temporarily Closed</h2>
                            <p className="portal-closed-desc">
                                Both Registration and Login are currently disabled by administration.
                            </p>
                        </div>
                    ) : isRegisterOnlyOff ? (
                        <>
                            <div className="portal-closed-box">
                                <div className="portal-closed-icon">🔒</div>
                                <h2 className="portal-closed-title">Registration Closed</h2>
                                <p className="portal-closed-desc">
                                    Student registration is currently closed by administration.
                                </p>
                            </div>
                            <p className="auth-footer">
                                Already registered? <Link to="/login">Login here</Link>
                            </p>
                        </>
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
