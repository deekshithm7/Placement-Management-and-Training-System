const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register user
router.post('/register', auth, authController.register);

// Google sign-in
router.post('/google-signin', auth, authController.googleSignIn);

// Get current user
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;