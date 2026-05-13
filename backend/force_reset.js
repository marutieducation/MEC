const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const forceReset = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = 'marutieducation64@gmail.com';
    const plainPassword = 'marutieducation64@gmail.com';

    // Delete existing
    await User.deleteMany({ email: /marutieducation64@gmail.com/i });

    // Hash manually
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // Create with pre-hashed password
    const user = new User({
      firstName: 'Maruti',
      lastName: 'Education',
      email: email,
      password: hashedPassword,
      role: 'admin',
      profileCompleted: true
    });

    // Save (pre-save hook should skip hashing because it starts with $2 and is 60 chars)
    await user.save();

    console.log('✅ FORCED Reset successfully');
    console.log('Email:', user.email);
    console.log('New Hash:', user.password);

    // Verify immediately
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    console.log('Immediate Verification Match:', isMatch);

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

forceReset();
