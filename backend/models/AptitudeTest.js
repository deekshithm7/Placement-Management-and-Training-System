const mongoose = require('mongoose');

const aptitudeTestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }], // Array of 4 options
    correctOption: { type: Number, required: true }, // Index of correct option (0-3)
    marks: { type: Number, required: true, default: 1 } // Marks for this question
  }],
  duration: { type: Number, required: true }, // Duration in minutes
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Coordinator who created the test
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AptitudeTest', aptitudeTestSchema);