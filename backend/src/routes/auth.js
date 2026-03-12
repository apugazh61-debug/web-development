const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const verifyToken = require('../middleware/auth');

// Register user
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Check if user already exists
        const userCheck = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'User already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await query(
            'INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING id',
            [fullName, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.rows[0].id });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Fetch user
        const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = userResult.rows[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT
        const token = jwt.sign(
            { uid: user.id, email: user.email, isAdmin: user.is_admin },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                isAdmin: user.is_admin
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Check attempt status
router.get('/check-attempt', verifyToken, async (req, res) => {
    try {
        const uid = req.user.uid;
        const result = await query('SELECT has_attempted FROM users WHERE id = $1', [uid]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ hasAttempted: result.rows[0].has_attempted });
    } catch (error) {
        console.error('Check attempt error:', error);
        res.status(500).json({ error: 'Failed to check attempt status' });
    }
});

module.exports = router;
