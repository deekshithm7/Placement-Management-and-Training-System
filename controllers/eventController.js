const Event = require('../models/Event');
const User = require('../models/User');

// Get all events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new event
const createEvent = async (req, res) => {
  console.log('Received event data:', req.body); // Debugging log

  if (!req.body.title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const event = new Event(req.body);
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ message: error.message });
  }
};

 

// Register for an event
// backend/controllers/eventController.js
const registerEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const { studentId } = req.body;
    console.log('Received studentId:', studentId); // Add this line
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    if (event.registeredStudents.includes(studentId)) {
      return res.status(400).json({ message: 'Student already registered for this event' });
    }

    if (event.registeredStudents.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event has reached maximum capacity' });
    }

    const student = await User.findById(studentId);
    if (!student) {
      console.error(`Student with ID ${studentId} not found in the database`);
      return res.status(404).json({ message: 'Student not found' });
    }

    event.registeredStudents.push(studentId);
    const updatedEvent = await event.save();
    res.json({
      message: 'Registration successful',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get registered students for a specific event

const getRegisteredStudents = async (req, res) => {
  try {
    console.log(`Fetching event with ID: ${req.params.id}`);
    const event = await Event.findById(req.params.id);
    if (!event) {
      console.log("Event not found");
      return res.status(404).json({ message: 'Event not found' });
    }

    console.log("Event data:", event);

    const registeredStudents = await User.find(
      { _id: { $in: event.registeredStudents || [] } },
      'name registrationNumber branch batch phoneNumber email'
    );

    console.log("Registered students:", registeredStudents);

    res.json({
      event: {
        title: event.title || "N/A",
        date: event.date || "N/A",
        time: event.time || "N/A",
        venue: event.venue || "N/A",
        mentor: event.mentor || "N/A"
      },
      students: registeredStudents
    });
  } catch (error) {
    console.error("Error fetching registered students:", error);
    res.status(500).json({ message: error.message });
  }
};


// Unregister a student from an event
const unregisterStudent = async (req, res) => {
  try {
    const { eventId, studentId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const studentIndex = event.registeredStudents.indexOf(studentId);
    if (studentIndex === -1) return res.status(400).json({ message: 'Student not registered for this event' });

    event.registeredStudents.splice(studentIndex, 1);
    const updatedEvent = await event.save();

    res.json({ message: 'Student unregistered successfully', event: updatedEvent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEvents,
  createEvent,
  registerEvent,
  updateEvent,
  deleteEvent,
  getRegisteredStudents,
  unregisterStudent
};