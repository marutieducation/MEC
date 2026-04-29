const express = require('express');
const router = express.Router();
const { register, login, verify2FA, getMe, updateProfile, forgotPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-2fa', verify2FA);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

router.get('/seed-demo', async (req, res) => {
  const User = require('../models/User');
  try {
    let admin = await User.findOne({ email: 'admin@mec.com' });
    if (!admin) {
        admin = await User.create({
          firstName: 'System',
          lastName: 'Admin',
          email: 'admin@mec.com',
          password: process.env.DEMO_PASSWORD || 'M3c@2024!Secure',
          role: 'admin',
          profileCompleted: true
        });
      } else {
        admin.password = process.env.DEMO_PASSWORD || 'M3c@2024!Secure';
      await admin.save();
    }
    
     let partner = await User.findOne({ email: 'partner@university.com' });
     if (!partner) {
       partner = await User.create({
         firstName: 'University',
         lastName: 'Partner',
         email: 'partner@university.com',
         password: process.env.DEMO_PASSWORD || 'M3c@2024!Secure',
         role: 'university_partner',
         profileCompleted: true
       });
     } else {
       partner.password = process.env.DEMO_PASSWORD || 'M3c@2024!Secure';
       await partner.save();
     }
    
    res.json({ 
      message: 'Demo accounts generated successfully!', 
      credentials: {
        admin: { email: 'admin@mec.com', password: process.env.DEMO_PASSWORD || 'M3c@2024!Secure' },
        partner: { email: 'partner@university.com', password: process.env.DEMO_PASSWORD || 'M3c@2024!Secure' }
      }
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
