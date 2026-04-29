const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (process.env.EMAIL_USER === 'your_email@gmail.com' || !process.env.EMAIL_USER) {
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
