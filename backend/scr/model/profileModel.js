const mongoose = require('mongoose');
const profileSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    photo:{
        type:String,
        required:true
    }
})
module.exports = mongoose.model("profileModel",profileSchema);