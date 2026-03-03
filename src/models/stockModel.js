const db = require('../config/db');

class StockModel {
    static async findAll() {
        const query = `SELECT * FROM stocks ORDER BY name ASC;`;
        const { rows } = await db.query(query);
        return rows;
    }

    static async findById(id) {
        const query = `SELECT * FROM stocks WHERE id = $1;`;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async findPurchasedByUserId(userId) {
        const query = `
            SELECT us.*, s.name as stock_name, s.symbol
            FROM user_stocks us
            JOIN stocks s ON us.stock_id = s.id
            WHERE us.user_id = $1
            ORDER BY us.created_at DESC;
        `;
        const { rows } = await db.query(query, [userId]);
        return rows;
    }

    static async createPurchase(purchase) {
        const { userId, stockId, quantity, purchasePrice, stripePaymentId, status } = purchase;
        const query = `
            INSERT INTO user_stocks (user_id, stock_id, quantity, purchase_price, stripe_payment_id, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [userId, stockId, quantity, purchasePrice, stripePaymentId, status || 'pending'];
        const { rows } = await db.query(query, values);
        return rows[0];
    }
}

module.exports = StockModel;
