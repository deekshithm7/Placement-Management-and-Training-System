const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AllowedEmail = require('../models/AllowedEmail');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { authenticate } = require('../middleware/auth');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});

// Check if email is allowed and not registered
router.post('/check-email', async (req, res) => {
  const { email } = req.body;
  try {
    const allowed = await AllowedEmail.findOne({ email });
    if (!allowed) {
      console.log('Email not allowed:', email);
      return res.status(403).json({ message: 'Email not allowed', allowed: false, exists: false });
    }
    const exists = await User.findOne({ email });
    res.json({ allowed: true, exists: !!exists, role: allowed.role });
  } catch (err) {
    console.error('Check email error:', err);
    res.status(500).json({ message: 'Error checking email: ' + err.message });
  }
});

// Send OTP for registration
router.post('/send-registration-otp', async (req, res) => {
  const { email } = req.body;
  console.log('Send OTP request:', { email });

  try {
    const allowed = await AllowedEmail.findOne({ email });
    if (!allowed) {
      console.log('Email not allowed:', email);
      return res.status(403).json({ message: 'Email not allowed' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpToken = jwt.sign({ email, role: allowed.role, otp }, process.env.JWT_SECRET, { expiresIn: '10m' });

    await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: 'Your Registration OTP',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });
    console.log('OTP email sent to:', email, 'OTP:', otp);

    res.json({ message: 'OTP sent', otpToken });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP: ' + err.message });
  }
});

// Verify OTP and set password
router.post('/verify-and-set-password', async (req, res) => {
  const { email, otp, password, otpToken } = req.body;
  console.log('Verify and set password request:', { email, otpToken });

  try {
    const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    if (decoded.otp !== otp || decoded.email !== email) {
      console.log('OTP mismatch:', { decodedOtp: decoded.otp, providedOtp: otp });
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    let user = await User.findOne({ email });
    if (user) {
      // User exists (e.g., from Google Sign-In), link password
      console.log('Linking password to existing user:', email);
      await admin.auth().updateUser(user.firebaseUid, { password });
      user.isVerified = true;
      await user.save();
    } else {
      // New user, create with email/password
      console.log('Creating new Firebase user:', { email });
      const firebaseUser = await admin.auth().createUser({ email, password });
      user = new User({
        firebaseUid: firebaseUser.uid,
        email,
        role: decoded.role,
        isVerified: true,
      });
      await user.save();
      console.log('New user registered:', user);
    }

    res.status(200).json({ message: 'Password set successfully' });
  } catch (err) {
    console.error('Verify and set password error:', err);
    res.status(500).json({ message: 'Registration failed: ' + err.message });
  }
});

// Google sign-in with role-specific restrictions
router.post('/google-login', async (req, res) => {
  const { firebaseUid, email, role } = req.body;
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  try {
    console.log('Google login request:', { firebaseUid, email, role });
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('Decoded token:', decodedToken);

    if (decodedToken.uid !== firebaseUid) {
      return res.status(401).json({ message: 'Token UID mismatch' });
    }

    if (role === 'Student' && !email.endsWith('@gcek.ac.in')) {
      return res.status(400).json({ message: 'Email must end with @gcek.ac.in for students' });
    }

    let user = await User.findOne({ email });
    if (user) {
      if (user.role !== role) {
        console.log(`Role mismatch: Existing role "${user.role}" does not match requested role "${role}"`);
        return res.status(403).json({ message: 'Role mismatch: User registered with a different role' });
      }
      if (user.firebaseUid !== firebaseUid) {
        console.log('Linking Google provider to existing user:', user.email);
        await admin.auth().updateUser(user.firebaseUid, {
          providerData: [
            ...(await admin.auth().getUser(user.firebaseUid)).providerData,
            { providerId: 'google.com', uid: firebaseUid },
          ],
        });
        await user.save();
        console.log('User updated with Google link:', user);
      }
    } else {
      if (role === 'Coordinator' || role === 'Advisor') {
        console.log(`No existing ${role} found for email:`, email);
        return res.status(403).json({ message: 'Not allowed: Coordinator/Advisor must exist in database' });
      }
      const allowed = await AllowedEmail.findOne({ email });
      if (!allowed) {
        console.log('Email not allowed for new user:', email);
        return res.status(403).json({ message: 'Unauthorized email: Not in allowed list' });
      }
      user = new User({
        firebaseUid,
        email,
        role,
        isVerified: true,
      });
      await user.save();
      console.log('New user created:', user);
    }

    res.json({ email: user.email, role: user.role });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ message: 'Google login failed: ' + err.message });
  }
});

router.get('/me', authenticate, (req, res) => {
  console.log('Serving /me for user:', req.user);
  res.json({ email: req.user.email, role: req.user.role });
});

router.post('/update-profile', authenticate, async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
    user.name = name;
    await user.save();
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

module.exports = router;