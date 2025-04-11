const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  link: { type: String, default: null }, // Optional: URL to redirect when clicked
  relatedId: { type: mongoose.Schema.Types.ObjectId, default: null } // Optional: Reference to related entity (e.g., PlacementDrive)
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
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
  googleId: { type: String },
  notifications: [notificationSchema] // Add notifications array
});

module.exports = mongoose.model('User', userSchema);