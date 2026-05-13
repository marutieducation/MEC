const nodemailer = require('nodemailer');

// Email service configuration with multiple providers
const getEmailTransporter = () => {
  const emailProvider = process.env.EMAIL_PROVIDER || 'smtp';
  
  switch (emailProvider) {
    case 'sendgrid':
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: process.env.SENDGRID_USER || 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
    
    case 'ses':
      return nodemailer.createTransport({
        host: process.env.SES_HOST || 'email-smtp.us-east-1.amazonaws.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.SES_ACCESS_KEY_ID,
          pass: process.env.SES_SECRET_ACCESS_KEY
        }
      });
    
    case 'mailgun':
      return nodemailer.createTransport({
        host: process.env.MAILGUN_HOST || 'smtp.mailgun.org',
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAILGUN_USER,
          pass: process.env.MAILGUN_PASS
        }
      });
    
    case 'postmark':
      return nodemailer.createTransport({
        host: 'smtp.postmarkapp.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.POSTMARK_TOKEN,
          pass: process.env.POSTMARK_TOKEN
        }
      });
    
    default: // SMTP/Gmail
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production',
          minVersion: 'TLSv1.2'
        },
        pool: true, // Use connection pooling
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000, // Rate limiting
        rateLimit: 5 // Max 5 emails per second
      });
  }
};

const transporter = getEmailTransporter();

// Email queue for managing bulk emails
const emailQueue = [];
let isProcessingQueue = false;

const processEmailQueue = async () => {
  if (isProcessingQueue || emailQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (emailQueue.length > 0) {
    const email = emailQueue.shift();
    try {
      await sendEmailImmediate(email);
      console.log(`Email sent successfully to ${email.to}`);
    } catch (error) {
      console.error(`Failed to send email to ${email.to}:`, error);
      // Retry logic for failed emails
      if (email.retryCount < 3) {
        email.retryCount = (email.retryCount || 0) + 1;
        emailQueue.push(email); // Add back to queue for retry
        await new Promise(resolve => setTimeout(resolve, 5000 * email.retryCount)); // Wait before retry
      }
    }
  }
  
  isProcessingQueue = false;
};

const sendEmailImmediate = async ({ to, subject, html, priority = 'normal' }) => {
  const emailConfigured = isEmailConfigured();

  if (!emailConfigured) {
    if (process.env.NODE_ENV === 'production') {
      // Log but do NOT throw — missing email config must not break production endpoints
      console.warn(`[EMAIL] ⚠️ Email service not configured. Skipping email to ${to}: "${subject}"`);
      return { skipped: true, reason: 'email_not_configured', to, subject };
    }

    console.log(`\n================= MOCK EMAIL =================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Priority: ${priority}`);
    console.log(`HTML: ${html.substring(0, 100)}...`);
    console.log(`================================================\n`);
    return { mock: true, to, subject, priority };
  }

  const mailOptions = {
    from: `"MEC UAFMS" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
    priority: priority === 'high' ? 'high' : 'normal',
    headers: {
      'X-Priority': priority === 'high' ? '1' : '3',
      'X-MSMail-Priority': priority === 'high' ? 'High' : 'Normal'
    }
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to} - Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Email send error for ${to}:`, error);
    throw error;
  }
};

const isEmailConfigured = () => {
  const provider = process.env.EMAIL_PROVIDER || 'smtp';
  
  switch (provider) {
    case 'sendgrid':
      return !!(process.env.SENDGRID_API_KEY);
    case 'ses':
      return !!(process.env.SES_ACCESS_KEY_ID && process.env.SES_SECRET_ACCESS_KEY);
    case 'mailgun':
      return !!(process.env.MAILGUN_USER && process.env.MAILGUN_PASS);
    case 'postmark':
      return !!(process.env.POSTMARK_TOKEN);
    default: // SMTP
      return !!(process.env.EMAIL_USER && 
               process.env.EMAIL_PASS && 
               process.env.EMAIL_USER !== 'your_email@gmail.com');
  }
};

const sendEmail = async ({ to, subject, html, priority = 'normal', queue = false }) => {
  try {
    if (queue && priority !== 'high') {
      // Add to queue for bulk processing
      emailQueue.push({ to, subject, html, priority, retryCount: 0 });
      processEmailQueue(); // Start processing queue if not already running
      return { queued: true, to, subject };
    } else {
      // Send immediately
      return await sendEmailImmediate({ to, subject, html, priority });
    }
  } catch (error) {
    console.error('Email service error:', error);
    
    // In production, don't throw errors to prevent breaking the application
    if (process.env.NODE_ENV === 'production') {
      console.error(`Email failed to send to ${to}: ${error.message}`);
      return { error: true, message: error.message, to, subject };
    } else {
      throw error;
    }
  }
};

// Send bulk emails
const sendBulkEmail = async (emails) => {
  const results = [];
  
  for (const email of emails) {
    try {
      const result = await sendEmail({ ...email, queue: true });
      results.push({ success: true, to: email.to, result });
    } catch (error) {
      results.push({ success: false, to: email.to, error: error.message });
    }
  }
  
  return results;
};

// Verify email configuration
const verifyEmailConfiguration = async () => {
  try {
    if (!isEmailConfigured()) {
      return { configured: false, error: 'Email service is not configured' };
    }
    
    await transporter.verify();
    return { configured: true, message: 'Email service is working correctly' };
  } catch (error) {
    return { configured: false, error: error.message };
  }
};

module.exports = { sendEmail, sendBulkEmail, verifyEmailConfiguration };
