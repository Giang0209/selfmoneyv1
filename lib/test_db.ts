import 'dotenv/config';
import pool from './db';

console.log(process.env.DATABASE_URL);

async function testDbConnection() {
    try {
        const result = await pool.query('SELECT id, phone, username FROM users');

        console.log('✅ Database connected!');
        console.log(result.rows);

    } catch (error) {
        console.error('❌ Database connection failed:', error);
    } finally {
        await pool.end();
    }
}

testDbConnection();