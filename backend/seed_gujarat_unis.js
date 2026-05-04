const mongoose = require('mongoose');
const University = require('./models/University');
require('dotenv').config();

const universities = [
  {
    name: 'IIT Gandhinagar',
    location: 'Gandhinagar, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech in Computer Science', fee: '₹2.5L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' },
      { name: 'B.Tech in Electrical Engineering', fee: '₹2.5L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Nirma University',
    location: 'Ahmedabad, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech (CSE)', fee: '₹2.2L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' },
      { name: 'B.Tech (IT)', fee: '₹2.2L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'DA-IICT',
    location: 'Gandhinagar, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech (ICT)', fee: '₹2.0L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' },
      { name: 'B.Tech (ICT with Hons. in CS)', fee: '₹2.0L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Pandit Deendayal Energy University (PDEU)',
    location: 'Gandhinagar, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech in Petroleum Engineering', fee: '₹2.4L/yr', duration: '4 Years', intake: 'Aug 2024', degreeLevel: 'bachelors' },
      { name: 'B.Tech in Computer Engineering', fee: '₹2.4L/yr', duration: '4 Years', intake: 'Aug 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Dharmsinh Desai University (DDU)',
    location: 'Nadiad, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech in Computer Engineering', fee: '₹1.6L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' },
      { name: 'B.Tech in IT', fee: '₹1.6L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Charotar University of Science and Technology (CHARUSAT)',
    location: 'Changa, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech in CSE', fee: '₹1.4L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' },
      { name: 'B.Tech in IT', fee: '₹1.4L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'MS University of Baroda',
    location: 'Vadodara, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.E. in Computer Science & Engineering', fee: '₹0.5L/yr', duration: '4 Years', intake: 'Aug 2024', degreeLevel: 'bachelors' },
      { name: 'B.E. in Electrical Engineering', fee: '₹0.5L/yr', duration: '4 Years', intake: 'Aug 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Marwadi University',
    location: 'Rajkot, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech in CSE', fee: '₹1.8L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Ganpat University',
    location: 'Mehsana, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech in Computer Engineering', fee: '₹1.3L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Ahmedabad University',
    location: 'Ahmedabad, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech in Computer Science', fee: '₹3.5L/yr', duration: '4 Years', intake: 'Aug 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Parul University',
    location: 'Vadodara, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech in CSE', fee: '₹1.1L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Silver Oak University',
    location: 'Ahmedabad, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech in IT', fee: '₹0.8L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Indus University',
    location: 'Ahmedabad, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.Tech in Computer Engineering', fee: '₹1.0L/yr', duration: '4 Years', intake: 'July 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'L.D. College of Engineering',
    location: 'Ahmedabad, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.E. in Computer Science', fee: '₹1,500/yr', duration: '4 Years', intake: 'Aug 2024', degreeLevel: 'bachelors' }
    ]
  },
  {
    name: 'Vishwakarma Government Engineering College (VGEC)',
    location: 'Ahmedabad, India',
    country: 'India',
    logo: '',
    courses: [
      { name: 'B.E. in Information Technology', fee: '₹1,500/yr', duration: '4 Years', intake: 'Aug 2024', degreeLevel: 'bachelors' }
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

    console.log('Seeding complete');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
