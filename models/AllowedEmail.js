const mongoose = require('mongoose');

const allowedEmailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['Student', 'Alumni', 'Coordinator', 'Advisor'], required: true },
  addedAt: { type: Date, default: Date.now },
});

allowedEmailSchema.index({ email: 1 });

module.exports = mongoose.model('AllowedEmail', allowedEmailSchema);