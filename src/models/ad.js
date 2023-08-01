// import mongoose, { SchemaType } from 'mongoose';
const mongoose = require("mongoose")
const { Schema } = mongoose;

const ads = new Schema({
  subject: { type: String, required: true },
  class: { type: String, required: true },
  time: { type: String, required: true },
  price: { type: String, required: true },
  image: { type: String, required: true },
});
// module.exports = mongoose.model('ads',ads)
const Ads = new mongoose.model("Ads" , ads)
module.exports = Ads

