require('dotenv').config();
const db = require('../config/db');

const initPlansDB = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        level VARCHAR(50) NOT NULL,
        daily_roi DECIMAL(5,2) NOT NULL,
        duration_days INTEGER NOT NULL,
        min_amount DECIMAL(10,2) NOT NULL,
        max_amount DECIMAL(15,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS investments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        plan_id INTEGER REFERENCES plans(id) ON DELETE RESTRICT,
        amount DECIMAL(15,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        stripe_payment_id VARCHAR(255),
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    INSERT INTO plans (name, level, daily_roi, duration_days, min_amount, max_amount)
    VALUES 
        ('Oro', 'VIP', 4.0, 60, 1, 999999999),
        ('Plata', 'PRO', 2.5, 45, 1, 999999999),
        ('Bronce', 'BÁSICO', 1.5, 30, 1, 999999999)
    ON CONFLICT (name) DO UPDATE SET 
        min_amount = EXCLUDED.min_amount,
        max_amount = EXCLUDED.max_amount;
  `;

    try {
        await db.query(queryText);
        console.log("Plans and Investments tables created successfully");
    } catch (err) {
        console.error("Error creating plans and investments tables", err);
    } finally {
        process.exit(0);
    }
}

initPlansDB();
