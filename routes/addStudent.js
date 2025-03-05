// backend/routes/addStudent.js
const express = require('express');
const router = express.Router();
const { 
  addStudentsSingle, 
  addStudentsBulk, 
  getStudentUploadTemplate 
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

router.post('/add', isAuthenticated, checkRole(['Advisor']), addStudentsSingle);
router.post('/bulk-add', isAuthenticated, checkRole(['Advisor']), upload.single('studentFile'), addStudentsBulk);
router.get('/upload-template', isAuthenticated, checkRole(['Advisor']), getStudentUploadTemplate);

module.exports = router;