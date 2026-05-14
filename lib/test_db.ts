import 'dotenv/config';
import pool from './db';

console.log(process.env.DATABASE_URL);

async function testDbConnection() {
    try {
        console.log('⏳ Connecting...');

        const result = await pool.query('SELECT NOW()');

        console.log('✅ Database connected!');
        console.log(result.rows[0]);

    } catch (error) {
        console.error('❌ Database connection failed:', error);
    } finally {
        await pool.end();
    }
}

testDbConnection();