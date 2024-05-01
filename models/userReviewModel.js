const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service', // Reference to the Service model
    required: true
  },
  user: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
