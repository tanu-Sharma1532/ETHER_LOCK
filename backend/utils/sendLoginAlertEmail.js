const mailSender = require('./sendLoginAlertEmail'); // Import the mailSender function

// ✅ Function to send a login alert email
const sendLoginAlertEmail = async (email, ipAddress) => {
    const subject = "⚠️ Security Alert: Unauthorized Login Attempt";
    const message = `
        <h3>Security Alert 🚨</h3>
        <p>Someone is trying to log into your account from <strong>IP: ${ipAddress}</strong>.</p>
        <p>If this was not you, please secure your account immediately.</p>
        <br>
        <p>Best Regards,<br>Support Team</p>
    `;

    try {
        const info = await mailSender(email, subject, message);
        console.log("🚀 Alert email sent successfully:", info);
    } catch (error) {
        console.error("❌ Error sending email:", error.message);
    }
};

module.exports = sendLoginAlertEmail;
