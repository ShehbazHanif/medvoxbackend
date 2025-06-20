const sendSMSTwilio = async (phoneNumber, message) => {
    try {
        const twilio = require('twilio');
        
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
        
        if (!accountSid || !authToken || !twilioPhone) {
            throw new Error('Twilio credentials not configured');
        }
        
        const client = twilio(accountSid, authToken);
        
        const result = await client.messages.create({
            body: message,
            from: twilioPhone,
            to: phoneNumber
        });
        
        return {
            success: true,
            messageId: result.sid,
            status: result.status
        };
        
    } catch (error) {
        console.error('Twilio SMS Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};