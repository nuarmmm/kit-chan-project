const pool = require('../db');

class CategoryModel {
  static async getCampsByCategory(category) {
    const query = `
      SELECT camp_name, image_url 
      FROM camps 
      WHERE category = $1
    `;
    try {
      const result = await pool.query(query, [category]);
      return result.rows;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = CategoryModel;