// import mongoose, { SchemaType } from 'mongoose';
const mongoose = require("mongoose")
const { Schema } = mongoose;

const notif = new Schema({
  content: {type:String, required:false}
  
});
// module.exports = mongoose.model('notif',notif)
const Notif = new mongoose.model("Notif" , notif)
module.exports = Notif
