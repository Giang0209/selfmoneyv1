import 'dotenv/config';
import pool from './db';

async function migrate() {
    try {
        console.log('⏳ Starting migration...');

        // 1. Create saving_goals table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS saving_goals (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL,
                category_id INT NULL,
                name VARCHAR(200) NOT NULL,
                icon VARCHAR(50),
                target_amount NUMERIC(12,2) NOT NULL CHECK (target_amount > 0),
                saved_amount NUMERIC(12,2) DEFAULT 0,
                deadline DATE,
                color VARCHAR(20) DEFAULT 'violet',
                status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL,
                CONSTRAINT fk_goal_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT fk_goal_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Table saving_goals created or already exists.');

        // 2. Create saving_contributions table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS saving_contributions (
                id SERIAL PRIMARY KEY,
                goal_id INT NOT NULL,
                user_id INT NOT NULL,
                transaction_id INT NULL,
                amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
                note TEXT,
                contributed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_contrib_goal FOREIGN KEY (goal_id) REFERENCES saving_goals(id) ON DELETE CASCADE,
                CONSTRAINT fk_contrib_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT fk_contrib_trans FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Table saving_contributions created or already exists.');

        console.log('🎉 Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await pool.end();
    }
}

migrate();
