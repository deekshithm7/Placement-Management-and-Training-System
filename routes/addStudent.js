// backend/routes/addStudent.js
const express = require('express');
const router = express.Router();
const { 
  addStudentsSingle, 
  addStudentsBulk, 
  getStudentUploadTemplate ,
  getStudentById, 
  updateStudent, 
  listStudents 
} = require('../controllers/addStudentController');
const { isAuthenticated, checkRole } = require('../middleware/authMiddleware');
const multer = require('multer');


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

// Get student by ID (for editing)
router.get('/students/:id', 
  isAuthenticated, 
  checkRole(['Advisor']), 
  getStudentById
);

// Update student
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

router.post('/add', isAuthenticated, checkRole(['Advisor']), addStudentsSingle);
router.post('/bulk-add', isAuthenticated, checkRole(['Advisor']), upload.single('studentFile'), addStudentsBulk);
router.get('/upload-template', isAuthenticated, checkRole(['Advisor']), getStudentUploadTemplate);

module.exports = router;