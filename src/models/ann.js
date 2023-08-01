// import mongoose, { SchemaType } from 'mongoose';
const mongoose = require("mongoose");
const { Schema } = mongoose;

const ann = new Schema({
  content: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});
// module.exports = mongoose.model('ann',ann)
const Ann = new mongoose.model("Ann", ann);
module.exports = Ann;
