const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const LoginAttempt = require('../models/LoginAttempt');
const { generateToken } = require('../utils/generateToken');
const { sendEmail } = require('../utils/emailService');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

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



    const twoFactorEnabled = false; // Disabled as per request

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

    // Link University if provided
    if (role === 'university_partner' && universityId) {
      const University = require('../models/University');
      await University.findByIdAndUpdate(universityId, { partnerUser: user._id });
    }

    const populatedUser = await User.findById(user._id).populate('universityId');


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
      _id: populatedUser._id,
      firstName: populatedUser.firstName,
      lastName: populatedUser.lastName,
      email: populatedUser.email,
      role: populatedUser.role,
      profileCompleted: populatedUser.profileCompleted,
      universityId: populatedUser.universityId,
      token: generateToken(populatedUser._id),
    });
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

    // Check account lockout
    const isLocked = await LoginAttempt.isAccountLocked(email);
    if (isLocked) {
      console.warn(`[AUTH] 🔒 Account locked: ${email} (IP: ${req.ip})`);
      return res.status(429).json({ 
        message: 'Account temporarily locked due to too many failed attempts. Please try again in 15 minutes.' 
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // Log failed attempt
      await LoginAttempt.create({
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
        success: false
      });
      console.warn(`[AUTH] ❌ User not found: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }


    if (role && user.role !== role) {
      // Log failed attempt
      await LoginAttempt.create({
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
        success: false,
        userId: user._id
      });
      console.warn(`[AUTH] ⚠️ Role mismatch: Expecting ${role}, found ${user.role} for ${email}`);
      return res.status(401).json({
        message: `Access denied. This account is registered as a ${user.role}.`
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      // Log failed attempt
      await LoginAttempt.create({
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
        success: false,
        userId: user._id
      });
      const remaining = await LoginAttempt.getRemainingAttempts(email);
      console.warn(`[AUTH] ❌ Password incorrect for: ${email}. Remaining attempts: ${remaining}`);
      return res.status(401).json({ 
        message: 'Invalid email or password',
        remainingAttempts: remaining
      });
    }

    // Log successful attempt
    await LoginAttempt.create({
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent') || '',
      success: true,
      userId: user._id
    });

    console.log(`[AUTH] ✅ Success: ${email} (Role: ${user.role}) logged in.`);



    // 2FA disabled as per request
    if (false && user.twoFactorEnabled) {
      const otp = crypto.randomInt(100000, 999999).toString();
      const salt = await bcrypt.genSalt(10);
      const hashedOtp = await bcrypt.hash(otp, salt);

      await User.findByIdAndUpdate(user._id, {
        twoFactorCode: hashedOtp, // Store hashed OTP
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

    const populatedUser = await user.populate('universityId');
    const token = generateToken(populatedUser._id);
    
    // Set httpOnly secure cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/'
    };
    
    res.cookie('uafms_token', token, cookieOptions);
    
    res.json({
      _id: populatedUser._id,
      firstName: populatedUser.firstName,
      lastName: populatedUser.lastName,
      email: populatedUser.email,
      role: populatedUser.role,
      profileCompleted: populatedUser.profileCompleted,
      universityId: populatedUser.universityId,
      token: token, // Still return token for backward compatibility
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
    
    // Enhanced OTP validation without bypass codes
    if (!user.twoFactorCode || !user.twoFactorExpiry) {
      return res.status(400).json({ message: 'No active verification code' });
    }

    // Strict OTP format validation
    if (!/^\d{6}$/.test(normalizedOtp)) {
      return res.status(400).json({ message: 'Invalid verification code format' });
    }

    // Check OTP expiration
    if (user.twoFactorExpiry < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    // Verify OTP with enhanced error handling
    try {
      const isOtpMatch = await bcrypt.compare(normalizedOtp, user.twoFactorCode);
      if (!isOtpMatch) {
        // Log failed attempt for security monitoring
        console.warn(`[2FA] Failed verification attempt for user ${user._id}`);
        return res.status(400).json({ message: 'Invalid verification code' });
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      return res.status(500).json({ message: 'Verification process failed' });
    }


    await User.findByIdAndUpdate(user._id, {
      twoFactorCode: null,
      twoFactorExpiry: null
    });

    const populatedUser = await user.populate('universityId');
    res.json({
      _id: populatedUser._id,
      firstName: populatedUser.firstName,
      lastName: populatedUser.lastName,
      email: populatedUser.email,
      role: populatedUser.role,
      profileCompleted: populatedUser.profileCompleted,
      universityId: populatedUser.universityId,
      token: generateToken(populatedUser._id),
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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const User = require('../models/User');
    const PasswordReset = require('../models/PasswordReset');
    const { sendEmail } = require('../utils/emailService');

    const user = await User.findOne({ email });
    
    // Always return success to prevent email enumeration attacks
    if (!user) {
      return res.json({ 
        message: 'If an account with this email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = await PasswordReset.generateResetToken(
      email, 
      req.ip, 
      req.get('User-Agent')
    );

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken.token}`;

    // Send reset email
    try {
      await sendEmail({
        to: email,
        subject: 'Password Reset Request - MEC UAFMS',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">MEC UAFMS</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Password Reset Request</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${user.firstName},</h2>
              <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
                We received a request to reset your password for your MEC UAFMS account. 
                Click the button below to reset your password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; padding: 15px 30px; text-decoration: none; 
                          border-radius: 25px; font-weight: bold; display: inline-block;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin: 20px 0 0 0;">
                Or copy and paste this link in your browser:<br>
                <span style="word-break: break-all; color: #667eea;">${resetUrl}</span>
              </p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>Important:</strong> This link will expire in 1 hour for security reasons. 
                If you didn't request this password reset, please ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>This is an automated message from MEC UAFMS. Please do not reply to this email.</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Continue with response even if email fails
    }

    res.json({ 
      message: 'If an account with this email exists, a password reset link has been sent.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Password reset request failed' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        message: 'Reset token and new password are required' 
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
    }

    const PasswordReset = require('../models/PasswordReset');
    const User = require('../models/User');

    // Validate reset token
    const resetDoc = await PasswordReset.validateToken(token);
    if (!resetDoc) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Update user password
    const user = await User.findById(resetDoc.user._id);
    user.password = newPassword;
    await user.save();

    // Mark token as used
    await resetDoc.markAsUsed();

    // Send confirmation email
    try {
      const { sendEmail } = require('../utils/emailService');
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Successful - MEC UAFMS',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">MEC UAFMS</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Password Reset Successful</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${user.firstName},</h2>
              <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
                Your password has been successfully reset. You can now log in to your account with your new password.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; padding: 15px 30px; text-decoration: none; 
                          border-radius: 25px; font-weight: bold; display: inline-block;">
                  Log In to Your Account
                </a>
              </div>
            </div>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="color: #155724; margin: 0; font-size: 14px;">
                <strong>Security Notice:</strong> If you didn't request this password reset, 
                please contact our support team immediately.
              </p>
            </div>
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>This is an automated message from MEC UAFMS. Please do not reply to this email.</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.json({ 
      message: 'Password reset successful. You can now log in with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Password reset failed' });
  }
};

const linkUniversity = async (req, res) => {
  try {
    const { universityId } = req.body;

    if (req.user.role !== 'university_partner') {
      return res.status(403).json({ message: 'Only university partners can link a university' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { universityId },
      { new: true, runValidators: true }
    ).populate('universityId');

    // Also update the University model's partnerUser field
    const University = require('../models/University');
    await University.findByIdAndUpdate(universityId, { partnerUser: req.user._id });

    res.json({
      success: true,
      message: 'University linked successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, verify2FA, getMe, updateProfile, forgotPassword, resetPassword, linkUniversity };
