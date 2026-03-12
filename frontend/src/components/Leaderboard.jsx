import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import './Leaderboard.css';

const Leaderboard = () => {
    const navigate = useNavigate();
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const myUserId = localStorage.getItem('userId');
    const myName = localStorage.getItem('userName');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        fetch(`${API_BASE_URL}/api/exam/leaderboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                if (data.error) { setError(data.error); }
                else { setRankings(data.leaderboard || []); }
                setLoading(false);
            })
            .catch(() => { setError('Failed to load leaderboard.'); setLoading(false); });
    }, [navigate]);

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    const formatTime = (s) => `${Math.floor(s / 60)}m ${s % 60}s`;

    const medalEmoji = (rank) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

    if (loading) return (
        <div className="lb-loading">
            <div className="lb-spinner"></div>
            <span>LOADING LEADERBOARD...</span>
        </div>
    );

    return (
        <div className="lb-container">
            <div className="lb-card">
                <div className="lb-header">
                    <h1>🏆 Leaderboard</h1>
                    <p>Overall Rankings — All Participants</p>
                </div>

                {error ? (
                    <div className="lb-error">
                        <span>🔒</span>
                        <p>{error}</p>
                        <button onClick={handleLogout} className="lb-logout-btn">Logout</button>
                    </div>
                ) : (
                    <>
                        <div className="lb-table-wrap">
                            <table className="lb-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Name</th>
                                        <th>Score</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rankings.map((r) => (
                                        <tr
                                            key={r.rank}
                                            className={`lb-row ${r.fullName === myName ? 'lb-mine' : ''} ${r.rank <= 3 ? 'lb-top' : ''}`}
                                        >
                                            <td className="lb-rank">{medalEmoji(r.rank)}</td>
                                            <td className="lb-name">
                                                {r.fullName}
                                                {r.fullName === myName && <span className="lb-you-badge">You</span>}
                                            </td>
                                            <td className="lb-score">{r.totalScore} / 30</td>
                                            <td className="lb-time">{formatTime(r.timeTaken)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={handleLogout} className="lb-logout-btn">Logout</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
