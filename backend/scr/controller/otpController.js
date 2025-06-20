// controllers/otpController.js
const otpModel = require('../model/otpModel');
const userModel = require('../model/userModel');
const sendMail = require('../helper/mailingService');
const bcrypt = require('bcryptjs');

const createOtp = async (req, res) => {
    try {
        const { email } = req.body;
        
        // First, check if user exists with this email
        const user = await userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email address"
            });
        }

        const userId = user._id;
        const userName = user.name || 'User';

        // Generate 4-digit OTP
        const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

        // Delete any existing unused OTPs for this user
        await otpModel.deleteMany({
            userId,
            isUsed: false
        });

        // Create new OTP record
        const otpRecord = await otpModel.create({
            userId,
            email: email.toLowerCase(),
            otp: generatedOtp
        });

        // Email template for password reset
        const msg = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333;">Hello, ${userName}!</h2>
                <p style="color: #555; font-size: 16px;">You have requested to reset your password. Your verification code is:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <h1 style="color: #007bff; font-size: 36px; background-color: #f8f9fa; padding: 20px; border-radius: 8px; letter-spacing: 5px;">${generatedOtp}</h1>
                </div>
                <p style="color: #555;">Please enter this code to proceed with password reset.</p>
                <p style="color: #dc3545; font-size: 14px; font-weight: bold;">⏰ This code will expire in 5 minutes.</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #6c757d; font-size: 12px;">🔒 If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
                <p style="color: #6c757d; font-size: 12px;">For security reasons, this code can only be used once.</p>
            </div>
        `;

        // Send email
        const emailSent = await sendMail(email, "Password Reset - Verification Code", msg);
        
        if (emailSent.accepted && emailSent.accepted.includes(email)) {
            return res.status(201).json({
                success: true,
                message: "Password reset OTP sent successfully. Please check your email for the verification code.",
                data: {
                    email: email,
                    expiresIn: "5 minutes",
                    maxAttempts: 3
                }
            });
        } else {
            // If email failed, delete the created OTP
            await otpModel.findByIdAndDelete(otpRecord._id);
            throw new Error("Failed to send the verification email.");
        }

    } catch (error) {
        console.log(`Error in createOtp: ${error.message}`);
        
        return res.status(500).json({ 
            success: false,
            message: "Server error while creating OTP. Please try again later." 
        });
    }
};

const verifyOtp = async (req, res) => {
    try {
        // No need to parse again - middleware already validated and parsed the data
        const { email, otp } = req.body;

        // Find the most recent unused OTP for this email
        const otpRecord = await otpModel.findOne({
            email: email.toLowerCase(),
            isUsed: false
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP. Please request a new one."
            });
        }

        // Check if maximum attempts exceeded
        if (otpRecord.attempts >= 3) {
            await otpModel.findByIdAndDelete(otpRecord._id);
            return res.status(400).json({
                success: false,
                message: "Maximum verification attempts exceeded. Please request a new OTP."
            });
        }

        // Increment attempts before verification
        otpRecord.attempts += 1;
        await otpRecord.save();

        // Verify OTP
        if (otpRecord.otp === otp.toString()) {
            // Mark OTP as used
            otpRecord.isUsed = true;
            await otpRecord.save();

            return res.status(200).json({
                success: true,
                message: "OTP verified successfully. You can now reset your password.",
                data: {
                    userId: otpRecord.userId,
                    email: otpRecord.email,
                    verified: true,
                    resetToken: `${otpRecord.userId}_${Date.now()}`
                }
            });
        } else {
            const remainingAttempts = 3 - otpRecord.attempts;
            return res.status(400).json({
                success: false,
                message: `Invalid OTP. You have ${remainingAttempts} attempt(s) remaining.`
            });
        }

    } catch (error) {
        console.log(`Error in verifyOtp: ${error.message}`);
        
        return res.status(500).json({ 
            success: false,
            message: "Server error while verifying OTP" 
        });
    }
};

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email address"
            });
        }

        const userId = user._id;

        // Check rate limiting - prevent spam (1 minute cooldown)
        const recentOtp = await otpModel.findOne({
            userId,
            createdAt: { $gte: new Date(Date.now() - 60000) }
        });

        if (recentOtp) {
            const timeLeft = Math.ceil((60000 - (Date.now() - recentOtp.createdAt)) / 1000);
            return res.status(429).json({
                success: false,
                message: `Please wait ${timeLeft} seconds before requesting another OTP`
            });
        }

        // Create new OTP by calling createOtp function
        return createOtp(req, res);

    } catch (error) {
        console.log(`Error in resendOtp: ${error.message}`);
        return res.status(500).json({ 
            success: false,
            message: "Server error while resending OTP" 
        });
    }
};

const resetPassword = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const validOtp = await otpModel.findOne({ userId: user._id, otp });
    if (!validOtp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await userModel.findByIdAndUpdate(user._id, { password: hashedPassword });

    await otpModel.deleteMany({ userId: user._id });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login with your new password."
    });
  } catch (error) {
    console.error(`Error in resetPassword: ${error.message}`);
    return res.status(500).json({ success: false, message: "Server error while resetting password" });
  }
};


module.exports = {
    createOtp,
    verifyOtp,
    resendOtp,
    resetPassword
};