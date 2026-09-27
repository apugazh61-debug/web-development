import { useState } from 'react';
import PropTypes from 'prop-types';
import API_BASE_URL from '../../config';
import '../Auth/Auth.css';

const AdminLogin = ({ onLoginSuccess }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!id || !password) {
            setError('Please enter ID and Password');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Admin login failed');
            }

            if (!data.user?.isAdmin) {
                throw new Error('Access denied: Administrator privileges required.');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('isAdmin', 'true');
            localStorage.setItem('userName', data.user.fullName || 'Admin');

            if (onLoginSuccess) {
                onLoginSuccess();
            } else {
                window.location.reload();
            }
        } catch (err) {
            console.error('Admin login error:', err);
            setError(err.message || 'Login failed. Please verify ID and Password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '420px', border: '1px solid rgba(255, 183, 3, 0.4)', boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(255,183,3,0.15)' }}>
                <div className="college-logo">
                    <span className="master-logo-text" style={{ fontSize: '40px' }}>Tech Quiz</span>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ fontSize: '44px', marginBottom: '8px' }}>🛡️</div>
                    <h1 style={{ fontSize: '24px', margin: '0 0 6px 0', color: '#ffb703' }}>Admin Panel Login</h1>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
                        Enter ID and Password to manage portal
                    </p>
                </div>

                {error && <div className="message error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="adminId" style={{ fontWeight: '600', color: '#cbd5e1' }}>ID</label>
                        <input
                            type="text"
                            id="adminId"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            placeholder="1"
                            autoComplete="username"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="adminPassword" style={{ fontWeight: '600', color: '#cbd5e1' }}>Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="adminPassword"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="1"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: '#fff',
                            fontWeight: '700',
                            marginTop: '10px'
                        }}
                    >
                        {loading ? 'Authenticating...' : 'Enter Admin Panel'}
                    </button>
                </form>

                <div className="creator-credit-card" style={{ marginTop: '25px' }}>
                    <div className="credit-separator"></div>
                    <p className="credit-text-card">
                        Product By: <span style={{ color: '#ffb703', fontWeight: 'bold' }}>Thendral Community</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

AdminLogin.propTypes = {
    onLoginSuccess: PropTypes.func
};

export default AdminLogin;
