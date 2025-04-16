const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true
  },
  applyUrl: {
    type: String,
    required: [true, 'Application URL is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // Simple URL validation
        return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  applicationDeadline: {
    type: Date,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
JobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Job = mongoose.model('Job', JobSchema);

module.exports = Job;