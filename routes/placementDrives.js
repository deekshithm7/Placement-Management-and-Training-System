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
const PlacementDrive = require('../models/PlacementDrive');
const User = require('../models/User');

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

// Public route
router.get('/public', async (req, res) => {
  try {
    const currentDate = new Date();
    const placementDrives = await PlacementDrive.find({
      date: { $gte: currentDate }, // Upcoming drives
      status: { $in: ['Open', 'In Progress'] }, // Only active drives
    })
      .select('companyName role date eligibleBranches minCGPA status')
      .lean();

    const drivesWithStatus = placementDrives.map(drive => ({
      companyName: drive.companyName,
      role: drive.role,
      date: drive.date,
      eligibleBranches: drive.eligibleBranches,
      minCGPA: drive.minCGPA,
      status: drive.status === 'Open' && new Date(drive.date) > currentDate ? 'Upcoming' : 'Ongoing',
    }));

    res.json(drivesWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Coordinator routes
router.post('/create', isAuthenticated, checkRole(['Coordinator']), createPlacementDrive);
router.get('/all', isAuthenticated, checkRole(['Coordinator']), getAllPlacementDrives);
router.get('/:id', isAuthenticated, checkRole(['Coordinator']), getPlacementDriveById);
router.post(
  '/:id/add-phase',
  isAuthenticated,
  checkRole(['Coordinator']),
  upload.fields([
    { name: 'shortlistFile', maxCount: 1 },
    { name: 'unattendedFile', maxCount: 1 }
  ]),
  addPhaseToDrive
);
router.post(
  '/:id/end',
  isAuthenticated,
  checkRole(['Coordinator']),
  upload.fields([{ name: 'shortlistFile', maxCount: 1 }]), // Updated line
  endPlacementDrive
);

// Student routes
router.post('/apply/:id', isAuthenticated, checkRole(['Student']), applyToPlacementDrive);
router.get('/student/:id', isAuthenticated, checkRole(['Student']), getPlacementDriveById);

router.put('/status/:driveId/:studentId', isAuthenticated, checkRole(['Coordinator']), updateApplicationStatus);

router.post('/template', isAuthenticated, checkRole(['Coordinator']), getShortlistTemplate);

router.get('/placements/me', isAuthenticated, checkRole(['Student']), async (req, res) => {
  try {
    const studentId = req.user._id;
    
    const user = await User.findById(studentId)
      .populate('eligibleDrives')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const appliedDrives = await PlacementDrive.find({ 'applications.student': studentId })
      .populate('applications.student', 'name email registrationNumber')
      .populate('phases.shortlistedStudents', 'name email registrationNumber');
    
    const appliedDrivesMap = new Map();
    appliedDrives.forEach(drive => {
      const currentPhase = drive.phases.length > 0 ? drive.phases[drive.phases.length - 1] : null;
      const studentApp = drive.applications.find(app => app.student._id.equals(studentId));
      const studentPhaseStatus = currentPhase 
        ? (currentPhase.shortlistedStudents.some(s => s._id.equals(studentId)) ? 'Shortlisted' : 'Rejected') 
        : null;
      
      appliedDrivesMap.set(drive._id.toString(), {
        ...drive.toObject(),
        status: studentApp ? studentApp.status : 'Applied',
        currentPhase: currentPhase ? {
          name: currentPhase.name,
          createdAt: currentPhase.createdAt,
          requirements: currentPhase.requirements,
          instructions: currentPhase.instructions,
        } : null,
        studentPhaseStatus,
      });
    });
    
    const eligibleDrivesProcessed = user.eligibleDrives.map(drive => {
      const driveId = drive._id.toString();
      if (appliedDrivesMap.has(driveId)) {
        return appliedDrivesMap.get(driveId);
      }
      
      return {
        ...drive,
        status: 'Not Applied',
        currentPhase: null,
        studentPhaseStatus: null
      };
    });
    
    res.status(200).json({ eligibleDrives: eligibleDrivesProcessed });
  } catch (error) {
    console.error('Error in /placements/me:', error);
    res.status(500).json({ message: 'Error fetching student drives', error: error.message });
  }
});

router.get('/student/email/:email', isAuthenticated, checkRole(['Coordinator']), async (req, res) => {
  try {
    const { email } = req.params;
    const student = await User.findOne({ email, role: 'Student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student', error: error.message });
  }
});

module.exports = router;