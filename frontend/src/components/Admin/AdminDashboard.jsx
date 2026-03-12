import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import API_BASE_URL_CENTRAL from '../../config';

const API_BASE_URL = `${API_BASE_URL_CENTRAL}/api/admin`;

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [users, setUsers] = useState([]);
    const [allowExam, setAllowExam] = useState(() => localStorage.getItem('adminAllowExam') === 'true');
    const [showAnswers, setShowAnswers] = useState(() => localStorage.getItem('adminShowAnswers') === 'true');
    const [showLeaderboard, setShowLeaderboard] = useState(() => localStorage.getItem('adminShowLeaderboard') === 'true');
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/dashboard-data`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { error: 'Failed to fetch dashboard data' };
                }
                throw new Error(errorData.error || 'Failed to fetch dashboard data');
            }

            const data = await response.json();
            setUsers(data.users || []);
            
            // Format results for leaderboard
            let resultsList = (data.results || []).map(result => {
                return {
                    ...result,
                    fullName: result.fullName || 'Unknown User',
                    email: result.email || 'No Email'
                };
            });

            // Sort: Highest Score first, then Lowest Time
            resultsList.sort((a, b) => {
                if (b.totalScore !== a.totalScore) {
                    return b.totalScore - a.totalScore;
                }
                return a.timeTaken - b.timeTaken;
            });

            setLeaderboard(resultsList);
            const ae = data.settings?.allowExam || false;
            const sa = data.settings?.showAnswers || false;
            const sl = data.settings?.showLeaderboard || false;
            setAllowExam(ae);
            setShowAnswers(sa);
            setShowLeaderboard(sl);
            localStorage.setItem('adminAllowExam', ae);
            localStorage.setItem('adminShowAnswers', sa);
            localStorage.setItem('adminShowLeaderboard', sl);

        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Error loading dashboard data: " + error.message);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        // Verify admin
        const checkAdmin = () => {
            const isAdmin = localStorage.getItem('isAdmin') === 'true';
            if (!isAdmin) {
                navigate('/login');
                return;
            }
            fetchData();
        };

        checkAdmin();
    }, [navigate, fetchData]);

    const handleToggleExam = async () => {
        try {
            const newValue = !allowExam;
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/toggle-exam`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ allowExam: newValue })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update exam status');
            }

            setAllowExam(newValue);
            localStorage.setItem('adminAllowExam', newValue);
        } catch (error) {
            console.error("Error toggling exam:", error);
            alert("Failed to update exam status: " + error.message);
        }
    };

    const handleToggleShowAnswers = async () => {
        try {
            const newValue = !showAnswers;
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/toggle-exam`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ showAnswers: newValue })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update show answers');
            }
            setShowAnswers(newValue);
            localStorage.setItem('adminShowAnswers', newValue);
        } catch (error) {
            console.error('Error toggling show answers:', error);
            alert('Failed to update: ' + error.message);
        }
    };

    const handleToggleShowLeaderboard = async () => {
        try {
            const newValue = !showLeaderboard;
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/toggle-exam`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ showLeaderboard: newValue })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update leaderboard visibility');
            }
            setShowLeaderboard(newValue);
            localStorage.setItem('adminShowLeaderboard', newValue);
        } catch (error) {
            console.error('Error toggling leaderboard:', error);
            alert('Failed to update: ' + error.message);
        }
    };

    const handleClearLeaderboard = async () => {
        if (!window.confirm("Are you sure you want to delete ALL participant results? This cannot be undone.")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/clear-leaderboard`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to clear leaderboard');
            }

            setLeaderboard([]);
            alert("Leaderboard cleared successfully.");
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Error clearing leaderboard:", error);
            alert("Failed to clear leaderboard: " + error.message);
        }
    };

    const handleDeleteAllUsers = async () => {
        if (!window.confirm("CRITICAL: Are you sure you want to delete ALL registered users? This will also delete their results. This cannot be undone.")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/delete-all-users`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete users');
            }

            const data = await response.json();
            alert(data.message || "All non-admin users deleted successfully.");
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Error deleting users:", error);
            alert("Failed to delete users: " + error.message);
        }
    };

    const handleDownloadCSV = () => {
        if (leaderboard.length === 0) {
            alert("No data available to download.");
            return;
        }

        const headers = ["Rank", "Participant Name", "Email", "Score", "Time Taken"];
        const rows = leaderboard.map((result, index) => [
            index + 1,
            `"${result.fullName}"`,
            `"${result.email}"`,
            result.totalScore,
            `"${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s"`
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `leaderboard_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-loader"></div>
                <span>LOADING DASHBOARD...</span>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-container">
            <div className="admin-header">
                <h1 className="admin-title">Admin Dashboard</h1>
                <div className="admin-controls">
                    <button className="btn-logout" onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div className="admin-grid">
                {/* Control Panel */}
                <div className="admin-card control-panel">
                    <h2>Exam Controls</h2>
                    <div className="toggle-container">
                        <span className="toggle-label">Allow Participants to Start Exam:</span>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={allowExam}
                                onChange={handleToggleExam}
                            />
                            <span className="slider round"></span>
                        </label>
                        <span className={`status-text ${allowExam ? 'allow' : 'block'}`}>
                            {allowExam ? "ALLOWED" : "BLOCKED"}
                        </span>
                    </div>

                    <div className="toggle-container" style={{marginTop: '1.2rem'}}>
                        <span className="toggle-label">Show Answers to Participants After Exam:</span>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={showAnswers}
                                onChange={handleToggleShowAnswers}
                            />
                            <span className="slider round"></span>
                        </label>
                        <span className={`status-text ${showAnswers ? 'allow' : 'block'}`}>
                            {showAnswers ? "VISIBLE" : "HIDDEN"}
                        </span>
                    </div>

                    <div className="toggle-container" style={{marginTop: '1.2rem'}}>
                        <span className="toggle-label">Show Leaderboard to Participants:</span>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={showLeaderboard}
                                onChange={handleToggleShowLeaderboard}
                            />
                            <span className="slider round"></span>
                        </label>
                        <span className={`status-text ${showLeaderboard ? 'allow' : 'block'}`}>
                            {showLeaderboard ? "VISIBLE" : "HIDDEN"}
                        </span>
                    </div>
                </div>

                {/* Registered Users */}
                <div className="admin-card users-panel">
                    <div className="panel-header">
                        <h2>Registered Users ({users.length})</h2>
                        <button className="btn-danger btn-small" onClick={handleDeleteAllUsers}>
                            Delete All Users
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map(user => (
                                        <tr key={user.uid}>
                                            <td>{user.fullName}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`badge ${user.hasAttempted ? 'success' : 'pending'}`}>
                                                    {user.hasAttempted ? 'Completed' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="3" className="text-center">No users registered yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="admin-card leaderboard-panel">
                    <div className="panel-header">
                        <h2>Live Leaderboard</h2>
                        <div className="panel-actions">
                            <button className="btn-secondary" onClick={handleDownloadCSV}>
                                Download CSV
                            </button>
                            <button className="btn-danger" onClick={handleClearLeaderboard}>
                                Clear Leaderboard
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="admin-table leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Participant</th>
                                    <th>Attended</th>
                                    <th>Correct</th>
                                    <th>Score</th>
                                    <th>Time Taken</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.length > 0 ? (
                                    leaderboard.map((result, index) => (
                                        <tr key={result.id} className={index === 0 ? 'top-rank' : ''}>
                                            <td><span className="rank-badge">{index + 1}</span></td>
                                            <td>
                                                <div className="participant-info">
                                                    <strong>{result.fullName || 'Unknown'}</strong>
                                                    <span className="participant-email">{result.email}</span>
                                                </div>
                                            </td>
                                            <td><span className="attend-badge">{(result.correctCount || 0) + (result.wrongCount || 0)} / 30</span></td>
                                            <td><span className="correct-badge">{result.correctCount || 0}</span></td>
                                            <td><strong className="score-text">{result.totalScore} / 30</strong></td>
                                            <td>{Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center">No results available yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
