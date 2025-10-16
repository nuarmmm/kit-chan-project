const activitiesMock = require('../mock/activities.mock');

class CategoryController {
  static getActivitiesByCategory(req, res) {
    const category = req.params.category;
    const activities = activitiesMock[category] || [];
    res.json(activities);
  }

  static getAllActivities(req, res) {
    const all = Object.values(activitiesMock).flat();
    res.json(all);
  }
}

module.exports = CategoryController;