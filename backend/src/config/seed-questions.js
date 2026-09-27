const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const questions = require('../data/questions');

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
