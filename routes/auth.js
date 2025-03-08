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
              sender: { name: "pmts", email: process.env.BREVO_EMAIL },
              to: [{ email: `${email}` }], // Replace with actual recipient
              subject: "Your OTP Code",
              htmlContent: `<!DOCTYPE html>
<html>
<head><title>OTP Verification</title></head>
<body>
    <div style="text-align:center; padding:20px; font-family:Arial,sans-serif;">
        <h2>Verify Your Email</h2>
        <p>Use the OTP below to verify your email address:</p>
        <h2 style="color:#2D89FF;">${otp}</h2>
        <p>This OTP is valid for 5 minutes.</p>
    </div>
</body>
</html>`
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
    const loginUrl = "https://pmts/login";
    try {
      const response = await axios.post(
          "https://api.brevo.com/v3/smtp/email",
          {
              sender: { name: "pmts", email: process.env.BREVO_EMAIL },
              to: [{ email: `${email}` }], // Replace with actual recipient
              subject: "Registration successful",
              htmlContent: `<!DOCTYPE html>
<html>
<head><title>Registration Successful</title></head>
<body>
    <div style="text-align:center; padding:20px; font-family:Arial,sans-serif;">
        <h2 style="color:#28a745;">✔ Registration Successful!</h2>
        <p>Thank you for signing up. Your account has been successfully created.</p>
        <p>You can now log in and start using our services.</p>
        <a href="${loginUrl}" style="background-color:#2D89FF; color:white; padding:10px 20px; border-radius:5px; text-decoration:none;">Login Now</a>
        <p style="color:#777; font-size:12px; margin-top:20px;">© 2025 Your Company. All rights reserved.</p>
    </div>
</body>
</html>`
          },
          {
              headers: { "api-key": process.env.BREVO_API_KEY, "Content-Type": "application/json" }
          }
      );
      console.log("Registration Successfull email sent:", response.data);
  } catch (error) {
      console.error("Error sending registration successfull email:", error.response ? error.response.data : error);
  }
    res.json({ message: 'Registration successful' });
  } catch (err) {
    console.error(`[VERIFY-OTP ERROR] Email: ${email}, Error: ${err.message}`);
    res.status(500).json({ message: 'Error completing registration' });
  }
});

router.post('/login', passport.authenticate('local', { session: true }), async (req, res) => {
  try {
    // Fetch the user from the database to ensure we have the latest data
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(`[LOGIN SUCCESS] User: ${user.email}, Role: ${user.role}`);
    res.json({
      message: 'Logged in successfully',
      user: {
        email: user.email,
        role: user.role,
        name: user.name || user.email, // Use name if available, fallback to email
        batch: user.batch || null // Include batch, fallback to null if not present
      }
    });
  } catch (err) {
    console.error(`[LOGIN ERROR] Email: ${req.user.email}, Error: ${err.message}`);
    res.status(500).json({ message: 'Server error during login' });
  }
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

router.get('/status', async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      console.log(`[STATUS] Authenticated user: ${user.email}`);
      res.json({
        isAuthenticated: true,
        user: {
          email: user.email,
          role: user.role,
          name: user.name || user.email, // Use name if available, fallback to email
          batch: user.batch || null // Include batch
        }
      });
    } catch (err) {
      console.error(`[STATUS ERROR] Email: ${req.user.email}, Error: ${err.message}`);
      res.status(500).json({ message: 'Server error checking status' });
    }
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