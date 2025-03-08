const express = require('express');
const router = express.Router();
const {
  createPlacementDrive,
  getAllPlacementDrives,
  getPlacementDriveById,
  applyToPlacementDrive,
  updateApplicationStatus,
} = require('../controllers/placementDriveController');
const { isAuthenticated, checkRole } = require('../middleware/authMiddleware');

// Coordinator routes
router.post('/create', isAuthenticated, checkRole(['Coordinator']), createPlacementDrive);
router.get('/all', isAuthenticated, checkRole(['Coordinator']), getAllPlacementDrives);
router.get('/:id', isAuthenticated, checkRole(['Coordinator']), getPlacementDriveById);

// Student routes
router.post('/apply/:id', isAuthenticated, checkRole(['Student']), applyToPlacementDrive);
router.get('/student/:id', isAuthenticated, checkRole(['Student']), getPlacementDriveById);

router.put('/status/:driveId/:studentId', isAuthenticated, checkRole(['Coordinator']), updateApplicationStatus);

module.exports = router;