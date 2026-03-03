require('dotenv').config();
const db = require('../config/db');

const initFinalLogicDB = async () => {
    const queryText = `
    -- 1. Ensure Plans table has correct precision
    DO $$ 
    BEGIN 
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plans' AND column_name='daily_roi') THEN
            ALTER TABLE plans ALTER COLUMN daily_roi TYPE DECIMAL(15,12);
        END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        level VARCHAR(50) NOT NULL,
        daily_roi DECIMAL(15,12) NOT NULL,
        duration_days INTEGER NOT NULL,
        min_amount DECIMAL(15,2) NOT NULL,
        max_amount DECIMAL(15,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Investments table
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

    -- 3. Commissions table (New)
    CREATE TABLE IF NOT EXISTS commissions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- The one receiving the money
        from_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- The referral
        investment_id INTEGER REFERENCES investments(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL, -- 'referral_5' or 'transfer_2'
        amount DECIMAL(15,2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Insert precise Plan data from image
    INSERT INTO plans (name, level, daily_roi, duration_days, min_amount, max_amount)
    VALUES 
        ('Oro', 'VIP', 0.36563071298, 60, 1, 999999999),
        ('Plata', 'PRO', 0.333333333333, 45, 1, 999999999),
        ('Bronce', 'BÁSICO', 0.166666666667, 30, 1, 999999999)
    ON CONFLICT (name) DO UPDATE SET 
        daily_roi = EXCLUDED.daily_roi,
        min_amount = EXCLUDED.min_amount,
        max_amount = EXCLUDED.max_amount;
  `;

    try {
        await db.query(queryText);
        console.log("Database updated with calculator logic and commissions table ✅");
    } catch (err) {
        console.error("Error updating database logic", err);
    } finally {
        process.exit(0);
    }
}

initFinalLogicDB();
