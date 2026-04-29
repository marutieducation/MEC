const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const Application = require('./backend/models/Application');
const University = require('./backend/models/University');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);

  const apps = await Application.find();
  console.log("Apps count:", apps.length);
  for (let app of apps) {
    console.log(`App ${app._id} - University ID: ${app.university}`);
    const uni = await University.findById(app.university);
    console.log(`University found? ${!!uni}`);
  }

  const unis = await University.find();
  console.log("Unis count:", unis.length);
  if (unis.length > 0) {
    console.log("First uni ID:", unis[0]._id);
  }

  process.exit();
}

test();
