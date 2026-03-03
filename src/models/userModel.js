const db = require('../config/db');

class UserModel {
    static async create(user) {
        const { firstName, lastName, country, phone, email, acceptedTerms } = user;
        const query = `
      INSERT INTO users (first_name, last_name, country, phone, email, accepted_terms)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, first_name, last_name, country, phone, email, accepted_terms, created_at;
    `;
        const values = [firstName, lastName, country, phone, email, acceptedTerms];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async findByEmail(email) {
        const query = `
      SELECT * FROM users WHERE email = $1;
    `;
        const { rows } = await db.query(query, [email]);
        return rows[0];
    }

    static async findAll() {
        const query = `
      SELECT id, first_name, last_name, country, phone, email, accepted_terms, created_at
      FROM users ORDER BY created_at DESC;
    `;
        const { rows } = await db.query(query);
        return rows;
    }
}

module.exports = UserModel;
