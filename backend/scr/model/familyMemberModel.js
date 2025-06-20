const mongoose = require('mongoose');
const familyMemberSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"user",
        required:true
    },
    name:{
        type:String,
        required:true
    },
    relation:{
        type:String,
        required:true
    },
    memberEmail:{
        type:String,
        required:true
    },
    registered: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'active'], default: 'pending' },
})
module.exports = mongoose.model('familyMemberModel',familyMemberSchema);