const User = require('../models/User');

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, uid } = req.body;

    // Check if user with this UID exists
    let user = await User.findOne({ uid });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      uid
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Google sign-in
exports.googleSignIn = async (req, res) => {
  try {
    const { name, email, uid, photoURL } = req.body;

    // Check if user exists
    let user = await User.findOne({ uid });

    if (user) {
      // Update existing user info if needed
      user.name = name || user.name;
      user.email = email || user.email;
      user.photoURL = photoURL || user.photoURL;
      await user.save();
    } else {
      // Create new user
      user = new User({
        name,
        email,
        uid,
        photoURL
      });
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
