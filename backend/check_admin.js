const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const adminCount = await User.countDocuments({ role: 'admin' });
    console.log('Admin count:', adminCount);
    
    const admins = await User.find({ role: 'admin' });
    console.log('Admins:', admins.map(u => ({ email: u.email, role: u.role })));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkAdmin();
