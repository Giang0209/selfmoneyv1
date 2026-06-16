import 'dotenv/config';
import pool from './db';

console.log('Connecting to DATABASE_URL:', process.env.DATABASE_URL);

async function alterTable() {
    try {
        console.log('Checking database table users...');
        const checkResult = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='username';
        `);
        
        if (checkResult.rows.length > 0) {
            console.log('Column "username" exists. Dropping it...');
            await pool.query('ALTER TABLE users DROP COLUMN username;');
            console.log('✅ Column "username" successfully dropped from users table!');
        } else {
            console.log('✅ Column "username" does not exist in users table (already dropped).');
        }

        const columns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name='users';
        `);
        console.log('Current columns in users table:');
        console.log(columns.rows);
    } catch (error) {
        console.error('❌ Database query failed:', error);
    } finally {
        await pool.end();
    }
}

alterTable();