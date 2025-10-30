const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  coverImage: {
    type: String, // เก็บ path ของภาพ
    default: ''
  },
  eventDate: {
    type: Date,
    required: true
  },
  closeDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);