const { Schema, model } = require('mongoose');

const eventSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  date: { type: Date, required: true },
  location: { type: String, trim: true },
  imageUrl: { type: String, trim: true },
  category: { type: String, trim: true }   // เช่น "อบรม", "วิชาการ"
}, { timestamps: true });

eventSchema.index({ date: 1 });
eventSchema.index({ title: 'text', description: 'text' });

module.exports = model('Event', eventSchema);
