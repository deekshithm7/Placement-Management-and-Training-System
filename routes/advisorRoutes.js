// backend/routes/advisorRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isAuthenticated, checkRole } = require('../middleware/authMiddleware');
const axios = require('axios');

// Helper function to send emails via Brevo API (reusing from auth routes)
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

// Add a new advisor (Coordinator only)
router.post('/add', isAuthenticated, checkRole(['Coordinator']), async (req, res) => {
  try {
    const { name, email, branch, phoneNumber, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !branch || !password) {
      return res.status(400).json({ message: 'Name, email, branch, and password are required' });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new advisor
    const newAdvisor = new User({
      name,
      email,
      password: hashedPassword,
      role: 'Advisor',
      branch,
      phoneNumber,
      registered: true // Immediately registered since password is set
    });
    
    await newAdvisor.save();
    
    // Send welcome email to the advisor
    const loginUrl = "https://pmts/login";
    const emailContent = `
    <!DOCTYPE html>
    <html>
    <head><title>Welcome to PMTS</title></head>
    <body>
      <div style="text-align:center; padding:20px; font-family:Arial,sans-serif;">
        <h2 style="color:#2D89FF;">Welcome to PMTS - Placement Management System</h2>
        <p>Dear ${name},</p>
        <p>You have been added as an <strong>Advisor</strong> for the ${branch} department.</p>
        <p>Your login credentials:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>We recommend changing your password after your first login.</p>
        <a href="${loginUrl}" style="background-color:#2D89FF; color:white; padding:10px 20px; border-radius:5px; text-decoration:none; display:inline-block; margin-top:15px;">Login Now</a>
        <p style="color:#777; font-size:12px; margin-top:20px;">© 2025 PMTS. All rights reserved.</p>
      </div>
    </body>
    </html>
    `;
    
    await sendEmail(email, 'Welcome to PMTS as Advisor', emailContent);
    
    console.log(`[ADD-ADVISOR] New advisor added: ${email}, Branch: ${branch}`);
    res.status(201).json({ 
      message: 'Advisor added successfully',
      advisor: {
        id: newAdvisor._id,
        name: newAdvisor.name,
        email: newAdvisor.email,
        branch: newAdvisor.branch
      }
    });
  } catch (error) {
    console.error('[ADD-ADVISOR ERROR]', error);
    res.status(500).json({ message: 'Error adding advisor' });
  }
});

// Get all advisors (Coordinator only)
router.get('/', isAuthenticated, checkRole(['Coordinator']), async (req, res) => {
  try {
    const advisors = await User.find({ role: 'Advisor' })
      .select('name email branch phoneNumber createdAt'); // Only select needed fields
      
    console.log(`[GET-ADVISORS] Retrieved ${advisors.length} advisors`);
    res.json(advisors);
  } catch (error) {
    console.error('[GET-ADVISORS ERROR]', error);
    res.status(500).json({ message: 'Error retrieving advisors' });
  }
});

// Get single advisor (Coordinator only)
router.get('/:id', isAuthenticated, checkRole(['Coordinator']), async (req, res) => {
  try {
    const advisor = await User.findOne({ 
      _id: req.params.id,
      role: 'Advisor'
    }).select('name email branch phoneNumber createdAt');
    
    if (!advisor) {
      return res.status(404).json({ message: 'Advisor not found' });
    }
    
    console.log(`[GET-ADVISOR] Retrieved advisor: ${advisor.email}`);
    res.json(advisor);
  } catch (error) {
    console.error('[GET-ADVISOR ERROR]', error);
    res.status(500).json({ message: 'Error retrieving advisor' });
  }
});

// Update advisor (Coordinator only)
router.put('/:id', isAuthenticated, checkRole(['Coordinator']), async (req, res) => {
  try {
    const { name, branch, phoneNumber } = req.body;
    
    // Find advisor
    const advisor = await User.findOne({ 
      _id: req.params.id,
      role: 'Advisor'
    });
    
    if (!advisor) {
      return res.status(404).json({ message: 'Advisor not found' });
    }
    
    // Update fields
    if (name) advisor.name = name;
    if (branch) advisor.branch = branch;
    if (phoneNumber) advisor.phoneNumber = phoneNumber;
    advisor.updatedAt = Date.now();
    
    await advisor.save();
    
    console.log(`[UPDATE-ADVISOR] Updated advisor: ${advisor.email}`);
    res.json({ 
      message: 'Advisor updated successfully',
      advisor: {
        id: advisor._id,
        name: advisor.name,
        email: advisor.email,
        branch: advisor.branch,
        phoneNumber: advisor.phoneNumber
      }
    });
  } catch (error) {
    console.error('[UPDATE-ADVISOR ERROR]', error);
    res.status(500).json({ message: 'Error updating advisor' });
  }
});

// Delete advisor (Coordinator only)
router.delete('/:id', isAuthenticated, checkRole(['Coordinator']), async (req, res) => {
  try {
    const advisor = await User.findOneAndDelete({ 
      _id: req.params.id,
      role: 'Advisor'
    });
    
    if (!advisor) {
      return res.status(404).json({ message: 'Advisor not found' });
    }
    
    console.log(`[DELETE-ADVISOR] Deleted advisor: ${advisor.email}`);
    res.json({ message: 'Advisor deleted successfully' });
  } catch (error) {
    console.error('[DELETE-ADVISOR ERROR]', error);
    res.status(500).json({ message: 'Error deleting advisor' });
  }
});

module.exports = router;