const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = 'marutieducation64@gmail.com';
    const password = 'marutieducation64@gmail.com';

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found in DB');
      return;
    }

    const isMatch = await user.matchPassword(password);
    console.log(`Email: ${user.email}`);
    console.log(`Password in DB: ${user.password}`);
    console.log(`Match Result: ${isMatch}`);

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

testLogin();
