// import mongoose, { SchemaType } from 'mongoose';
const mongoose = require("mongoose")
const { Schema } = mongoose;

const appt = new Schema({
  content: {type:String, required:false}
  
});
// module.exports = mongoose.model('appt',appt)
const Appt = new mongoose.model("Appt" , appt)
module.exports = Appt

