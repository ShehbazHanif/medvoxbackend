const {z} = require('zod');
const otpSchema = z.object({
    email:z.string()
})