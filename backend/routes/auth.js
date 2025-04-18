const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RegistrationRequest = require('../models/RegistrationRequest');
const bcrypt = require('bcryptjs');
const axios = require('axios');

// Helper function to send emails via Brevo API
async function sendEmail(recipient, subject, content) {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { email: process.env.BREVO_EMAIL, name: 'PMTS System' },
        to: [{ email: recipient }],
        subject,
        htmlContent: content
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`[EMAIL] Email sent to: ${recipient}`);
    return response.data;
  } catch (error) {
    console.error('[EMAIL ERROR]', error.response?.data || error.message);
    throw new Error('Failed to send email');
  }
}

// Existing student routes
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
    console.log(`[SEND-OTP] OTP sent to: ${email} : ${otp}`);
    const otpToken = jwt.sign({ email, role: user.role, otp }, process.env.JWT_SECRET, { expiresIn: '10m' });
    try {
      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { name: "pmts", email: process.env.BREVO_EMAIL },
          to: [{ email: `${email}` }],
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
    const loginUrl = "https://pmts-frontend-production.up.railway.app";
    try {
      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { name: "pmts", email: process.env.BREVO_EMAIL },
          to: [{ email: `${email}` }],
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

// alumni-specific routes


router.post('/send-alumni-otp', async (req, res) => {
  try {
    const { name, batchYear, branch, email, password } = req.body;
    
    // Validate required fields
    if (!name || !batchYear || !branch || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Check if email exists in User model
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Check if email exists in RegistrationRequest model
    const existingRequest = await RegistrationRequest.findOne({ email, status: 'pending' });
    if (existingRequest) {
      return res.status(400).json({ message: 'Registration request already pending' });
    }
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[SEND-OTP] OTP sent to: ${email} : ${otp}`);
    // Create OTP token (valid for 10 minutes)
    const otpToken = jwt.sign(
      { name, batchYear, branch, email, password, role: 'Alumni', otp },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );
    
    // Send OTP via email
    const emailContent = `
      <h2>Verify Your Email for Alumni Registration</h2>
      <p>Dear ${name},</p>
      <p>Your OTP for alumni registration is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
      <p>Thank you,<br>PMTS Team</p>
    `;
    
    await sendEmail(email, 'Alumni Registration OTP', emailContent);
    console.log(`[SEND-ALUMNI-OTP] OTP sent to: ${email}`);
    
    res.json({ message: 'OTP sent to email', otpToken });
  } catch (error) {
    console.error('[SEND-ALUMNI-OTP ERROR]', error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
});

// New route: Verify OTP and create registration request
router.post('/verify-alumni-password', async (req, res) => {
  try {
    const { otpToken, otp } = req.body;
    
    if (!otpToken || !otp) {
      return res.status(400).json({ message: 'OTP token and OTP are required' });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: 'OTP expired or invalid' });
    }
    
    // Verify OTP
    if (decoded.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // Check again if email exists (to handle race conditions)
    const existingUser = await User.findOne({ email: decoded.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    const existingRequest = await RegistrationRequest.findOne({ 
      email: decoded.email,
      status: 'pending'
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'Registration request already pending' });
    }
    
    // Create registration request
    const registrationRequest = new RegistrationRequest({
      name: decoded.name,
      batchYear: decoded.batchYear,
      branch: decoded.branch,
      email: decoded.email,
      password: decoded.password
    });
    
    await registrationRequest.save();
    console.log(`[VERIFY-ALUMNI-PASSWORD] Registration request created for: ${decoded.email}`);
    
    // Find advisors of the same branch to notify
    const advisors = await User.find({ 
      role: { $in: ['Advisor', 'Coordinator'] },
      branch: decoded.branch,
      registered: true
    });
    
    if (advisors.length > 0) {
      // Notify advisors via email
      const advisorEmailContent = `
        <h2>New Alumni Registration Request</h2>
        <p>A new alumni registration request has been submitted:</p>
        <p><strong>Name:</strong> ${decoded.name}</p>
        <p><strong>Email:</strong> ${decoded.email}</p>
        <p><strong>Batch Year:</strong> ${decoded.batchYear}</p>
        <p><strong>Branch:</strong> ${decoded.branch}</p>
        <p>Please log in to the PMTS system to review and approve/reject this request.</p>
        <p>Thank you,<br>PMTS Team</p>
      `;
      
      const notificationPromises = advisors.map(advisor => 
        sendEmail(advisor.email, 'New Alumni Registration Request', advisorEmailContent)
      );
      
      await Promise.all(notificationPromises);
      console.log(`[VERIFY-ALUMNI-PASSWORD] Notified ${advisors.length} advisors`);
    } else {
      console.log(`[VERIFY-ALUMNI-PASSWORD] No advisors found for branch: ${decoded.branch}`);
    }
    
    res.json({ 
      message: 'OTP verified. Registration request submitted for advisor approval.' 
    });
  } catch (error) {
    console.error('[VERIFY-ALUMNI-PASSWORD ERROR]', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});
// (login, logout, status, google, google/callback, me) 



router.post('/login', passport.authenticate('local', { session: true }), async (req, res) => {
  try {
    // Fetch the user from the database to ensure we have the latest data
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      // Check if there's a pending RegistrationRequest for an Alumni
      const pendingRequest = await RegistrationRequest.findOne({
        email: { $regex: new RegExp(`^${req.user.email}$`, 'i') },
        status: 'pending',
      });
      if (pendingRequest) {
        return res.status(403).json({
          message: 'Alumni account pending approval. Please wait for advisor approval.',
          pending: true,
        });
      }
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(`[LOGIN SUCCESS] User: ${user.email}, Role: ${user.role}`);
    res.json({
      message: 'Logged in successfully',
      user: {
        email: user.email,
        role: user.role,
        name: user.name || user.email,
        batch: user.batch || null,
      },
    });
  } catch (err) {
    console.error(`[LOGIN ERROR] Email: ${req.user?.email || 'unknown'}, Error: ${err.message}`);
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
          batch: user.batch || null ,// Include batch
          branch: user.branch || null // Include branch
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
router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }), (req, res) => {
  console.log(`[GOOGLE LOGIN SUCCESS] User: ${req.user.email}, Role: ${req.user.role}`);
  res.redirect(`${process.env.FRONTEND_URL}/${req.user.role}`);
});




router.get('/profile', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const user = await User.findOne({ email: req.user.email })
      .select('name email role registrationNumber batch semestersCompleted cgpa numberOfBacklogs branch phoneNumber createdAt updatedAt');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'Student') {
      return res.status(403).json({ message: 'This endpoint is for students only' });
    }

    console.log(`[PROFILE] Fetched profile for: ${user.email}`);
    res.json({
      message: 'Profile fetched successfully',
      profile: {
        name: user.name,
        email: user.email,
        registrationNumber: user.registrationNumber,
        batch: user.batch,
        semestersCompleted: user.semestersCompleted,
        cgpa: user.cgpa,
        numberOfBacklogs: user.numberOfBacklogs,
        branch: user.branch,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    console.error(`[PROFILE ERROR] Email: ${req.user.email}, Error: ${err.message}`);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!user || !user.registered) {
      return res.status(404).json({ message: 'Email not found or not registered' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpToken = jwt.sign(
      { email: user.email, id: user._id, otp },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Send OTP email
    const emailContent = `
      <h2>Password Reset OTP</h2>
      <p>Dear ${user.name || 'User'},</p>
      <p>Your OTP for password reset is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 15 minutes.</p>
      <p>If you didn’t request this, please ignore this email.</p>
      <p>Thank you,<br>PMTS Team</p>
    `;

    await sendEmail(email, 'Password Reset OTP', emailContent);
    console.log(`[FORGOT-PASSWORD] OTP sent to: ${email}`);
    res.json({ 
      message: 'OTP sent to your email',
      otpToken 
    });
  } catch (err) {
    console.error(`[FORGOT-PASSWORD ERROR] Email: ${email}, Error: ${err.message}`);
    res.status(500).json({ message: 'Error sending OTP' });
  }
});


router.get('/me', async (req, res) => {
  console.log('Session data:', req.session);
  console.log('User /me:', req.user);

  if (req.isAuthenticated()) {
    try {
      const user = await User.findOne({ email: req.user.email });
      if (!user) return res.status(404).json({ message: 'User not found' });

      console.log(`[ME] Authenticated user: ${user.email}`);
      return res.json({
        isAuthenticated: true,
        user: {
          _id: user._id,  // ✅ Add this line
          email: user.email,
          role: user.role,
          name: user.name || user.email,
          batch: user.batch || null,
          branch: user.branch || null
        }
      });
    } catch (err) {
      console.error(`[ME ERROR] Email: ${req.user.email}, Error: ${err.message}`);
      return res.status(500).json({ message: 'Server error checking user details' });
    }
  } else {
    console.log('[ME] No authenticated user');
    return res.json({ isAuthenticated: false, user: null });
  }
});

// Reset Password with OTP Verification
router.post('/reset-password', async (req, res) => {
  const { token, otp, newPassword } = req.body;
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const user = await User.findOne({ email: decoded.email, _id: decoded.id });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updatedAt = new Date();
    await user.save();

    console.log(`[RESET-PASSWORD SUCCESS] User: ${user.email}`);
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(`[RESET-PASSWORD ERROR] Error: ${err.message}`);
    res.status(400).json({ message: 'Invalid or expired token/OTP' });
  }
});
module.exports = router;
