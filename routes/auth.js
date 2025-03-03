const express = require('express');
const router = express.Router();
const User = require('../models/User');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { authenticate } = require('../middleware/auth');

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});

// Check if user exists in users collection
router.post('/check-user', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (err) {
    res.status(500).json({ message: 'Error checking user: ' + err.message });
  }
});

// Send OTP without creating user
router.post('/send-otp', async (req, res) => {
  const { name, year, branch, email, password, role } = req.body;
  console.log('Send OTP request:', { name, year, branch, email, role });

  try {
    if (role === 'Student' && !email.endsWith('@gcek.ac.in')) {
      return res.status(400).json({ grievance: 'Email must end with @gcek.ac.in for students' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpToken = jwt.sign({ name, year, branch, email, password, role, otp }, process.env.JWT_SECRET, { expiresIn: '10m' });

    await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });
    console.log('OTP email sent to:', email, 'OTP:', otp);

    res.json({ message: 'OTP sent', otpToken });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP: ' + err.message });
  }
});

// Verify OTP and register user
router.post('/verify-and-register', async (req, res) => {
  const { name, year, branch, email, password, role, otpToken, otp } = req.body;
  console.log('Verify and register request:', { name, year, branch, email, role, otpToken, otp });

  try {
    console.log('Verifying OTP token:', otpToken);
    const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    if (decoded.otp !== otp) {
      console.log('OTP mismatch:', { decodedOtp: decoded.otp, providedOtp: otp });
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (
      decoded.name !== name ||
      decoded.year !== year ||
      decoded.branch !== branch ||
      decoded.email !== email ||
      decoded.password !== password ||
      decoded.role !== role
    ) {
      console.log('Data mismatch:', { decoded, request: { name, year, branch, email, password, role } });
      return res.status(400).json({ message: 'Invalid registration data' });
    }

    if (role === 'Student' && !email.endsWith('@gcek.ac.in')) {
      return res.status(400).json({ message: 'Email must end with @gcek.ac.in for students' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', existingUser);
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Creating Firebase user:', { email });
    const firebaseUser = await admin.auth().createUser({
      email,
      password,
    }).catch(err => {
      console.error('Firebase creation error:', err);
      if (err.code === 'auth/email-already-exists') {
        throw new Error('Email already in use in Firebase');
      }
      throw err;
    });
    console.log('Firebase user created:', firebaseUser.uid);

    const user = new User({
      firebaseUid: firebaseUser.uid,
      email,
      role,
      name,
      isVerified: true,
    });
    await user.save();
    console.log('User registered:', user);

    res.status(200).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Verify and register error:', err);
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
      // Check if requested role matches existing role
      if (user.role !== role) {
        console.log(`Role mismatch: Existing role "${user.role}" does not match requested role "${role}"`);
        return res.status(403).json({ message: 'Role mismatch: User registered with a different role' });
      }
      // Link Google provider if firebaseUid differs
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
      // Only create new user for Student or Alumni roles
      if (role === 'Coordinator' || role === 'Advisor') {
        console.log(`No existing ${role} found for email:`, email);
        return res.status(403).json({ message: 'Not allowed: Coordinator/Advisor must exist in database' });
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