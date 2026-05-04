const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = 'marutieducation64@gmail.com';
    const password = 'marutieducation64@gmail.com';

    await User.deleteMany({ email: /marutieducation64@gmail.com/i });

    const user = await User.create({
      firstName: 'Maruti',
      lastName: 'Education',
      email: email,
      password: password,
      role: 'admin',
      profileCompleted: true
    });

    console.log('✅ Admin user RESET successfully:');
    console.log('Email:', user.email);

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

resetAdmin();
