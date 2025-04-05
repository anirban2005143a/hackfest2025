// Feedback Schema
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    type: {
      type: String,
      required: true,
      enum: ['general', 'positive', 'negative', 'bug', 'suggestion']
    },
    message: {
      type: String,
      required: true
    },
    email: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  
  const Feedback = mongoose.model('Feedback', feedbackSchema);
  