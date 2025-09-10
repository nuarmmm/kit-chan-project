const { Schema, model } = require('mongoose');

const registrationSchema = new Schema({
  user:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { type: String, enum: ['registered','interested','checked_in'], default: 'registered' },
  registeredAt: { type: Date, default: Date.now }
}, { timestamps: true });

// ป้องกันสมัครซ้ำ
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = model('Registration', registrationSchema);
