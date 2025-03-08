// backend/routes/addStudent.js
const express = require('express');
const router = express.Router();
const {
  addStudentsSingle,
  addStudentsBulk,
  getStudentUploadTemplate,
  getStudentById,
  updateStudent,
  listStudents,
  editStudentsBulk,
  editStudentUploadTemplate
} = require('../controllers/addStudentController');
const { isAuthenticated, checkRole } = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer storage
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        message: 'File too large. Maximum size is 5MB.' 
      });
    }
    return res.status(400).json({
      message: `File upload error: ${err.message}`
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(400).json({
      message: err.message || 'File upload error'
    });
  }
  next();
};

// Single student operations
router.post('/add', 
  isAuthenticated, 
  checkRole(['Advisor']), 
  addStudentsSingle
);

// Get student by ID (for editing)
router.get('/students/:id',
  isAuthenticated,
  checkRole(['Advisor']),
  getStudentById
);

// Update single student
router.put('/edit/:id',
  isAuthenticated,
  checkRole(['Advisor']),
  updateStudent
);

// List students for advisor
router.get('/list',
  isAuthenticated,
  checkRole(['Advisor']),
  listStudents
);

// Bulk operations
router.post('/bulk-add', 
  isAuthenticated, 
  checkRole(['Advisor']), 
  upload.single('studentFile'), 
  handleMulterError,
  addStudentsBulk
);

router.post('/bulk-edit', 
  isAuthenticated, 
  checkRole(['Advisor']), 
  upload.single('studentFile'), 
  handleMulterError,
  editStudentsBulk
);

// Templates
router.get('/upload-template', 
  isAuthenticated, 
  checkRole(['Advisor']), 
  getStudentUploadTemplate
);

router.get('/edit-template', 
  isAuthenticated, 
  checkRole(['Advisor']), 
  editStudentUploadTemplate
);

module.exports = router;