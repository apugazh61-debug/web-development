const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const questions = [
  { section: "Aptitude", question: "Which HTTP status code indicates that the request has succeeded but the server is not returning any content?", options: ["200", "201", "204", "304"], correctAnswer: 2 },
  { section: "Aptitude", question: "Which CSS property is used to control the stacking order of positioned elements?", options: ["order", "z-index", "stack", "layer"], correctAnswer: 1 },
  { section: "Aptitude", question: "What will typeof NaN return in JavaScript?", options: ["number", "NaN", "undefined", "object"], correctAnswer: 0 },
  { section: "Aptitude", question: "Which HTML element is used to define client-side JavaScript?", options: ["<script>", "<js>", "<javascript>", "<code>"], correctAnswer: 0 },
  { section: "Aptitude", question: "Which HTTP method is idempotent?", options: ["POST", "PATCH", "PUT", "CONNECT"], correctAnswer: 2 },
  { section: "Aptitude", question: "Which CSS layout model is best suited for one-dimensional layouts?", options: ["Grid", "Flexbox", "Float", "Position"], correctAnswer: 1 },
  { section: "Aptitude", question: "Which JavaScript feature allows functions to remember variables from their outer scope?", options: ["Prototype", "Closure", "Callback", "Promise"], correctAnswer: 1 },
  { section: "Aptitude", question: "Which header helps prevent clickjacking attacks?", options: ["X-Frame-Options", "Content-Type", "Cache-Control", "Accept"], correctAnswer: 0 },
  { section: "Aptitude", question: "Which API is used to store key-value data in the browser with no expiration time?", options: ["SessionStorage", "Cookies", "LocalStorage", "IndexedDB"], correctAnswer: 2 },
  { section: "Aptitude", question: "What does CORS stand for?", options: ["Cross-Origin Resource Sharing", "Cross-Origin Request Security", "Client-Origin Resource Sharing", "Cross-Object Resource Sharing"], correctAnswer: 0 },
  { section: "Programming", question: "Which JavaScript method converts a JSON string into an object?", options: ["JSON.parse()", "JSON.stringify()", "JSON.convert()", "JSON.object()"], correctAnswer: 0 },
  { section: "Programming", question: "Which HTTP status code represents Unauthorized access?", options: ["401", "403", "404", "500"], correctAnswer: 0 },
  { section: "Programming", question: "Which CSS unit is relative to the root element's font size?", options: ["em", "rem", "px", "vh"], correctAnswer: 1 },
  { section: "Programming", question: "Which JavaScript keyword is used to define an asynchronous function?", options: ["async", "defer", "await", "promise"], correctAnswer: 0 },
  { section: "Programming", question: "Which HTML attribute improves web accessibility for screen readers?", options: ["alt", "title", "label", "aria-label"], correctAnswer: 3 },
  { section: "Programming", question: "Which browser API allows running scripts in background threads?", options: ["Service Worker", "Web Worker", "Background API", "Async API"], correctAnswer: 1 },
  { section: "Programming", question: "Which CSS property controls how overflowing content is handled?", options: ["overflow", "clip", "wrap", "hidden"], correctAnswer: 0 },
  { section: "Programming", question: "Which HTTP header controls how long a response is cached?", options: ["Cache-Control", "Accept", "Connection", "Host"], correctAnswer: 0 },
  { section: "Programming", question: "Which JavaScript method schedules a function to run after a delay?", options: ["setTimeout()", "setInterval()", "delay()", "sleep()"], correctAnswer: 0 },
  { section: "Programming", question: "Which protocol is primarily used for real-time communication in web apps?", options: ["HTTP", "WebSocket", "FTP", "SMTP"], correctAnswer: 1 },
  { section: "Problem Solving", question: "Which HTML element is used to embed vector graphics?", options: ["<canvas>", "<svg>", "<vector>", "<draw>"], correctAnswer: 1 },
  { section: "Problem Solving", question: "Which CSS property makes an element invisible but still takes up space?", options: ["display:none", "opacity:0", "visibility:hidden", "hidden:true"], correctAnswer: 2 },
  { section: "Problem Solving", question: "Which JavaScript object represents the browser window?", options: ["document", "navigator", "window", "screen"], correctAnswer: 2 },
  { section: "Problem Solving", question: "Which database type is MongoDB?", options: ["SQL", "Graph", "NoSQL", "Hierarchical"], correctAnswer: 2 },
  { section: "Problem Solving", question: "Which HTTP method is used to partially update a resource?", options: ["PUT", "PATCH", "POST", "DELETE"], correctAnswer: 1 },
  { section: "Problem Solving", question: "Which CSS property creates smooth animations between property values?", options: ["animation", "transition", "transform", "motion"], correctAnswer: 1 },
  { section: "Problem Solving", question: "Which JavaScript concept allows non-blocking code execution?", options: ["Event Loop", "DOM", "Prototype", "Parsing"], correctAnswer: 0 },
  { section: "Problem Solving", question: "Which HTML tag defines metadata about the document?", options: ["<meta>", "<data>", "<info>", "<headinfo>"], correctAnswer: 0 },
  { section: "Problem Solving", question: "Which CSS property is used to rotate an element?", options: ["rotate", "transform", "spin", "motion"], correctAnswer: 1 },
  { section: "Problem Solving", question: "Which JavaScript feature allows handling asynchronous operations more cleanly than callbacks?", options: ["Prototype", "Promise", "Loop", "Closure"], correctAnswer: 1 }
];

async function seedQuestions() {
    const client = await pool.connect();
    try {
        console.log('Connected to database.');
        await client.query('DELETE FROM questions');
        console.log('Cleared existing questions.');
        for (const q of questions) {
            await client.query(
                'INSERT INTO questions (section, question_text, options, correct_answer) VALUES ($1, $2, $3, $4)',
                [q.section, q.question, JSON.stringify(q.options), q.correctAnswer]
            );
        }
        const count = await client.query('SELECT COUNT(*) FROM questions');
        console.log(`SUCCESS: ${count.rows[0].count} questions seeded.`);
    } catch (err) {
        console.error('Error seeding questions:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

seedQuestions();
