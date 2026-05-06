const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const generateToken = require('./utils/generateToken');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.log('No admin found');
    process.exit(1);
  }
  const token = generateToken(admin._id);
  console.log('Got token:', token);
  
  const http = require('http');

  const data = JSON.stringify({
    name: 'Test Uni ' + Date.now(),
    location: 'Test Location',
    country: 'India',
    logo: '',
    description: 'Test',
    courses: [{ name: 'Test Course', fee: '10', duration: '2', intake: 'Fall', degreeLevel: 'masters' }]
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/universities',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': 'Bearer ' + token
    }
  };

  const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    let result = '';
    res.on('data', d => {
      result += d;
    });
    res.on('end', () => {
      console.log('Result:', result);
      process.exit(0);
    });
  });

  req.on('error', error => {
    console.error('Error:', error);
    process.exit(1);
  });

  req.write(data);
  req.end();
});
