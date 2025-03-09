// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Removed required: true, can be null initially
  role: { type: String, enum: ['Student', 'Alumni', 'Coordinator', 'Advisor'], default: 'Student' },
  registered: { type: Boolean, default: false },
  registrationNumber: { type: String, unique: true, sparse: true },
  batch: { type: Number, required: function() { return this.role === 'Student'; } },
  semestersCompleted: { type: Number, default: 0, required: function() { return this.role === 'Student'; } },
  cgpa: { type: Number, default: null },
  numberOfBacklogs: { type: Number, default: 0, required: function() { return this.role === 'Student'; } },
  branch: { type: String },
  phoneNumber: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  eligibleDrives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive' }],
  googleId: { type: String }
});

module.exports = mongoose.model('User', userSchema);