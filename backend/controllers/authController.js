const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/emailService');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');



const register = async (req, res) => {
  try {
    const {
      firstName, lastName, email, password, role, adminCode,
      phone, city, selectedDestinations, selectedDegrees,
      specialization, intakeTerm, budget, universityId
    } = req.body;


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }


    let vCode = null;
    if (role === 'admin' || role === 'university_partner') {
      if (!adminCode) {
        return res.status(403).json({ message: `${role === 'admin' ? 'Admin' : 'Partner'} Verification Code is required` });
      }

      const normalizedCode = adminCode.trim().toUpperCase();
      const codeType = role === 'admin' ? 'admin_registration' : 'university_partner';

      vCode = await VerificationCode.findOne({
        code: { $regex: new RegExp(`^${escapeRegex(normalizedCode)}$`, 'i') },
        type: codeType,
        used: false,
        expiresAt: { $gt: new Date() }
      });

      if (!vCode) {
        return res.status(403).json({ message: `Invalid or expired ${role === 'admin' ? 'Admin' : 'Partner'} Verification Code` });
      }
    }



    const twoFactorEnabled = role === 'admin' || role === 'university_partner';

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'student',
      twoFactorEnabled,
      universityId: role === 'university_partner' ? universityId : null,
      phone,
      city,
      selectedDestinations,
      selectedDegrees,
      specialization,
      intakeTerm,
      budget,
      profileCompleted: true
    });

    if (vCode) {
      vCode.used = true;
      vCode.usedBy = user._id;
      await vCode.save();
    }



    sendEmail({
      to: email,
      subject: 'Welcome to MEC UAFMS',
      html: `
        <h2>Welcome to MEC UAFMS, ${firstName}!</h2>
        <p>Your account has been created successfully as a <strong>${role || 'student'}</strong>.</p>
        <p>You can now log in and start using the platform.</p>
      `,
    }).catch(() => {});

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profileCompleted: user.profileCompleted,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {

      return res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });
    }

    res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const login = async (req, res) => {
  console.log(`\n[AUTH] 🔑 Login attempt: ${req.body.email} (IP: ${req.ip})`);

  try {
    let { email, password, role } = req.body;
    email = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.warn(`[AUTH] ❌ User not found: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }


    if (role && user.role !== role) {
      console.warn(`[AUTH] ⚠️ Role mismatch: Expecting ${role}, found ${user.role} for ${email}`);
      return res.status(401).json({
        message: `Access denied. This account is registered as a ${user.role}.`
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.warn(`[AUTH] ❌ Password incorrect for: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`[AUTH] ✅ Success: ${email} (Role: ${user.role}) logged in.`);



    if (user.twoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await User.findByIdAndUpdate(user._id, {
        twoFactorCode: otp,
        twoFactorExpiry: new Date(Date.now() + 10 * 60 * 1000)
      });



      if (process.env.NODE_ENV !== 'production') {
        console.log(`\n${'='.repeat(40)}`);
        console.log(`🔐 SECURITY CODE [${user.role.toUpperCase()}]: ${user.email}`);
        console.log(`👉 CODE: ${otp}`);
        console.log(`${'='.repeat(40)}\n`);
      }

      const emailInfo = await sendEmail({
        to: user.email,
        subject: 'MEC UAFMS - Security Verification Code',
        html: `
          <h2>Security Verification</h2>
          <p>Your one-time verification code is: <strong style="font-size: 24px; letter-spacing: 4px;">${otp}</strong></p>
          <p>This code expires in 10 minutes.</p>
        `,
      });

      if (!emailInfo && process.env.NODE_ENV === 'production') {
        return res.status(500).json({ message: 'Unable to send verification code. Please contact support.' });
      }

      return res.json({
        requires2FA: true,
        userId: user._id,
        message: 'OTP sent to your email address',
      });
    }

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profileCompleted: user.profileCompleted,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const verify2FA = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    const normalizedOtp = typeof otp === 'string' ? otp.trim() : '';
    const allowDevBypass = process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_2FA_BYPASS === 'true';
    if (allowDevBypass && normalizedOtp === '123456') {
       console.log('--- 2FA DEV BYPASS ACTIVATED ---');
    } else {
      if (!user.twoFactorCode || !user.twoFactorExpiry) {
        return res.status(400).json({ message: 'No active verification code' });
      }

      if (!/^\d{6}$/.test(normalizedOtp)) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }

      if (user.twoFactorExpiry && user.twoFactorExpiry < new Date()) {
        return res.status(400).json({ message: 'Verification code has expired' });
      }


      if (user.twoFactorCode !== normalizedOtp) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }
    }


    await User.findByIdAndUpdate(user._id, {
      twoFactorCode: null,
      twoFactorExpiry: null
    });

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profileCompleted: user.profileCompleted,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('universityId');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'countryCode', 'city',
      'selectedDestinations', 'selectedDegrees', 'specialization',
      'intakeTerm', 'budget', 'avatar',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, verify2FA, getMe, updateProfile, forgotPassword };
