const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true, enum: ['Student', 'Alumni', 'Coordinator', 'Advisor'] },
  name: { type: String },
  isVerified: { type: Boolean, default: false },
  // Role-specific fields (optional)
  year: { type: String }, // For Students/Alumni
  branch: { type: String }, // For Students/Alumni
  department: { type: String }, // For Coordinators/Advisors
});

module.exports = mongoose.model('User', userSchema);