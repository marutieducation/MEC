const mongoose = require('mongoose');
const Scholarship = require('./models/Scholarship');
require('dotenv').config();

const scholarships = [
  {
    name: 'Merit-cum-Means (MCM) Scholarship',
    provider: 'IIT Delhi',
    university: 'IIT Delhi',
    amount: '₹12,000/yr + Fee Waiver',
    deadline: 'Aug 15, 2024',
    match: 95,
    applyUrl: 'https://example.com/apply',
    category: 'merit',
    description: 'For UG students with family income up to 4.5L/yr.'
  },
  {
    name: 'Research Assistance (M.S./Ph.D.)',
    provider: 'IIT Delhi',
    university: 'IIT Delhi',
    amount: '₹1,80,000 - ₹2,88,000/yr',
    deadline: 'Oct 30, 2024',
    match: 88,
    applyUrl: 'https://example.com/apply',
    category: 'research',
    description: 'Monthly stipend for full-time research scholars.'
  },
  {
    name: 'Merit-cum-Means (MCM) Scholarship',
    provider: 'IIT Bombay',
    university: 'IIT Bombay',
    amount: '₹1,44,000/yr + Fee Waiver',
    deadline: 'Aug 15, 2024',
    match: 95,
    applyUrl: 'https://example.com/apply',
    category: 'merit',
    description: 'For UG students with annual parental income within set threshold.'
  },
  {
    name: 'SBI Platinum Jubilee Asha Scholarship',
    provider: 'SBI Foundation',
    university: 'General',
    amount: '₹2,00,000/yr',
    deadline: 'Dec 31, 2024',
    match: 85,
    applyUrl: 'https://example.com/apply',
    category: 'need',
    description: 'For meritorious students from low-income families in IITs.'
  },
  {
    name: 'INSPIRE Scholarship',
    provider: 'DST, Gov of India',
    university: 'General',
    amount: '₹80,000/yr',
    deadline: 'Oct 15, 2024',
    match: 92,
    applyUrl: 'https://example.com/apply',
    category: 'merit',
    description: 'For students in top 1% of board exams or top 10k in JEE AIR.'
  },
  {
    name: 'Singhal Scholarship (For Females)',
    provider: 'IIT Delhi',
    university: 'IIT Delhi',
    amount: '₹25,000/yr',
    deadline: 'Aug 30, 2024',
    match: 90,
    applyUrl: 'https://example.com/apply',
    category: 'female',
    description: 'Exclusively for first-year female students with family income < 8L.'
  }
];

async function seedScholarships() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');


    await Scholarship.deleteMany({});

    await Scholarship.insertMany(scholarships);
    console.log('Real-world scholarships seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedScholarships();
