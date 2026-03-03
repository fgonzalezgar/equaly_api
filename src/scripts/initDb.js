require('dotenv').config();
const db = require('../config/db');

const initDB = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      country VARCHAR(100) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      accepted_terms BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

    try {
        await db.query(queryText);
        console.log("Users table created successfully");
    } catch (err) {
        console.error("Error creating users table", err);
    } finally {
        process.exit(0);
    }
}

initDB();
