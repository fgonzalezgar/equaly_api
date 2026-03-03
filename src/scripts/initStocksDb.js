require('dotenv').config();
const db = require('../config/db');

const initStocksDB = async () => {
    const queryText = `
    -- 1. Stocks table (The available companies/assets)
    CREATE TABLE IF NOT EXISTS stocks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        symbol VARCHAR(20) UNIQUE NOT NULL,
        current_price DECIMAL(15,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. User Stocks table (The shares bought by users)
    CREATE TABLE IF NOT EXISTS user_stocks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        stock_id INTEGER REFERENCES stocks(id) ON DELETE RESTRICT,
        quantity DECIMAL(15,4) NOT NULL,
        purchase_price DECIMAL(15,2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
        stripe_payment_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Insert some sample stocks if empty
    INSERT INTO stocks (name, symbol, current_price)
    VALUES 
        ('Equaly Global', 'EQG', 10.00),
        ('Tech Growth', 'TGR', 25.50),
        ('Sustainable Energy', 'SEN', 15.75)
    ON CONFLICT (symbol) DO NOTHING;
  `;

    try {
        await db.query(queryText);
        console.log("Stocks and User Stocks tables created successfully ✅");
    } catch (err) {
        console.error("Error creating stocks tables", err);
    } finally {
        process.exit(0);
    }
}

initStocksDB();
