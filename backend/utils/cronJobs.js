const cron = require('node-cron');
const Application = require('../models/Application');
const { sendEmail } = require('./emailService');


const initCronJobs = () => {

  cron.schedule('0 10 * * *', async () => {
    console.log('Running daily "Missing Documents" reminder job...');

    try {
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);


      const stagnantApps = await Application.find({
        status: 'action_required',
        updatedAt: { $lt: fortyEightHoursAgo }
      }).populate('student', 'firstName email');

      console.log(`Found ${stagnantApps.length} applications requiring reminders.`);

      for (const app of stagnantApps) {
        if (app.student && app.student.email) {
          sendEmail({
            to: app.student.email,
            subject: 'Action Required: Complete your Application',
            html: `
              <h2>Hello ${app.student.firstName},</h2>
              <p>Your application for <strong>${app.course}</strong> is currently on hold because some documents are missing.</p>
              <p>Please log in to your MEC dashboard and upload the required files to avoid delays in your processing.</p>
              <p><strong>Missing Items:</strong> ${app.missingDocuments.join(', ') || 'Pending verification'}</p>
              <br/>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/student/applications"
                 style="background: #FF6B00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                 Complete Application
              </a>
            `
          }).catch(err => console.error(`Failed to send reminder to ${app.student.email}:`, err));
        }
      }
    } catch (err) {
      console.error('Cron Job Error:', err);
    }
  });

  console.log('Background cron jobs successfully initialized.');
};

module.exports = { initCronJobs };
