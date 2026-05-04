const mongoose = require('mongoose');
const University = require('./models/University');
require('dotenv').config();

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');


    const result = await University.deleteMany({ country: { $ne: 'India' } });
    console.log(`Deleted ${result.deletedCount} foreign universities`);

    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

cleanup();
