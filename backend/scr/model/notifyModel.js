const mongoose = require("mongoose");

const notifySchema = mongoose.Schema({
  toUser: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
    required: true
  },
  fromUser: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
    required: false
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedMemberId: {
    type: mongoose.Schema.ObjectId,
    ref: "familyMemberModel" // ✅ Link to family member
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('notify', notifySchema);
