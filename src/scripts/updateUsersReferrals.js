require('dotenv').config();
const db = require('../config/db');

const updateUsersForReferrals = async () => {
    const queryText = `
    -- Add referral_code column if it doesn't exist
    DO $$ 
    BEGIN 
        IF NOT EXISTS (SELECT 1 FROM medical_columns WHERE table_name='users' AND column_name='referral_code') THEN
            ALTER TABLE users ADD COLUMN referral_code VARCHAR(20) UNIQUE;
            ALTER TABLE users ADD COLUMN referred_by INTEGER REFERENCES users(id);
        END IF;
    END $$;

    -- Update existing users to have a referral code (simple hash of id/email for now)
    UPDATE users SET referral_code = 'REF' || LPAD(id::text, 6, '0') WHERE referral_code IS NULL;
    
    -- Make it NOT NULL for future
    ALTER TABLE users ALTER COLUMN referral_code SET NOT NULL;
  `;

    try {
        // Since medical_columns is a typo in my thought above, let's use standard pg way
        const checkQuery = `
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE,
            ADD COLUMN IF NOT EXISTS referred_by INTEGER REFERENCES users(id);
        `;
        await db.query(checkQuery);

        // Generate codes for those who don't have one
        await db.query("UPDATE users SET referral_code = 'REF' || id WHERE referral_code IS NULL;");

        console.log("Users table updated for referrals successfully");
    } catch (err) {
        console.error("Error updating users table for referrals", err);
    } finally {
        process.exit(0);
    }
}

updateUsersForReferrals();
