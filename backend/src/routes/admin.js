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
        const settings = settingsRes.rows[0]?.value || { allowExam: false, showAnswers: false, showLeaderboard: false, allowLogin: true, allowRegister: true };
        if (settings.allowLogin === undefined) settings.allowLogin = true;
        if (settings.allowRegister === undefined) settings.allowRegister = true;

        res.json({ users, results, settings });
    } catch (error) {
        console.error('Admin Dashboard Data error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data: ' + error.message });
    }
});

// Toggle Exam Access & Show Answers & Leaderboard & Portal (Login/Register) Access
router.post('/toggle-exam', verifyToken, isAdmin, async (req, res) => {
    try {
        const { allowExam, showAnswers, showLeaderboard, allowLogin, allowRegister } = req.body;
        // Fetch current settings first
        const current = await query("SELECT value FROM settings WHERE key = 'general'");
        const existing = current.rows[0]?.value || { allowExam: false, showAnswers: false, showLeaderboard: false, allowLogin: true, allowRegister: true };
        const merged = {
            ...existing,
            ...(allowExam !== undefined ? { allowExam } : {}),
            ...(showAnswers !== undefined ? { showAnswers } : {}),
            ...(showLeaderboard !== undefined ? { showLeaderboard } : {}),
            ...(allowLogin !== undefined ? { allowLogin } : {}),
            ...(allowRegister !== undefined ? { allowRegister } : {}),
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

// --- Question Management Routes ---

// Get all questions
router.get('/questions', verifyToken, isAdmin, async (req, res) => {
    try {
        const result = await query(
            'SELECT id, section, question_text as question, options, correct_answer as "correctAnswer" FROM questions ORDER BY id ASC'
        );
        res.json({ questions: result.rows || [] });
    } catch (error) {
        console.error('Admin get questions error:', error);
        res.status(500).json({ error: 'Failed to fetch questions: ' + error.message });
    }
});

// Add a single question
router.post('/questions', verifyToken, isAdmin, async (req, res) => {
    try {
        const { section, question, options, correctAnswer } = req.body;
        if (!question || !Array.isArray(options) || options.length === 0) {
            return res.status(400).json({ error: 'Question text and options are required' });
        }
        const ansIdx = typeof correctAnswer === 'number' ? correctAnswer : parseInt(correctAnswer, 10) || 0;
        const result = await query(
            'INSERT INTO questions (section, question_text, options, correct_answer) VALUES ($1, $2, $3, $4) RETURNING id, section, question_text as question, options, correct_answer as "correctAnswer"',
            [section || 'General', question, JSON.stringify(options), ansIdx]
        );
        res.status(201).json({ message: 'Question added successfully', question: result.rows[0] });
    } catch (error) {
        console.error('Admin add question error:', error);
        res.status(500).json({ error: 'Failed to add question: ' + error.message });
    }
});

// Update a question
router.put('/questions/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { section, question, options, correctAnswer } = req.body;
        if (!question || !Array.isArray(options) || options.length === 0) {
            return res.status(400).json({ error: 'Question text and options are required' });
        }
        const ansIdx = typeof correctAnswer === 'number' ? correctAnswer : parseInt(correctAnswer, 10) || 0;
        const result = await query(
            'UPDATE questions SET section = $1, question_text = $2, options = $3, correct_answer = $4 WHERE id = $5 RETURNING id, section, question_text as question, options, correct_answer as "correctAnswer"',
            [section || 'General', question, JSON.stringify(options), ansIdx, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json({ message: 'Question updated successfully', question: result.rows[0] });
    } catch (error) {
        console.error('Admin update question error:', error);
        res.status(500).json({ error: 'Failed to update question: ' + error.message });
    }
});

// Delete a question
router.delete('/questions/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM questions WHERE id = $1', [id]);
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Admin delete question error:', error);
        res.status(500).json({ error: 'Failed to delete question: ' + error.message });
    }
});

// Bulk import questions (replace or append)
router.post('/questions/bulk', verifyToken, isAdmin, async (req, res) => {
    try {
        const { questions, replaceAll } = req.body;
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ error: 'No questions provided for import' });
        }

        if (replaceAll) {
            await query('DELETE FROM questions');
        }

        let insertedCount = 0;
        for (const q of questions) {
            const qText = q.question || q.question_text;
            const opts = Array.isArray(q.options) ? q.options : [];
            const ans = typeof q.correctAnswer === 'number' ? q.correctAnswer : parseInt(q.correctAnswer, 10) || 0;
            const sec = q.section || 'General';

            if (qText && opts.length > 0) {
                await query(
                    'INSERT INTO questions (section, question_text, options, correct_answer) VALUES ($1, $2, $3, $4)',
                    [sec, qText, JSON.stringify(opts), ans]
                );
                insertedCount++;
            }
        }

        res.json({
            message: `Successfully ${replaceAll ? 'replaced with' : 'added'} ${insertedCount} questions`,
            count: insertedCount
        });
    } catch (error) {
        console.error('Admin bulk questions error:', error);
        res.status(500).json({ error: 'Failed to import questions: ' + error.message });
    }
});

// Clear all questions
router.delete('/questions', verifyToken, isAdmin, async (req, res) => {
    try {
        await query('DELETE FROM questions');
        res.json({ message: 'All questions cleared successfully' });
    } catch (error) {
        console.error('Admin clear all questions error:', error);
        res.status(500).json({ error: 'Failed to clear questions: ' + error.message });
    }
});

module.exports = router;
