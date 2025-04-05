const nodemailer = require('nodemailer');
// require('dotenv').config();

const mailSender = async (to, subject, message, senderName = 'CartVit Support') => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: {
                user: '5311f7001@smtp-brevo.com',
                pass: 'qQ7G95FYbyz6OHUZ'
            }
        });

        const mailOptions = {
            from: `${senderName} <support@themailpanel.com>`, // Include dynamic sender name
            to,
            subject,
            html: message
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info);
        return info;
    } catch (error) {
        console.error('Error sending email:', error.message);
    }
};

module.exports = mailSender;
