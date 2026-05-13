const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = 'admin@mec.com';
    const password = process.env.DEMO_PASSWORD || 'mec_v2_p4ssw0rd_9872!#';
    
    const user = await User.findOne({ email });
    if (user) {
      user.password = password;
      await user.save();
      console.log(`✅ Reset password for ${email} to: ${password}`);
    } else {
      console.log(`❌ User ${email} not found.`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

resetAdmin();
