const db = require('../config/db');

class InvestmentModel {
    static async create(investment) {
        const { userId, planId, amount, paymentMethod, stripePaymentId } = investment;
        const query = `
      INSERT INTO investments (user_id, plan_id, amount, payment_method, stripe_payment_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
        const values = [userId, planId, amount, paymentMethod, stripePaymentId];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async updateStatus(stripePaymentId, status, startDate, endDate) {
        const query = `
            UPDATE investments 
            SET status = $1, start_date = $2, end_date = $3 
            WHERE stripe_payment_id = $4 
            RETURNING *;
        `;
        const values = [status, startDate, endDate, stripePaymentId];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async findByUserId(userId) {
        const query = `
      SELECT i.*, p.name as plan_name, p.daily_roi, p.duration_days
      FROM investments i
      JOIN plans p ON i.plan_id = p.id
      WHERE i.user_id = $1
      ORDER BY i.created_at DESC;
    `;
        const { rows } = await db.query(query, [userId]);
        return rows;
    }
}

module.exports = InvestmentModel;
