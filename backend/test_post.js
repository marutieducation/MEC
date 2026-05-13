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
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error('Error:', error);
});

req.write(data);
req.end();
