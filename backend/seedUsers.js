const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedDemoUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding users.');


     const adminExists = await User.findOne({ email: 'admin@mec.com' });
     if (!adminExists) {
       await User.create({
         firstName: 'System',
         lastName: 'Admin',
         email: 'admin@mec.com',
         password: process.env.DEMO_PASSWORD || 'M3c@2024!Secure',
         role: 'admin',
         profileCompleted: true
       });
       console.log('✅ Admin user created: admin@mec.com / ' + (process.env.DEMO_PASSWORD || 'M3c@2024!Secure'));
    } else {
      console.log('ℹ️ Admin user already exists: admin@mec.com');
    }


     const partnerExists = await User.findOne({ email: 'partner@university.com' });
     if (!partnerExists) {
       await User.create({
         firstName: 'University',
         lastName: 'Partner',
         email: 'partner@university.com',
         password: process.env.DEMO_PASSWORD || 'M3c@2024!Secure',
         role: 'university_partner',
         profileCompleted: true
       });
       console.log('✅ Partner user created: partner@university.com / ' + (process.env.DEMO_PASSWORD || 'M3c@2024!Secure'));
    } else {
      console.log('ℹ️ Partner user already exists: partner@university.com');
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedDemoUsers();
