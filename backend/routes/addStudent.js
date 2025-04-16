const express = require('express');
const router = express.Router();
const { 
  addStudentsSingle, 
  addStudentsBulk, 
  getStudentUploadTemplate,
  getStudentById,
  listStudents,
  updateStudent,
  editStudentsBulk,
  editStudentUploadTemplate,
  getCurrentStudent
} = require('../controllers/addStudentController');
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

router.post('/add', isAuthenticated, checkRole(['Advisor']), addStudentsSingle);
router.post('/bulk-add', isAuthenticated, checkRole(['Advisor']), upload.single('studentFile'), addStudentsBulk);
router.get('/upload-template', isAuthenticated, checkRole(['Advisor']), getStudentUploadTemplate);
router.get('/students/:id', isAuthenticated, checkRole(['Advisor']), getStudentById);
router.get('/list', isAuthenticated, checkRole(['Advisor']), listStudents);
router.put('/edit/:id', isAuthenticated, checkRole(['Advisor']), updateStudent);
router.post('/bulk-edit', isAuthenticated, checkRole(['Advisor']), upload.single('studentFile'), editStudentsBulk);
router.get('/edit-template', isAuthenticated, checkRole(['Advisor']), editStudentUploadTemplate);


module.exports = router;