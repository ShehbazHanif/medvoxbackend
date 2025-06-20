const sendMail = require('../helper/mailingService');

const sendInvitationEmail = async (memberEmail, name, inviterName, relation) => {
    try {
        const subject = 'Invitation to Join Our App';
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #4CAF50; text-align: center;">You're Invited!</h2>
                <p>Hello ${name},</p>
                <p><strong>${inviterName}</strong> wants to add you as their family member (${relation}) on our app.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>To accept this invitation:</strong></p>
                    <ol>
                        <li>Download and install our app</li>
                        <li>Create an account using this email address: <strong>${memberEmail}</strong></li>
                        <li>Once registered, you'll automatically be connected as family members</li>
                    </ol>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="[YOUR_APP_DOWNLOAD_LINK]" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Download App</a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    <strong>Note:</strong> This invitation is specifically for the email address ${memberEmail}. Please use this exact email when creating your account.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #888; font-size: 12px; text-align: center;">If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
        `;

        // Send email using the mailing service (this will call your n8n webhook)
        const emailResult = await sendMail(memberEmail, subject, htmlContent);

        if (emailResult.accepted && emailResult.accepted.length > 0) {
            return {
                success: true,
                result: emailResult
            };
        } else {
            return {
                success: false,
                error: emailResult.error || 'Failed to send email'
            };
        }

    } catch (error) {
        console.error('Error sending invitation email:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    sendInvitationEmail
};
