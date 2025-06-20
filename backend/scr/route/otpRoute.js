const express = require('express');
const otpRoute = express.Router();
const {createOtp,  verifyOtp, resendOtp ,resetPassword} = require("../controller/otpController")
const {otpVerifySchema,  validateSchema} = require("../middleware/validation");
otpRoute.post('/createOtp',createOtp);
otpRoute.post('/verifyOtp',validateSchema(otpVerifySchema),verifyOtp);
otpRoute.post('/resendOtp',resendOtp)
otpRoute.post('/resetPassword',resetPassword)
module.exports = otpRoute;