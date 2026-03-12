const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exam');
const resultRoutes = require('./routes/result');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5001;

console.log('Environment Debug:');
console.log('PORT:', process.env.PORT);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('Using PORT:', PORT);

// Middleware
app.use(cors({
    origin: true, // Reflect request origin (allows any origin to access, good for local dev)
    credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/result', resultRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// 404 Handler
app.use((req, res) => {
    console.warn(`404 - Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found on this server` });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT} and accessible on local network`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Try killing existing processes or changing the port in .env`);
        process.exit(1);
    } else {
        console.error('Server failed to start:', err);
    }
});

