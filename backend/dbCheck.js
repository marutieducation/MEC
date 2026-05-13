const mongoose = require('mongoose');
const User = require('./models/User');
const University = require('./models/University');
const Application = require('./models/Application');
const dotenv = require('dotenv');

dotenv.config();

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('--- DATABASE STATUS ---');
    console.log('Universities:', await University.countDocuments());
    console.log('Students:', await User.countDocuments({ role: 'student' }));
    console.log('Partners:', await User.countDocuments({ role: 'university_partner' }));
    console.log('Admins:', await User.countDocuments({ role: 'admin' }));
    console.log('Applications:', await Application.countDocuments());
    
    const sampleStudents = await User.find({ role: 'student' }).limit(5).select('email firstName');
    console.log('Sample Students:', sampleStudents);
    
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

check();
