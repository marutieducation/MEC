const mongoose = require('mongoose');
const University = require('./models/University');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const universities = [

  {
    name: 'IIT Bombay',
    location: 'Mumbai, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech in Computer Science', fee: '₹2.5L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' },
      { name: 'B.Tech in Aerospace Engineering', fee: '₹2.5L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'COEP Technological University',
    location: 'Pune, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech in IT', fee: '₹1.0L/yr', duration: '4 Years', intake: 'Aug 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'ICT Mumbai',
    location: 'Mumbai, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech in Chemical Technology', fee: '₹0.8L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },


  {
    name: 'IISc Bangalore',
    location: 'Bangalore, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'Bachelor of Science (Research)', fee: '₹0.5L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' },
      { name: 'M.Tech in Artificial Intelligence', fee: '₹0.4L/yr', duration: '2 Years', intake: 'Aug 2024', degreeLevel: 'masters' }
    ]
  },
  {
    name: 'NIT Surathkal',
    location: 'Mangalore, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech in Computer Engineering', fee: '₹1.8L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },


  {
    name: 'IIT Delhi',
    location: 'New Delhi, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech in CS & Engineering', fee: '₹2.4L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Delhi Technological University (DTU)',
    location: 'Delhi, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech in Software Engineering', fee: '₹2.1L/yr', duration: '4 Years', intake: 'Aug 2024', degreeLevel: 'bachelors' }
    ]
  },


  {
    name: 'IIT Madras',
    location: 'Chennai, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech in Electrical Engineering', fee: '₹2.3L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' },
      { name: 'BS in Data Science (Online)', fee: '₹3.5L total', duration: '3-6 Years', intake: 'Varies', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'NIT Trichy',
    location: 'Tiruchirappalli, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.E. in Production Engineering', fee: '₹1.6L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },


  {
    name: 'IIIT Hyderabad',
    location: 'Hyderabad, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech in CS & Engineering', fee: '₹3.6L/yr', duration: '4 Years', intake: 'Aug 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'NIT Warangal',
    location: 'Warangal, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech in Mechanical Engineering', fee: '₹1.5L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },


  {
    name: 'IIT Kharagpur',
    location: 'Kharagpur, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech (Hons) in CS', fee: '₹2.2L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Jadavpur University',
    location: 'Kolkata, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.E. in IT', fee: '₹0.1L total', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    for (const uniData of universities) {
      const existing = await University.findOne({ name: uniData.name });
      if (!existing) {
        await University.create(uniData);
        console.log(`Created: ${uniData.name}`);
      } else {
        console.log(`Skipped (exists): ${uniData.name}`);
      }
    }

    console.log('National seeding complete');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
