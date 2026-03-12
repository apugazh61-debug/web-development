const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const verifyToken = require('../middleware/auth');

// Get user's exam result
router.get('/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUserId = req.user.uid;

        // Users can only view their own results (unless it's an admin)
        if (userId !== requestingUserId.toString() && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Unauthorized to view this result' });
        }

        const result = await query('SELECT * FROM results WHERE user_id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Result not found' });
        }

        const data = result.rows[0];
        res.json({
            totalScore: data.total_score,
            correctCount: data.correct_count,
            wrongCount: data.wrong_count,
            sectionScores: data.section_scores,
            timeTaken: data.time_taken,
            submittedAt: data.submitted_at,
            answerDetails: data.answer_details
        });
    } catch (error) {
        console.error('Get result error:', error);
        res.status(500).json({ error: 'Failed to fetch result' });
    }
});

// Submit exam result
router.post('/submit', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { totalScore, correctCount, wrongCount, sectionScores, timeTaken, answerDetails } = req.body;

        // Check if user has already attempted
        const userCheck = await query('SELECT has_attempted FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length > 0 && userCheck.rows[0].has_attempted) {
            return res.status(400).json({ error: 'Exam already submitted' });
        }

        // Save result
        await query(
            'INSERT INTO results (user_id, total_score, correct_count, wrong_count, section_scores, time_taken, answer_details) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [userId, totalScore, correctCount, wrongCount, JSON.stringify(sectionScores), timeTaken, JSON.stringify(answerDetails)]
        );

        // Update user status
        await query('UPDATE users SET has_attempted = TRUE WHERE id = $1', [userId]);

        res.status(201).json({ message: 'Result submitted successfully' });
    } catch (error) {
        console.error('Submit result error:', error);
        res.status(500).json({ error: 'Failed to submit result' });
    }
});

module.exports = router;
