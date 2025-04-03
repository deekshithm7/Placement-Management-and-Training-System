const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const RegistrationRequest = require('../models/RegistrationRequest');
const { checkRole } = require('../middleware/authMiddleware');

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

// Get pending alumni registration requests (restricted to Advisor and Coordinator roles)
router.get('/pending-alumni-requests', checkRole(['Advisor', 'Coordinator']), async (req, res) => {
  try {
    // Get the branch of the current advisor/coordinator
    const advisorBranch = req.user.branch;
    
    if (!advisorBranch) {
      return res.status(400).json({ message: 'Branch information not found for advisor' });
    }
    
    // Get pending requests for the same branch
    const pendingRequests = await RegistrationRequest.find({
      branch: advisorBranch,
      status: 'pending'
    }).sort({ createdAt: -1 });
    
    console.log(`[PENDING-ALUMNI-REQUESTS] Found ${pendingRequests.length} pending requests for branch: ${advisorBranch}`);
    
    res.json(pendingRequests);
  } catch (error) {
    console.error('[PENDING-ALUMNI-REQUESTS ERROR]', error);
    res.status(500).json({ message: 'Error fetching pending requests' });
  }
});

// Approve alumni registration request
router.put('/approve-alumni-request/:id', checkRole(['Advisor', 'Coordinator']), async (req, res) => {
  try {
    const requestId = req.params.id;
    
    // Find the registration request
    const registrationRequest = await RegistrationRequest.findById(requestId);
    
    if (!registrationRequest) {
      return res.status(404).json({ message: 'Registration request not found' });
    }
    
    // Verify the advisor's branch matches the request's branch
    if (req.user.branch !== registrationRequest.branch) {
      return res.status(403).json({ 
        message: 'You can only approve requests from your branch' 
      });
    }
    
    // Check if the request is still pending
    if (registrationRequest.status !== 'pending') {
      return res.status(400).json({ 
        message: `Request already ${registrationRequest.status}` 
      });
    }
    
    // Check if email already exists in User model
    const existingUser = await User.findOne({ email: registrationRequest.email });
    if (existingUser) {
      // Update status to avoid duplicate processing
      registrationRequest.status = 'approved';
      await registrationRequest.save();
      
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Create new User entry
    const newUser = new User({
      name: registrationRequest.name,
      email: registrationRequest.email,
      password: registrationRequest.password, // Already hashed in RegistrationRequest
      role: 'Alumni',
      batch: registrationRequest.batchYear,
      branch: registrationRequest.branch,
      registered: true
    });
    
    await newUser.save();
    console.log(`[APPROVE-ALUMNI-REQUEST] Created user for: ${registrationRequest.email}`);
    
    // Update registration request status
    registrationRequest.status = 'approved';
    await registrationRequest.save();
    
    // Send approval email to alumni
    const approvalEmailContent = `
      <h2>Alumni Registration Approved</h2>
      <p>Dear ${registrationRequest.name},</p>
      <p>Your alumni registration has been approved. You can now log in to the PMTS system.</p>
      <p><a href="https://pmts-frontend-production.up.railway.app">Click here to login</a></p>
      <p>Thank you,<br>PMTS Team</p>
    `;
    
    await sendEmail(
      registrationRequest.email, 
      'Alumni Registration Approved', 
      approvalEmailContent
    );
    
    res.json({ 
      message: 'Registration approved and user created',
      userId: newUser._id
    });
  } catch (error) {
    console.error('[APPROVE-ALUMNI-REQUEST ERROR]', error);
    res.status(500).json({ message: 'Error approving registration request' });
  }
});

// Reject alumni registration request
router.put('/reject-alumni-request/:id', checkRole(['Advisor', 'Coordinator']), async (req, res) => {
  try {
    const requestId = req.params.id;
    
    // Find the registration request
    const registrationRequest = await RegistrationRequest.findById(requestId);
    
    if (!registrationRequest) {
      return res.status(404).json({ message: 'Registration request not found' });
    }
    
    // Verify the advisor's branch matches the request's branch
    if (req.user.branch !== registrationRequest.branch) {
      return res.status(403).json({ 
        message: 'You can only reject requests from your branch' 
      });
    }
    
    // Check if the request is still pending
    if (registrationRequest.status !== 'pending') {
      return res.status(400).json({ 
        message: `Request already ${registrationRequest.status}` 
      });
    }
    
    // Update registration request status
    registrationRequest.status = 'rejected';
    await registrationRequest.save();
    
    // Send rejection email to alumni
    const rejectionEmailContent = `
      <h2>Alumni Registration Request Rejected</h2>
      <p>Dear ${registrationRequest.name},</p>
      <p>We regret to inform you that your alumni registration request has been rejected. 
         If you believe this is an error, please contact your branch advisor.</p>
      <p>Thank you,<br>PMTS Team</p>
    `;
    
    await sendEmail(
      registrationRequest.email, 
      'Alumni Registration Request Rejected', 
      rejectionEmailContent
    );
    
    console.log(`[REJECT-ALUMNI-REQUEST] Rejected request for: ${registrationRequest.email}`);
    
    res.json({ message: 'Registration request rejected' });
  } catch (error) {
    console.error('[REJECT-ALUMNI-REQUEST ERROR]', error);
    res.status(500).json({ message: 'Error rejecting registration request' });
  }
});

module.exports = router;