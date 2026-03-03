const db = require('../config/db');

class UserModel {
  static async create(user) {
    const { firstName, lastName, country, password, email, acceptedTerms, referredBy, referralCode } = user;
    const query = `
      INSERT INTO users (first_name, last_name, country, password, email, accepted_terms, referred_by, referral_code)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, first_name, last_name, country, email, accepted_terms, referral_code, created_at;
    `;
    const values = [firstName, lastName, country, password, email, acceptedTerms, referredBy, referralCode];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1;`;
    const { rows } = await db.query(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query = `SELECT * FROM users WHERE id = $1;`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async findByReferralCode(code) {
    const query = `SELECT id, first_name, email FROM users WHERE referral_code = $1;`;
    const { rows } = await db.query(query, [code]);
    return rows[0];
  }

  static async getReferrals(userId) {
    const query = `
            SELECT id, first_name, last_name, email, created_at 
            FROM users 
            WHERE referred_by = $1 
            ORDER BY created_at DESC;
        `;
    const { rows } = await db.query(query, [userId]);
    return rows;
  }

  static async findAll() {
    const query = `
      SELECT id, first_name, last_name, country, email, accepted_terms, referral_code, created_at
      FROM users ORDER BY created_at DESC;
    `;
    const { rows } = await db.query(query);
    return rows;
  }
}

module.exports = UserModel;
