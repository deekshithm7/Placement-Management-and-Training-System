const Event = require('../models/Event');
const User = require('../models/User');
const axios = require('axios');

// Helper function to send email
const sendEmail = async (recipient, subject, htmlContent) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'PMTS', email: process.env.BREVO_EMAIL },
        to: [{ email: recipient }],
        subject,
        htmlContent,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`[EMAIL] Sent to ${recipient}: ${subject}`);
    return response.data;
  } catch (error) {
    console.error('[EMAIL ERROR]', error.response?.data || error.message);
    throw new Error('Failed to send email');
  }
};

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
  console.log('Received event data:', req.body);

  const { title, mentor, description, date, time, venue, maxParticipants } = req.body;
  if (!title || !mentor || !description || !date || !time || !venue) {
    return res.status(400).json({ 
      message: 'All fields (title, mentor, description, date, time, venue) are required' 
    });
  }

  try {
    const event = new Event({ 
      title, 
      mentor, 
      description, 
      date, 
      time, 
      venue, 
      maxParticipants // Optional, defaults to 100 if not provided
    });
    const savedEvent = await event.save();

    // Notify all students
    const students = await User.find({ role: 'Student' });
    if (students.length > 0) {
      await User.updateMany(
        { role: 'Student' },
        {
          $push: {
            notifications: {
              message: `New event: ${savedEvent.title}`,
              type: 'info',
              link: `/student/events`,
              relatedId: savedEvent._id,
            },
          },
        }
      );

      const eventDate = new Date(savedEvent.date);
      const formattedDate = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const emailPromises = students.map(student =>
        sendEmail(
          student.email,
          `New Event: ${savedEvent.title}`,
          `<!DOCTYPE html>
<html>
<head><title>New Event Announcement</title></head>
<body>
    <div style="text-align:center; padding:20px; font-family:Arial,sans-serif;">
        <h2>New Event Announcement</h2>
        <p>A new event has been scheduled. Check out the details below!</p>
        
        <div style="background-color:#f5f5f5; padding:15px; border-radius:5px; margin:20px 0; text-align:left;">
            <h3 style="color:#3366cc;">${savedEvent.title}</h3>
            <p><strong>Mentor:</strong> ${savedEvent.mentor}</p>
            <p><strong>Description:</strong> ${savedEvent.description}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${savedEvent.time}</p>
            <p><strong>Venue:</strong> ${savedEvent.venue}</p>
            <p><strong>Maximum Participants:</strong> ${savedEvent.maxParticipants}</p>
        </div>
        
        <p>To register for this event, please log in to your PMTS dashboard.</p>
        <p>Don't miss this opportunity!</p>
    </div>
</body>
</html>`
        )
      );
      await Promise.all(emailPromises);
    }

    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ message: error.message });
  }
};

// Register for an event
const registerEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const { studentId } = req.body;
    console.log('Received studentId:', studentId);
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

    await User.updateOne(
      { _id: studentId },
      {
        $push: {
          notifications: {
            message: `Registered for event: ${event.title}`,
            type: 'success',
            link: '/student/events',
            relatedId: event._id,
          },
        },
      }
    );
    await sendEmail(
      student.email,
      `Event Registration: ${event.title}`,
      `
        <h2>Registration Confirmed</h2>
        <p>You have successfully registered for:</p>
        <h3>${event.title}</h3>
        <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${event.time}</p>
        <p><strong>Venue:</strong> ${event.venue}</p>
        <p>See you there!</p>
      `
    );

    res.json({
      message: 'Registration successful',
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const students = await User.find({ _id: { $in: event.registeredStudents } });
    if (students.length > 0) {
      await User.updateMany(
        { _id: { $in: event.registeredStudents } },
        {
          $push: {
            notifications: {
              message: `Event updated: ${event.title}`,
              type: 'info',
              link: '/student/events',
              relatedId: event._id,
            },
          },
        }
      );

      const emailPromises = students.map(student =>
        sendEmail(
          student.email,
          `Event Update: ${event.title}`,
          `
            <h2>Event Update</h2>
            <p>The event <strong>${event.title}</strong> has been updated:</p>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${event.time}</p>
            <p><strong>Venue:</strong> ${event.venue}</p>
            <p><strong>Description:</strong> ${event.description}</p>
            <p>Check your dashboard for details!</p>
          `
        )
      );
      await Promise.all(emailPromises);
    }

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

    const students = await User.find({ _id: { $in: event.registeredStudents } });
    if (students.length > 0) {
      await User.updateMany(
        { _id: { $in: event.registeredStudents } },
        {
          $push: {
            notifications: {
              message: `Event cancelled: ${event.title}`,
              type: 'warning',
              link: '/student/events',
              relatedId: event._id,
            },
          },
        }
      );

      const emailPromises = students.map(student =>
        sendEmail(
          student.email,
          `Event Cancelled: ${event.title}`,
          `
            <h2>Event Cancellation</h2>
            <p>The event <strong>${event.title}</strong> has been cancelled.</p>
            <p>We apologize for the inconvenience.</p>
          `
        )
      );
      await Promise.all(emailPromises);
    }

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
      console.log('Event not found');
      return res.status(404).json({ message: 'Event not found' });
    }

    console.log('Event data:', event);

    const registeredStudents = await User.find(
      { _id: { $in: event.registeredStudents || [] } },
      'name registrationNumber branch batch phoneNumber email'
    );

    console.log('Registered students:', registeredStudents);

    res.json({
      event: {
        title: event.title,
        date: event.date,
        time: event.time,
        venue: event.venue,
        mentor: event.mentor,
        maxParticipants: event.maxParticipants
      },
      students: registeredStudents,
    });
  } catch (error) {
    console.error('Error fetching registered students:', error);
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

    const student = await User.findById(studentId);
    if (student) {
      await User.updateOne(
        { _id: studentId },
        {
          $push: {
            notifications: {
              message: `Unregistered from event: ${event.title}`,
              type: 'info',
              link: '/student/events',
              relatedId: event._id,
            },
          },
        }
      );
      await sendEmail(
        student.email,
        `Event Unregistration: ${event.title}`,
        `
          <h2>Unregistration Confirmed</h2>
          <p>You have been unregistered from <strong>${event.title}</strong>.</p>
          <p>Check your dashboard for other events!</p>
        `
      );
    }

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
  unregisterStudent,
};