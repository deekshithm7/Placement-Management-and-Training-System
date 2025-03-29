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
} = require('../controllers/placementDriveController');
const { isAuthenticated, checkRole } = require('../middleware/authMiddleware');
const multer = require('multer');
const PlacementDrive = require('../models/PlacementDrive'); // Import the model
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
// backend/routes/studentRoutes.js (assumed file)
router.get('/placements/me', isAuthenticated, checkRole(['Student']), async (req, res) => {
  try {
    const studentId = req.user._id;
    const placementDrives = await PlacementDrive.find({ 'applications.student': studentId })
      .populate('applications.student', 'name email registrationNumber')
      .populate('phases.shortlistedStudents', 'name email registrationNumber');

    const drivesWithDetails = placementDrives.map(drive => {
      const currentPhase = drive.phases.length > 0 ? drive.phases[drive.phases.length - 1] : null;
      const studentApp = drive.applications.find(app => app.student._id.equals(studentId));
      const studentPhaseStatus = currentPhase 
        ? (currentPhase.shortlistedStudents.some(s => s._id.equals(studentId)) ? 'Shortlisted' : 'Rejected') 
        : null;

      return {
        ...drive.toObject(),
        status: studentApp ? studentApp.status : 'Not Applied',
        currentPhase: currentPhase ? {
          name: currentPhase.name,
          createdAt: currentPhase.createdAt,
          requirements: currentPhase.requirements,
          instructions: currentPhase.instructions,
        } : null,
        studentPhaseStatus,
      };
    });

    res.status(200).json({ eligibleDrives: drivesWithDetails });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student drives', error: error.message });
  }
});
module.exports = router;