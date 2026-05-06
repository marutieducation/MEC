const express = require('express');
const router = express.Router();
const { register, login, verify2FA, getMe, updateProfile, forgotPassword, linkUniversity } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const seedRouteGuard = (req, res, next) => {
  if (process.env.ENABLE_DEMO_SEEDING !== 'true') {
    return res.status(404).json({ message: 'Route not found' });
  }

  const seedSecret = process.env.SEED_ROUTE_SECRET;
  if (process.env.NODE_ENV === 'production' && !seedSecret) {
    return res.status(403).json({ message: 'Seed route secret is required in production' });
  }

  if (seedSecret && req.get('x-seed-secret') !== seedSecret) {
    return res.status(403).json({ message: 'Invalid seed route secret' });
  }

  next();
};

const getDemoPassword = () => {
  if (process.env.DEMO_PASSWORD) return process.env.DEMO_PASSWORD;
  return process.env.NODE_ENV === 'production' ? null : 'M3c@2024!Secure';
};

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-2fa', verify2FA);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/link-university', protect, linkUniversity);

router.post('/super-seed', seedRouteGuard, async (req, res) => {
  const User = require('../models/User');
  const University = require('../models/University');
  const bcrypt = require('bcryptjs');
  try {
    const email = 'marutieducation64@gmail.com';
    const password = process.env.ADMIN_SEED_PASSWORD || getDemoPassword();
    if (!password) {
      return res.status(500).json({ message: 'ADMIN_SEED_PASSWORD or DEMO_PASSWORD is required' });
    }

    await User.deleteMany({ email: /marutieducation64@gmail.com/i });
    
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      firstName: 'Maruti',
      lastName: 'Education',
      email: email,
      password: hashedPassword,
      role: 'admin',
      profileCompleted: true
    });

    const uniCount = await University.countDocuments();
    
    res.json({ 
      success: true,
      message: 'Database Synchronized Permanently!',
      admin: email,
      universities: uniCount
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/seed-demo', seedRouteGuard, async (req, res) => {
  const User = require('../models/User');
  try {
    const demoPassword = getDemoPassword();
    if (!demoPassword) {
      return res.status(500).json({ message: 'DEMO_PASSWORD is required' });
    }

    let admin = await User.findOne({ email: 'admin@mec.com' });
    if (!admin) {
        admin = await User.create({
          firstName: 'System',
          lastName: 'Admin',
          email: 'admin@mec.com',
          password: demoPassword,
          role: 'admin',
          profileCompleted: true
        });
      } else {
        admin.password = demoPassword;
      await admin.save();
    }
    
     let partner = await User.findOne({ email: 'partner@university.com' });
     if (!partner) {
       partner = await User.create({
         firstName: 'University',
         lastName: 'Partner',
         email: 'partner@university.com',
         password: demoPassword,
         role: 'university_partner',
         profileCompleted: true
       });
     } else {
       partner.password = demoPassword;
       await partner.save();
     }
    
    res.json({ 
      message: 'Demo accounts generated successfully!', 
      credentials: {
        admin: { email: 'admin@mec.com' },
        partner: { email: 'partner@university.com' }
      }
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
