const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Applied', 'Interview', 'Selected', 'Rejected'], default: 'Applied' },
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const placementDriveSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  description: { type: String },
  minCGPA: { type: Number, default: 0 },
  maxBacklogs: { type: Number, default: 0 },
  eligibleBranches: [{ type: String, required: true }],
  minSemestersCompleted: { type: Number, default: 0 },
  date: { type: Date, required: true },
  applications: [applicationSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);