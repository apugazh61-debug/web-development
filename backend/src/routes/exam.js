const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const verifyToken = require('../middleware/auth');

// Get all questions
router.get('/questions', verifyToken, async (req, res) => {
    try {
        // Only return questions if exam is allowed
        const settingsRes = await query("SELECT value FROM settings WHERE key = 'general'");
        const settings = settingsRes.rows[0]?.value || { allowExam: false };

        // For now, allow fetching if token is valid, 
        // but frontend will check settings too.
        
        const result = await query('SELECT id, section, question_text as question, options, correct_answer as "correctAnswer" FROM questions');
        res.json({ questions: result.rows || [] });
    } catch (error) {
        console.error('Fetch questions error:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Get exam status (allowed or not)
router.get('/status', async (req, res) => {
    try {
        const result = await query("SELECT value FROM settings WHERE key = 'general'");
        const settings = result.rows[0]?.value || { allowExam: false };
        res.json(settings);
    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({ error: 'Failed to get exam status' });
    }
});

// Get leaderboard for participants (only when admin has enabled showLeaderboard)
router.get('/leaderboard', verifyToken, async (req, res) => {
    try {
        const settingsRes = await query("SELECT value FROM settings WHERE key = 'general'");
        const settings = settingsRes.rows[0]?.value || {};
        if (!settings.showLeaderboard) {
            return res.status(403).json({ error: 'Leaderboard is not available yet.' });
        }
        const result = await query(`
            SELECT r.total_score, r.time_taken, u.full_name
            FROM results r
            JOIN users u ON r.user_id = u.id
            WHERE u.is_admin = FALSE
            ORDER BY r.total_score DESC, r.time_taken ASC
        `);
        const leaderboard = result.rows.map((r, i) => ({
            rank: i + 1,
            fullName: r.full_name,
            totalScore: r.total_score,
            timeTaken: r.time_taken
        }));
        res.json({ leaderboard });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

module.exports = router;
