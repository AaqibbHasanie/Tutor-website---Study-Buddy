// import mongoose, { SchemaType } from 'mongoose';
const mongoose = require("mongoose")
const { Schema } = mongoose;

const admin = new Schema({
  email: {type:String, required:true,unique:true},
  password:{type:String, required:true},
  ann : {type: [Schema.Types.ObjectId], required:false, default:[]},
  resource: {type: [Schema.Types.ObjectId], required:false, default:[]},
  notif: {type: [Schema.Types.ObjectId], required:false, default:[]}
});
// module.exports = mongoose.model('admin',admin)
const Admin = new mongoose.model("Admin" , admin)
module.exports = Admin
