const db = require('../config/db');

class CommissionModel {
    static async create(commission) {
        const { userId, fromUserId, investmentId, type, amount, description } = commission;
        const query = `
            INSERT INTO commissions (user_id, from_user_id, investment_id, type, amount, description)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [userId, fromUserId, investmentId, type, amount, description];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async findByUserId(userId) {
        const query = `
            SELECT c.*, u.firstName as from_user_name
            FROM commissions c
            LEFT JOIN users u ON c.from_user_id = u.id
            WHERE c.user_id = $1
            ORDER BY c.created_at DESC;
        `;
        const { rows } = await db.query(query, [userId]);
        return rows;
    }
}

module.exports = CommissionModel;
