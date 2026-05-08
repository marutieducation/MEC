const mongoose = require('mongoose');
const University = require('../models/University');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const testValidation = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const { createUniversity } = require('../controllers/universityController');
    
    const mockRes = {
      statusCode: 200,
      status: function(code) { this.statusCode = code; return this; },
      json: function(data) { this.data = data; return this; }
    };

    console.log('--- Test 1: Empty string partnerUser ---');
    await createUniversity({
      body: {
        name: `Test Univ ${Date.now()}`,
        location: 'Test Location',
        partnerUser: ""
      }
    }, mockRes);

    if (mockRes.data && mockRes.data.success) {
      console.log('✅ Success! partnerUser:', mockRes.data.data.partnerUser);
    } else {
      console.log('❌ Failed:', mockRes.data ? mockRes.data.message : 'Unknown error');
    }

    console.log('\n--- Test 2: Invalid partnerUser ID ---');
    await createUniversity({
      body: {
        name: `Test Univ Invalid ${Date.now()}`,
        location: 'Test Location',
        partnerUser: "invalid-id"
      }
    }, mockRes);

    if (mockRes.statusCode === 400) {
      console.log('✅ Correctly rejected invalid ID with 400');
    } else {
      console.log('❌ Failed: Expected 400 but got', mockRes.statusCode, mockRes.data);
    }

    console.log('\n--- Test 3: Null partnerUser ---');
    await createUniversity({
      body: {
        name: `Test Univ Null ${Date.now()}`,
        location: 'Test Location',
        partnerUser: null
      }
    }, mockRes);

    if (mockRes.data && mockRes.data.success) {
      console.log('✅ Success! partnerUser:', mockRes.data.data.partnerUser);
    } else {
      console.log('❌ Failed:', mockRes.data ? mockRes.data.message : 'Unknown error');
    }

    // Cleanup
    console.log('\nCleaning up test data...');
    await University.deleteMany({ name: /Test Univ/ });
    console.log('Done.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Test Script Error:', err);
    process.exit(1);
  }
};

testValidation();
