const express = require('express');
const router = express.Router();
const { 
  getEvents, 
  createEvent, 
  registerEvent,
  updateEvent,
  deleteEvent,
  getRegisteredStudents,
  unregisterStudent
} = require('../controllers/eventController');
const { isAuthenticated, checkRole } = require('../middleware/authMiddleware');

router.put('/:id', isAuthenticated, checkRole(["Coordinator","Alumni"]), updateEvent);

router.get('/',isAuthenticated,checkRole(['Student', "Coordinator","Alumni"]), getEvents); // Public route
router.post('/', isAuthenticated, checkRole(["Coordinator","Alumni"]), createEvent);
router.put('/register/:id', isAuthenticated, checkRole(['Student', "Coordinator"]), registerEvent);
router.delete('/:id', isAuthenticated, checkRole(["Coordinator","Alumni"]), deleteEvent);
router.get('/:id/registrations', isAuthenticated, checkRole(["Coordinator","Alumni"]), getRegisteredStudents);
router.delete('/:eventId/registrations/:studentId', isAuthenticated,checkRole(["Student", "Coordinator"]), unregisterStudent);



module.exports = router;