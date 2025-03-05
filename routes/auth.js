// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const axios =require('axios');

router.post('/check-email', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!user) return res.status(403).json({ message: 'Email not in allowed users list', exists: false });
    if (!['Student', 'Alumni'].includes(user.role)) return res.status(403).json({ message: 'Registration only allowed for students and alumni', exists: true, role: user.role });
    if (user.registered) return res.status(400).json({ message: 'Email already registered', exists: true, registered: true });
    console.log(`[CHECK-EMAIL] Email: ${email}, Result: Valid for OTP`);
    res.json({ message: 'Email found, proceed with OTP', exists: true, registered: false });
  } catch (err) {
    console.error(`[CHECK-EMAIL ERROR] Email: ${email}, Error: ${err.message}`);
    res.status(500).json({ message: 'Server error checking email' });
  }
});

router.post('/send-registration-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!user || !['Student', 'Alumni'].includes(user.role)) return res.status(400).json({ message: !user ? 'Email not found' : 'Registration only allowed for students and alumni' });
    if (user.registered) return res.status(400).json({ message: 'Email already registered' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpToken = jwt.sign({ email, role: user.role, otp }, process.env.JWT_SECRET, { expiresIn: '10m' });
    try {
      const response = await axios.post(
          "https://api.brevo.com/v3/smtp/email",
          {
              sender: { name: "YourApp", email: process.env.BREVO_EMAIL },
              to: [{ email: `${email}` }], // Replace with actual recipient
              subject: "Your OTP Code",
              htmlContent: `<p>Your OTP is: <strong>${otp}</strong></p><p>This code is valid for 5 minutes.</p>`
          },
          {
              headers: { "api-key": process.env.BREVO_API_KEY, "Content-Type": "application/json" }
          }
      );
      console.log("OTP Sent Successfully:", response.data);
  } catch (error) {
      console.error("Error sending OTP:", error.response ? error.response.data : error);
  }

    console.log(`[SEND-OTP] OTP sent to: ${email} : ${otp}`);
    res.json({ message: 'OTP sent', otpToken });
  } catch (err) {
    console.error(`[SEND-OTP ERROR] Email: ${email}, Error: ${err.message}`);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

    

router.post('/verify-and-set-password', async (req, res) => {
  const { email, otp, password, otpToken } = req.body;
  try {
    const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
    if (decoded.otp !== otp || decoded.email !== email || !['Student', 'Alumni'].includes(decoded.role)) return res.status(400).json({ message: 'Invalid OTP or role' });
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!user || user.registered) return res.status(400).json({ message: 'Invalid registration attempt' });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.registered = true;
    user.updatedAt = new Date();
    await user.save();
    console.log(`[REGISTER SUCCESS] User: ${email}, Role: ${user.role}`);
    res.json({ message: 'Registration successful' });
  } catch (err) {
    console.error(`[VERIFY-OTP ERROR] Email: ${email}, Error: ${err.message}`);
    res.status(500).json({ message: 'Error completing registration' });
  }
});

router.post('/login', passport.authenticate('local', { session: true }), (req, res) => {
  console.log(`[LOGIN SUCCESS] User: ${req.user.email}, Role: ${req.user.role}`);
  res.json({ message: 'Logged in successfully', user: { email: req.user.email, role: req.user.role } });
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(`[LOGOUT ERROR] ${err.message}`);
      return res.status(500).json({ message: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) console.error(`[SESSION DESTROY ERROR] ${err.message}`);
      console.log('[LOGOUT SUCCESS]');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    console.log(`[STATUS] Authenticated user: ${req.user.email}`);
    res.json({ isAuthenticated: true, user: { email: req.user.email, role: req.user.role } });
  } else {
    console.log('[STATUS] No authenticated user');
    res.json({ isAuthenticated: false, user: null });
  }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  console.log(`[GOOGLE LOGIN SUCCESS] User: ${req.user.email}, Role: ${req.user.role}`);
  res.redirect(`http://localhost:5173/${req.user.role}`);
});

module.exports = router;