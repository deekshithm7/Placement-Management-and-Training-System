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

// backend/routes/eventRoutes.js
const Event = require('../models/Event');

router.get('/public', async (req, res) => {
  try {
    const currentDate = new Date();
    const events = await Event.find({
      date: { $gte: currentDate }, // Upcoming events
    })
      .select('title mentor date time venue maxParticipants registeredStudents') // Select only necessary fields
      .lean();

    // Calculate status and limit exposed data
    const eventsWithStatus = events.map(event => ({
      title: event.title,
      mentor: event.mentor,
      date: event.date,
      time: event.time,
      venue: event.venue,
      participantsRegistered: event.registeredStudents.length,
      maxParticipants: event.maxParticipants,
      status: new Date(event.date) > currentDate ? 'Upcoming' : 'Ongoing',
    }));

    res.json(eventsWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', isAuthenticated, checkRole(["Coordinator","Alumni"]), updateEvent);

router.get('/',isAuthenticated,checkRole(['Student', "Coordinator","Alumni"]), getEvents); // Public route
router.post('/', isAuthenticated, checkRole(["Coordinator","Alumni"]), createEvent);
router.put('/register/:id', isAuthenticated, checkRole(['Student', "Coordinator"]), registerEvent);
router.delete('/:id', isAuthenticated, checkRole(["Coordinator","Alumni"]), deleteEvent);
router.get('/:id/registrations', isAuthenticated, checkRole(["Coordinator","Alumni"]), getRegisteredStudents);
router.delete('/:eventId/registrations/:studentId', isAuthenticated,checkRole(["Student", "Coordinator"]), unregisterStudent);


module.exports = router;