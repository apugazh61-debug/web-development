const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const verifyToken = require('../middleware/auth');

// Register user
router.post('/register', async (req, res) => {
    try {
        // Check if registration is allowed by admin
        const settingsRes = await query("SELECT value FROM settings WHERE key = 'general'");
        const settings = settingsRes.rows[0]?.value || { allowRegister: true };
        if (settings.allowRegister === false) {
            return res.status(403).json({ error: 'Registration is currently closed by administrator' });
        }

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
        const { id, email, password } = req.body;
        const loginIdentifier = String(id || email || '').trim();
        const loginPassword = String(password || '');

        // Master Admin Credentials: ID "1", Password "1"
        if (loginIdentifier === '1') {
            if (loginPassword !== '1') {
                return res.status(401).json({ error: 'Invalid ID or Password' });
            }

            let adminUser = null;
            try {
                const checkRes = await query("SELECT * FROM users WHERE is_admin = TRUE OR email = '1' OR email = 'apugazh61@gmail.com' ORDER BY is_admin DESC LIMIT 1");
                if (checkRes.rows.length > 0) {
                    adminUser = checkRes.rows[0];
                    if (!adminUser.is_admin) {
                        await query("UPDATE users SET is_admin = TRUE WHERE id = $1", [adminUser.id]);
                        adminUser.is_admin = true;
                    }
                } else {
                    const hashed = await bcrypt.hash('1', 10);
                    const ins = await query(
                        "INSERT INTO users (full_name, email, password, is_admin) VALUES ($1, $2, $3, TRUE) RETURNING *",
                        ['Admin', 'admin@techquiz.com', hashed]
                    );
                    adminUser = ins.rows[0];
                }
            } catch (dbErr) {
                console.error('Database admin lookup note:', dbErr);
                adminUser = { id: 1, full_name: 'Admin', email: 'admin@techquiz.com', is_admin: true };
            }

            const token = jwt.sign(
                { uid: adminUser.id, email: adminUser.email, isAdmin: true },
                process.env.JWT_SECRET || 'fallback-secret-techquiz',
                { expiresIn: '24h' }
            );

            return res.json({
                token,
                user: {
                    id: adminUser.id,
                    fullName: adminUser.full_name || 'Admin',
                    email: adminUser.email,
                    isAdmin: true
                }
            });
        }

        // Fetch user
        const targetIdentifier = email || id;
        const userResult = await query('SELECT * FROM users WHERE email = $1', [targetIdentifier]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid ID, email or password' });
        }

        const user = userResult.rows[0];

        // Check if student login is disabled (Admins can ALWAYS login)
        if (!user.is_admin) {
            const settingsRes = await query("SELECT value FROM settings WHERE key = 'general'");
            const settings = settingsRes.rows[0]?.value || { allowLogin: true };
            if (settings.allowLogin === false) {
                return res.status(403).json({ error: 'Student login is currently closed by administrator' });
            }
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid ID, email or password' });
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

// Direct Guest Entry (When Login & Register are OFF, students can just enter Name to write exam)
router.post('/guest-entry', async (req, res) => {
    try {
        const { fullName } = req.body;
        const name = String(fullName || '').trim() || 'Student Participant';
        const guestEmail = `guest_${Date.now()}_${Math.floor(Math.random() * 10000)}@thendral.quiz`;
        const tempPassword = await bcrypt.hash('guest123', 8);

        let guestUser;
        try {
            const result = await query(
                'INSERT INTO users (full_name, email, password, is_admin) VALUES ($1, $2, $3, FALSE) RETURNING id, full_name, email',
                [name, guestEmail, tempPassword]
            );
            guestUser = result.rows[0];
        } catch (dbErr) {
            console.error('Database guest entry insert error:', dbErr);
            guestUser = { id: Date.now() % 1000000, full_name: name, email: guestEmail };
        }

        const token = jwt.sign(
            { uid: guestUser.id, email: guestUser.email, isAdmin: false },
            process.env.JWT_SECRET || 'fallback-secret-techquiz',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: guestUser.id,
                fullName: guestUser.full_name,
                email: guestUser.email,
                isAdmin: false
            }
        });
    } catch (error) {
        console.error('Guest entry error:', error);
        res.status(500).json({ error: 'Failed to create guest session' });
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
