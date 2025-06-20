// helper/mailing.js
const axios = require('axios');

const sendMail = async (email, subject, content) => {
    const apiUrl = 'https://srv694651.hstgr.cloud/n8n/webhook/otp-service';
    
    // Basic Auth credentials
    const username = 'devteam';
    const password = 'Ayzenn@devteam';
    const authToken = Buffer.from(`${username}:${password}`).toString('base64');
    
    const requestBody = {
        receiver: email,
        text: subject, // Using subject as text
        html: content
    };
    
    try {
        const response = await axios.post(apiUrl, requestBody, {
            headers: {
                'Authorization': `Basic ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log("Email sent successfully", response.data);
        
        // Return a structure similar to nodemailer's response
        return {
            accepted: [email], // Simulate accepted array for compatibility
            response: response.data,
            messageId: response.data.messageId || 'custom-smtp-' + Date.now()
        };
        
    } catch (error) {
        console.log("Error sending email:", error.response?.data || error.message);
        return {
            accepted: [], // Empty array indicates failure
            rejected: [email],
            error: error.response?.data || error.message
        };
    }
};

module.exports = sendMail;