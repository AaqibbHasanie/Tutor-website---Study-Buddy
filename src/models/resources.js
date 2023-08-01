// import mongoose, { SchemaType } from 'mongoose';
const mongoose = require("mongoose");
const { Schema } = mongoose;

const resources = new Schema({
  content: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});
// module.exports = mongoose.model('resources',resources)
const Resources = new mongoose.model("Resources", resources);
module.exports = Resources;
