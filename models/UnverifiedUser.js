const mongoose = require('mongoose');

const unverifiedUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  year: { type: String, required: true },
  branch: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['Student', 'Alumni'] },
  otpToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '10m' }, // Auto-delete after 10 minutes
});

module.exports = mongoose.model('UnverifiedUser', unverifiedUserSchema);