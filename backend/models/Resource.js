const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['document', 'video', 'link'],
    required: true
  },
  url: {
    type: String,
    trim: true
  },
  fileName: {
    type: String
  },
  filePath: {
    type: String
  },
  originalFileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  mimeType: {
    type: String
  }
});

module.exports = mongoose.model('Resource', ResourceSchema);