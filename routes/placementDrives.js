const express = require('express');
const router = express.Router();
const {
  createPlacementDrive,
  getAllPlacementDrives,
  getPlacementDriveById,
  applyToPlacementDrive,
  updateApplicationStatus,
  addPhaseToDrive,
  endPlacementDrive,
  getShortlistTemplate
} = require('../controllers/PlacementDriveController');
const { isAuthenticated, checkRole } = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  }
});

// Coordinator routes
router.post('/create', isAuthenticated, checkRole(['Coordinator']), createPlacementDrive);
router.get('/all', isAuthenticated, checkRole(['Coordinator']), getAllPlacementDrives);
router.get('/:id', isAuthenticated, checkRole(['Coordinator']), getPlacementDriveById);
router.post('/:id/add-phase', isAuthenticated, checkRole(['Coordinator']), upload.single('shortlistFile'), addPhaseToDrive);
router.post('/:id/end', isAuthenticated, checkRole(['Coordinator']), upload.single('shortlistFile'), endPlacementDrive);

// Student routes
router.post('/apply/:id', isAuthenticated, checkRole(['Student']), applyToPlacementDrive);
router.get('/student/:id', isAuthenticated, checkRole(['Student']), getPlacementDriveById);

router.put('/status/:driveId/:studentId', isAuthenticated, checkRole(['Coordinator']), updateApplicationStatus);
router.post('/template', isAuthenticated, checkRole(['Coordinator']), getShortlistTemplate);

module.exports = router;