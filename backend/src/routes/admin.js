const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const verifyToken = require('../middleware/auth');

// Admin Check Middleware
const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ error: 'Unauthorized: Admin access only' });
    }
};

// Get Dashboard Stats (Users and Results)
router.get('/dashboard-data', verifyToken, isAdmin, async (req, res) => {
    try {
        // Fetch Users (excluding passwords)
        const usersRes = await query('SELECT id, full_name, email, has_attempted, created_at FROM users WHERE is_admin = FALSE');
        const users = usersRes.rows.map(u => ({
            uid: u.id,
            fullName: u.full_name,
            email: u.email,
            hasAttempted: u.has_attempted,
            createdAt: u.created_at
        }));

        // Fetch Results (excluding admins)
        const resultsRes = await query(`
            SELECT r.*, u.full_name, u.email 
            FROM results r 
            JOIN users u ON r.user_id = u.id
            WHERE u.is_admin = FALSE
        `);
        const results = resultsRes.rows.map(r => ({
            id: r.id,
            userId: r.user_id,
            totalScore: r.total_score,
            correctCount: r.correct_count,
            wrongCount: r.wrong_count,
            timeTaken: r.time_taken,
            fullName: r.full_name,
            email: r.email,
            submittedAt: r.submitted_at
        }));

        // Fetch Settings
        const settingsRes = await query("SELECT value FROM settings WHERE key = 'general'");
        const settings = settingsRes.rows[0]?.value || { allowExam: false };

        res.json({ users, results, settings });
    } catch (error) {
        console.error('Admin Dashboard Data error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data: ' + error.message });
    }
});

// Toggle Exam Access & Show Answers & Leaderboard
router.post('/toggle-exam', verifyToken, isAdmin, async (req, res) => {
    try {
        const { allowExam, showAnswers, showLeaderboard } = req.body;
        // Fetch current settings first
        const current = await query("SELECT value FROM settings WHERE key = 'general'");
        const existing = current.rows[0]?.value || { allowExam: false, showAnswers: false, showLeaderboard: false };
        const merged = {
            ...existing,
            ...(allowExam !== undefined ? { allowExam } : {}),
            ...(showAnswers !== undefined ? { showAnswers } : {}),
            ...(showLeaderboard !== undefined ? { showLeaderboard } : {}),
        };
        await query(
            "INSERT INTO settings (key, value) VALUES ('general', $1::jsonb) ON CONFLICT (key) DO UPDATE SET value = $1::jsonb",
            [JSON.stringify(merged)]
        );
        res.json({ message: 'Settings updated successfully', ...merged });
    } catch (error) {
        console.error('Toggle exam error:', error);
        res.status(500).json({ error: 'Failed to update exam status: ' + error.message });
    }
});

// Clear Leaderboard
router.post('/clear-leaderboard', verifyToken, isAdmin, async (req, res) => {
    try {
        // Delete all results
        await query('DELETE FROM results');

        // Reset all users has_attempted
        await query('UPDATE users SET has_attempted = FALSE WHERE is_admin = FALSE');

        res.json({ message: 'Leaderboard cleared successfully' });
    } catch (error) {
        console.error('Clear leaderboard error:', error);
        res.status(500).json({ error: 'Failed to clear leaderboard: ' + error.message });
    }
});

// Delete All Registered Users
router.post('/delete-all-users', verifyToken, isAdmin, async (req, res) => {
    try {
        // Delete results first due to foreign key constraints
        await query('DELETE FROM results WHERE user_id IN (SELECT id FROM users WHERE is_admin = FALSE)');
        
        // Delete all non-admin users
        const deleteRes = await query('DELETE FROM users WHERE is_admin = FALSE');
        
        res.json({ message: `${deleteRes.rowCount} users deleted successfully` });
    } catch (error) {
        console.error('Delete all users error:', error);
        res.status(500).json({ error: 'Failed to delete users: ' + error.message });
    }
});

module.exports = router;
