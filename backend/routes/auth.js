const express = require('express');
const router = express.Router();
const { register, login, verify2FA, getMe, updateProfile, forgotPassword, resetPassword, linkUniversity } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { authLimiter, registerLimiter, passwordResetLimiter } = require('../middleware/rateLimit');
const { validate } = require('../middleware/validation');

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
    return process.env.NODE_ENV === 'production' ? null : 'mec_v2_p4ssw0rd_9872!#';
};

router.post('/register', registerLimiter, validate('register'), register);
router.post('/login', authLimiter, validate('login'), login);
router.post('/forgot-password', passwordResetLimiter, validate('forgotPassword'), forgotPassword);
router.post('/reset-password', validate('resetPassword'), resetPassword);
router.post('/verify-2fa', authLimiter, verify2FA);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/link-university', protect, linkUniversity);

router.post('/super-seed', seedRouteGuard, async (req, res) => {
  const User = require('../models/User');
  const University = require('../models/University');
  const bcrypt = require('bcryptjs');
  try {
    const { adminEmail, adminPassword } = req.body;
    
    // Validate admin credentials from request body
    if (!adminEmail || !adminPassword) {
      return res.status(400).json({ 
        message: 'Admin email and password are required in request body' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail, role: 'admin' });
    if (existingAdmin) {
      return res.status(409).json({ 
        message: 'Admin with this email already exists' 
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      profileCompleted: true
    });

    const uniCount = await University.countDocuments();
    
    res.json({ 
      success: true,
      message: 'Admin account created successfully!',
      admin: adminEmail,
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
