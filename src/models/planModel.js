const db = require('../config/db');

class PlanModel {
    static async findAll() {
        const query = `SELECT * FROM plans ORDER BY min_amount ASC;`;
        const { rows } = await db.query(query);
        return rows;
    }

    static async findById(id) {
        const query = `SELECT * FROM plans WHERE id = $1;`;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }
}

module.exports = PlanModel;
