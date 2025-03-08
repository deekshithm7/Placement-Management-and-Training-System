const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'AptitudeTest', required: true },
  answers: [{ type: Number }], // Array of selected option indices (0-3) for each question
  score: { type: Number, required: true }, // Total score
  totalMarks: { type: Number, required: true }, // Total possible marks for the test
  submittedAt: { type: Date, default: Date.now }
});

// Create a compound index to ensure one attempt per student per test
quizResultSchema.index({ student: 1, test: 1 }, { unique: true });

module.exports = mongoose.model('QuizResult', quizResultSchema);