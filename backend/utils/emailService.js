const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const emailConfigured = process.env.EMAIL_USER
      && process.env.EMAIL_USER !== 'your_email@gmail.com'
      && process.env.EMAIL_PASS;

    if (!emailConfigured) {
      if (process.env.NODE_ENV === 'production') {
        console.error('Email service is not configured.');
        return null;
      }

      console.log(`\n================= MOCK EMAIL =================`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${html}`);
      console.log(`==============================================\n`);
      return { messageId: 'mock-id-12345' };
    }

    const info = await transporter.sendMail({
      from: `"MEC UAFMS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`);

    return null;
  }
};

module.exports = { sendEmail };
