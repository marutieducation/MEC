const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });


const User = require('./models/User');
const University = require('./models/University');
const Application = require('./models/Application');
const Document = require('./models/Document');
const Counsellor = require('./models/Counsellor');
const Invoice = require('./models/Invoice');
const Escalation = require('./models/Escalation');
const ConsentLog = require('./models/ConsentLog');
const VerificationCode = require('./models/VerificationCode');

function getLevel(courseName) {
  if (courseName.toUpperCase().includes('MBA')) return 'mba';
  if (courseName.includes('PG') || courseName.includes('M.Tech')) return 'masters';
  if (courseName.includes('Ph.D')) return 'phd';
  if (courseName.includes('Diploma')) return 'diploma';
  return 'bachelors';
}

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');


    await Promise.all([
      User.deleteMany({}),
      University.deleteMany({}),
      Application.deleteMany({}),
      Document.deleteMany({}),
      Counsellor.deleteMany({}),
      Invoice.deleteMany({}),
      Escalation.deleteMany({}),
      ConsentLog.deleteMany({}),
      VerificationCode.deleteMany({}),
    ]);
    console.log('🗑️  Cleared all collections');



    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'MEC',
      email: 'admin@mec.com',
      password: process.env.DEMO_PASSWORD || 'M3c@2024!Secure',
      role: 'admin',
      phone: '9999999999',
      twoFactorEnabled: true,
    });

    console.log('👤 Created default admin user');

    await User.create({
      firstName: 'Demo',
      lastName: 'Student',
      email: 'student@mec.com',
      password: 'Student@123',
      role: 'student',
      phone: '8888888888',
      profileCompleted: true,
    });
    console.log('👤 Created default student user');

    // Create a demo partner user (will be linked after universities are created)
    const partnerPassword = process.env.DEMO_PASSWORD || 'MecV2p4ssw0rd9872!';
    const partner = await User.create({
      firstName: 'University',
      lastName: 'Partner',
      email: 'partner@university.com',
      password: partnerPassword,
      role: 'university_partner',
      phone: '7777777777',
      profileCompleted: true,
    });
    console.log('👤 Created default partner user');



    const collegeData = {
      'Sinhgad Institutes': { loc: 'Pune, Maharashtra', courses: ['Engineering', 'Management', 'Pharmacy', 'Computer Science', 'Polytechnic', 'Architecture', 'MCA', 'MBA'], domain: 'sinhgad.edu' },
      'Mahindra University': { loc: 'Hyderabad, Telangana', courses: ['Engineering', 'Management', 'Law', 'Digital Media', 'Design', 'Innovation Programs'], domain: 'mahindrauniversity.edu.in' },
      'Karnavati University': { loc: 'Gandhinagar, Gujarat', courses: ['Design', 'Law', 'Management', 'Liberal Arts', 'Commerce', 'Computer Applications'], domain: 'karnavatiuniversity.edu.in' },
      'ICFAI University Jaipur': { loc: 'Jaipur, Rajasthan', courses: ['BBA', 'B.Com', 'BA', 'BCA', 'B.Tech', 'B.Sc', 'BA LLB', 'BBA LLB', 'LLB', 'B.Pharm', 'MBA', 'MCA', 'M.Tech', 'M.Sc', 'Ph.D'], domain: 'iujaipur.edu.in' },
      'Swarrnim Startup & Innovation': { loc: 'Gandhinagar, Gujarat', courses: ['Engineering', 'Management', 'Pharmacy', 'Agriculture', 'Design', 'Computer Science', 'Paramedical', 'Law'], domain: 'swarrnim.edu.in' },
      'Amity University': { loc: 'Noida, UP', courses: ['BBA', 'MBA', 'B.Tech', 'BCA', 'Law', 'Journalism', 'Psychology', 'Design'], domain: 'amity.edu' },
      'Symbiosis Institute of Tech': { loc: 'Pune, Maharashtra', courses: ['B.Tech Computer Science', 'Artificial Intelligence', 'Machine Learning', 'Cloud Computing', 'Data Analytics'], domain: 'sitpune.edu.in' },
      'ICFAI Foundation': { loc: 'Hyderabad, Telangana', courses: ['B.Tech', 'B.Arch', 'BBA', 'BCA', 'Law', 'MBA', 'MCA'], domain: 'ifheindia.org' },
      'Jaipur National University': { loc: 'Jaipur, Rajasthan', courses: ['Arts', 'Commerce', 'Engineering', 'Management', 'Hotel Management', 'Nursing', 'Pharmacy', 'Media', 'Fine Arts'], domain: 'jnujaipur.ac.in' },
      'Ramaiah University': { loc: 'Bengaluru, Karnataka', courses: ['Engineering', 'Dental', 'Pharmacy', 'Management', 'Design', 'Hospitality', 'Aviation'], domain: 'msruas.ac.in' },
      'Sri Balaji University': { loc: 'Pune, Maharashtra', courses: ['MBA', 'PGDM', 'Management', 'Marketing', 'HR', 'Finance', 'International Business'], domain: 'sbup.edu.in' },
      'Asia Pacific Institute': { loc: 'New Delhi', courses: ['MBA', 'BBA', 'PGDM', 'Business Analytics', 'Finance', 'Marketing'], domain: 'asiapacific.edu' },
      'Pandit Deendayal Energy Univ': { loc: 'Gandhinagar, Gujarat', courses: ['Liberal Studies', 'BA', 'B.Sc', 'MA', 'Public Policy', 'International Relations', 'Psychology'], domain: 'pdpu.ac.in' },
      'Symbiosis International Dubai': { loc: 'Dubai, UAE', courses: ['Psychology', 'Counseling', 'Management', 'Business Administration'], domain: 'symbiosis.ae' },
      'Indus University': { loc: 'Ahmedabad, Gujarat', courses: ['Ph.D', 'Management', 'Science', 'English', 'Computer Applications', 'Engineering', 'Cyber Security'], domain: 'indusuni.ac.in' },
      'SRM University': { loc: 'Chennai, Tamil Nadu', courses: ['BBA', 'B.Com', 'BA', 'BCA', 'B.Tech', 'B.Sc', 'Law', 'MBA', 'MCA', 'M.Tech', 'M.Sc', 'Diploma', 'Ph.D'], domain: 'srmist.edu.in' },
      'Sinhgad Management': { loc: 'Pune, Maharashtra', courses: ['MBA', 'PGDM', 'Management', 'HR', 'Marketing', 'Finance'], domain: 'sinhgad.edu' },
      'SKIPS University': { loc: 'Ahmedabad, Gujarat', courses: ['BBA', 'MBA', 'BCA', 'Commerce', 'IT', 'E-Gaming'], domain: 'skips.in' },
      'GLS University': { loc: 'Ahmedabad, Gujarat', courses: ['BBA', 'MBA', 'Law', 'Commerce', 'Design', 'Computer Applications', 'Media'], domain: 'glsuniversity.ac.in' },
      'Alliance University': { loc: 'Bengaluru, Karnataka', courses: ['Engineering', 'Management', 'Law', 'Commerce', 'Liberal Arts'], domain: 'alliance.edu.in' },
      'Manipal Academy': { loc: 'Manipal, Karnataka', courses: ['Engineering', 'Medicine', 'Management', 'Design', 'Hotel Management', 'Media', 'Computer Applications'], domain: 'manipal.edu' },
      'MIT World Peace University': { loc: 'Pune, Maharashtra', courses: ['Engineering', 'Management', 'Law', 'Design'], domain: 'mitwpu.edu.in' },
      'Parul University': { loc: 'Vadodara, Gujarat', courses: ['Engineering', 'Management', 'Medical', 'Law'], domain: 'paruluniversity.ac.in' },
      'Broadway Overseas Education': { loc: 'Ahmedabad, Gujarat', courses: ['Overseas Education', 'IELTS', 'Visa Services'], domain: 'broadwayoverseas.com' },
      'Symbiosis School for Liberal Arts': { loc: 'Pune, Maharashtra', courses: ['Liberal Arts', 'Humanities', 'Social Sciences'], domain: 'ssla.edu.in' },
      'Ahmedabad Institute of Management': { loc: 'Ahmedabad, Gujarat', courses: ['MBA', 'PGDM', 'BBA'], domain: 'aimahmedabad.org' },
      'Sikkim University': { loc: 'Gangtok, Sikkim', courses: ['B.A', 'B.Sc', 'M.A', 'M.Sc', 'Ph.D'], domain: 'cus.ac.in' },
      'Asian International University': { loc: 'Imphal, Manipur', courses: ['B.Tech', 'MBA', 'BBA', 'BCA', 'Law'], domain: 'aiu.edu.in' },
      'Silver Oak University': { loc: 'Ahmedabad, Gujarat', courses: ['Engineering', 'Management', 'Design', 'Computer Science'], domain: 'silveroak.uni.ac.in' },
      'Gandhinagar University': { loc: 'Gandhinagar, Gujarat', courses: ['Engineering', 'MBA', 'BBA', 'BCA'], domain: 'gandhinagaruniversity.ac.in' },
      'Shreyarth University': { loc: 'Ahmedabad, Gujarat', courses: ['B.A', 'B.Com', 'M.A', 'M.Com'], domain: 'shreyarthuniversity.ac.in' },
      'Institute of Company Secretaries': { loc: 'New Delhi', courses: ['CS Foundation', 'CS Executive', 'CS Professional'], domain: 'icsi.edu' }
    };

    const parsedUniversities = Object.entries(collegeData).map(([name, data], idx) => {
      const coursesMap = data.courses.map(courseName => ({
        name: courseName,
        degreeLevel: getLevel(courseName),
        duration: getLevel(courseName) === 'masters' || getLevel(courseName) === 'mba' ? "2 Years" : "3-4 Years",
        intake: "Fall 2024",
        fee: "₹" + (Math.floor(Math.random() * 20) + 5) + ",00,000",
        matchScore: Math.floor(Math.random() * 25) + 75,
        requirements: ["High School / Bachelors", "Entrance Exam Based"]
      }));

      return {
        name,
        location: data.loc,
        description: "A premier institution known for excellence in education and holistic development.",
        logo: '',
        officialDomain: data.domain,
        courses: coursesMap
      };
    });

    const universities = await University.insertMany(parsedUniversities);
    console.log(`🎓 Created ${universities.length} Universities`);

    // Link the partner user to Alliance University
    const allianceUni = universities.find(u => u.name === 'Alliance University');
    if (allianceUni && partner) {
      await University.findByIdAndUpdate(allianceUni._id, { partnerUser: partner._id });
      await User.findByIdAndUpdate(partner._id, { universityId: allianceUni._id });
      console.log(`🔗 Linked ${partner.email} to ${allianceUni.name}`);

      // Create a few mock applications for this university so the dashboard isn't empty
      const demoStudent = await User.findOne({ role: 'student' });
      if (demoStudent) {
        await Application.create([
          {
            student: demoStudent._id,
            university: allianceUni._id,
            course: 'MBA',
            status: 'submitted',
            pipelineStage: 'review',
            currentStep: 1,
            academics: { institution: 'Demo College', degree: 'BBA', cgpa: '8.5', passingYear: '2023' }
          },
          {
            student: demoStudent._id,
            university: allianceUni._id,
            course: 'Engineering',
            status: 'under_review',
            pipelineStage: 'review',
            currentStep: 2,
            academics: { institution: 'Demo School', degree: 'HSC', cgpa: '9.0', passingYear: '2022' }
          }
        ]);
        console.log('📝 Created mock applications for the partner portal');
      }
    }

    await VerificationCode.create({
      code: 'MEC-ADMIN-2024',
      type: 'admin_registration',
      createdBy: admin._id,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });

    await VerificationCode.create({
      code: 'MEC-PARTNER-2024',
      type: 'university_partner',
      createdBy: admin._id,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });

    console.log('🔑 Created Master Invite Codes: MEC-ADMIN-2024, MEC-PARTNER-2024');

    console.log('\n✅ Production Database initialized successfully!');
    console.log('\n📌 Important credentials:');
    console.log('   Admin:    admin@mec.com / ' + (process.env.DEMO_PASSWORD || 'M3c@2024!Secure') + ' (2FA enabled)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seed();
} else {
  console.log('Seed file imported. Run directly to seed database.');
}
