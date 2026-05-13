const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const University = require('./models/University');
const Application = require('./models/Application');
const Document = require('./models/Document');
const Counsellor = require('./models/Counsellor');
const Invoice = require('./models/Invoice');
const Escalation = require('./models/Escalation');
const ConsentLog = require('./models/ConsentLog');
const VerificationCode = require('./models/VerificationCode');
const Payment = require('./models/Payment');
const Booking = require('./models/Booking');
const Scholarship = require('./models/Scholarship');
const Interview = require('./models/Interview');
const LoginAttempt = require('./models/LoginAttempt');

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🗑️  Cleaning up all test data...\n');

    // Delete all test data from all collections
    const results = await Promise.all([
      User.deleteMany({}),
      University.deleteMany({}),
      Application.deleteMany({}),
      Document.deleteMany({}),
      Counsellor.deleteMany({}),
      Invoice.deleteMany({}),
      Escalation.deleteMany({}),
      ConsentLog.deleteMany({}),
      VerificationCode.deleteMany({}),
      Payment.deleteMany({}),
      Booking.deleteMany({}),
      Scholarship.deleteMany({}),
      Interview.deleteMany({}),
      LoginAttempt.deleteMany({}),
    ]);

    console.log('✅ Deleted all data:');
    console.log(`   - Users: ${results[0].deletedCount}`);
    console.log(`   - Universities: ${results[1].deletedCount}`);
    console.log(`   - Applications: ${results[2].deletedCount}`);
    console.log(`   - Documents: ${results[3].deletedCount}`);
    console.log(`   - Counsellors: ${results[4].deletedCount}`);
    console.log(`   - Invoices: ${results[5].deletedCount}`);
    console.log(`   - Escalations: ${results[6].deletedCount}`);
    console.log(`   - Consent Logs: ${results[7].deletedCount}`);
    console.log(`   - Verification Codes: ${results[8].deletedCount}`);
    console.log(`   - Payments: ${results[9].deletedCount}`);
    console.log(`   - Bookings: ${results[10].deletedCount}`);
    console.log(`   - Scholarships: ${results[11].deletedCount}`);
    console.log(`   - Interviews: ${results[12].deletedCount}`);
    console.log(`   - Login Attempts: ${results[13].deletedCount}`);

    console.log('\n✅ Database is now clean and ready for real data!');
    console.log('\n⚠️  IMPORTANT: You will need to create a new admin account using the verification code.');
    console.log('   Run: npm run seed (if you want to re-seed with default admin)');
    console.log('   Or: Register a new admin using the admin registration flow.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  cleanup();
} else {
  console.log('Cleanup file imported. Run directly to clean database.');
}
