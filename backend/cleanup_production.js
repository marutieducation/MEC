const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const User = require('./models/User');
const University = require('./models/University');
const Application = require('./models/Application');
const Document = require('./models/Document');
const Notification = require('./models/Notification');
const Counsellor = require('./models/Counsellor');
const VerificationCode = require('./models/VerificationCode');

const cleanup = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI not found in environment');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Delete all Applications, Documents, Notifications, Counsellors
    await Application.deleteMany({});
    await Document.deleteMany({});
    await Notification.deleteMany({});
    await Counsellor.deleteMany({});
    console.log('🗑️  Cleared Applications, Documents, Notifications, and Counsellors');

    // 2. Delete all Users EXCEPT the master admin
    const deleteUsersResult = await User.deleteMany({ email: { $ne: 'admin@mec.com' } });
    console.log(`🗑️  Deleted ${deleteUsersResult.deletedCount} users. Kept admin@mec.com`);

    // 3. Reset all Universities: remove partner links and reset stats
    // We keep the universities themselves as they are the 27-32 partners
    await University.updateMany({}, {
      partnerUser: null,
      ytdEnrolled: 0,
      pendingAction: 0
    });
    console.log('🔄 Reset University partner links and stats');

    // 4. Ensure master invite codes exist
    await VerificationCode.deleteMany({});
    await VerificationCode.create([
      {
        code: 'MEC-ADMIN-2024',
        type: 'admin_registration',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        code: 'MEC-PARTNER-2024',
        type: 'university_partner',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log('🔑 Re-created Master Invite Codes: MEC-ADMIN-2024, MEC-PARTNER-2024');

    console.log('\n✅ Production Cleanup Completed Successfully!');
    console.log('📌 Admin account (admin@mec.com) is the only user remaining.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  }
};

cleanup();
