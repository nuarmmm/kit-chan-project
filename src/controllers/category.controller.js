const CategoryModel = require('../models/category.model');
const activitiesMock = require('../mock/activities.mock');

class CategoryController {
  static async getCampsByCategory(req, res) {
    try {
      const { category } = req.params;
      const camps = await CategoryModel.getCampsByCategory(category);
      res.json(camps);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // เพิ่ม endpoint mock สำหรับ frontend
  static getActivitiesByCategory(req, res) {
    const category = req.params.category;
    const activities = activitiesMock[category] || [];
    res.json(activities);
  }

  static getAllActivities(req, res) {
    // รวมกิจกรรมทุกหมวด
    const all = Object.values(activitiesMock).flat();
    res.json(all);
  }
}

module.exports = CategoryController;