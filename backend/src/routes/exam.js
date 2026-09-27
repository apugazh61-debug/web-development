const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const verifyToken = require('../middleware/auth');

const defaultQuestions = require('../data/questions');

// Get all questions
router.get('/questions', verifyToken, async (req, res) => {
    try {
        let result = await query('SELECT id, section, question_text as question, options, correct_answer as "correctAnswer" FROM questions ORDER BY id ASC');

        // If DB has 0 questions or old 30/40 questions, auto-sync with the 100 TNPSC Tamil questions
        if (!result.rows || result.rows.length === 0 || (result.rows.length < 50 && result.rows[0]?.section === 'Aptitude')) {
            try {
                await query('DELETE FROM questions');
                for (const q of defaultQuestions) {
                    await query(
                        'INSERT INTO questions (section, question_text, options, correct_answer) VALUES ($1, $2, $3, $4)',
                        [q.section, q.question, JSON.stringify(q.options), q.correctAnswer]
                    );
                }
                result = await query('SELECT id, section, question_text as question, options, correct_answer as "correctAnswer" FROM questions ORDER BY id ASC');
            } catch (syncErr) {
                console.error('Error auto-syncing questions to DB:', syncErr);
                return res.json({ questions: defaultQuestions });
            }
        }

        res.json({ questions: result.rows || defaultQuestions });
    } catch (error) {
        console.error('Fetch questions error:', error);
        res.json({ questions: defaultQuestions });
    }
});

// Get exam and portal status (allowed or not)
router.get('/status', async (req, res) => {
    try {
        const result = await query("SELECT value FROM settings WHERE key = 'general'");
        const settings = result.rows[0]?.value || { allowExam: false, allowLogin: true, allowRegister: true };
        if (settings.allowLogin === undefined) settings.allowLogin = true;
        if (settings.allowRegister === undefined) settings.allowRegister = true;
        res.json(settings);
    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({ error: 'Failed to get status' });
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
