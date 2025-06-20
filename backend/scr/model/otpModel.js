const mongoose = require('mongoose');

const otpSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 4
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // OTP expires after 5 minutes (300 seconds)
    },
    attempts: {
        type: Number,
        default: 0,
        max: 3
    }
}, {
    timestamps: true
});

// Index for efficient queries

module.exports = mongoose.model('OTP', otpSchema);