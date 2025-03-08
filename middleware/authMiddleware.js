// backend/middleware/authMiddleware.js
const checkRole = (roles) => {
  return (req, res, next) => {
    console.log('Role Check:', {
      requiredRoles: roles,
      userRole: req.user ? req.user.role : 'No user',
      isAuthenticated: req.isAuthenticated()
    });

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized.(role) Please log in.' });
    }

    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden. Insufficient permissions.' });
    }

    next();
  };
};

// Passport handles session authentication automatically
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized. Please log in.' });
};

module.exports = { isAuthenticated, checkRole };