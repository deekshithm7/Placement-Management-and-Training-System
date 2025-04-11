const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestResultSchema = new Schema({
  testId: {
    type: Schema.Types.ObjectId,
    ref: 'AptitudeTest',
    required: true
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  passingScore: {
    type: Number,
    required: true
  },
  maxScore: {
    type: Number,
    required: true
  },
  answers: [{
    questionId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    selectedOption: {
      type: Schema.Types.Mixed
    },
    isCorrect: {
      type: Boolean
    }
  }],
  timeSpent: {
    type: Number, // time in minutes
    default: 0
  },
  status: {
    type: String,
    enum: ['Started', 'In Progress', 'Completed', 'Timeout'],
    default: 'Started'
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

// Virtual for percentage score
TestResultSchema.virtual('percentageScore').get(function() {
  return this.maxScore > 0 ? (this.score / this.maxScore) * 100 : 0;
});

// Index for efficient queries
TestResultSchema.index({ testId: 1, student: 1 }, { unique: true });
TestResultSchema.index({ completedAt: 1 });
TestResultSchema.index({ 'answers.questionId': 1 });

module.exports = mongoose.model('TestResult', TestResultSchema);