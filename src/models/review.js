const mongoose = require("mongoose");
const { Schema } = mongoose;

const review = new Schema({
  content: { type: String, required: true },
  tutorEmail: { type: String, required: true },
  studentEmail: { type: String, required: true },
});

const Review = mongoose.model("Review", review);

module.exports = Review;
