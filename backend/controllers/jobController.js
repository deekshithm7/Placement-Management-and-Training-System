// backend/controllers/jobController.js
const Job = require('../models/Job');
const User = require('../models/User');
const axios = require('axios');

// Helper function to send email (reusing logic from placementDriveController)
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

// Get all jobs
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get job by ID
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Create a new job
const createJob = async (req, res) => {
  try {
    const { title, company, description, applyUrl, applicationDeadline } = req.body;
    
    const existingJob = await Job.findOne({ title, company });
    if (existingJob) {
      return res.status(400).json({ 
        msg: 'A job with this title from the same company already exists', 
        existingJobId: existingJob._id 
      });
    }
    const newJob = new Job({
      title,
      company,
      description,
      applyUrl,
      applicationDeadline,
    });

    const job = await newJob.save();

    // Notify all students
    const students = await User.find({ role: 'Student' });
    if (students.length > 0) {
      // Add notification to database
      await User.updateMany(
        { role: 'Student' },
        {
          $push: {
            notifications: {
              message: `New job opportunity: ${title} at ${company}`,
              type: 'info',
              link: `/student/jobs/${job._id}`,
              relatedId: job._id,
            },
          },
        }
      );

      // Send emails to students
      const emailPromises = students.map(student =>
        sendEmail(
          student.email,
          `New Job Opportunity: ${title} at ${company}`,
          `
            <h2>New Job Posting</h2>
            <p>A new job opportunity has been posted:</p>
            <h3>${title} at ${company}</h3>
            <p><strong>Description:</strong> ${description || 'N/A'}</p>
            <p><strong>Apply URL:</strong> <a href="${applyUrl}">${applyUrl}</a></p>
            <p><strong>Deadline:</strong> ${new Date(applicationDeadline).toLocaleDateString()}</p>
            <p>Check your dashboard for more details!</p>
          `
        )
      );
      await Promise.all(emailPromises);
    }

    res.json({ success: true, job });
  } catch (err) {
    console.error(err.message);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ errors: messages });
    }
    res.status(500).send('Server Error');
  }
};

// Update a job
const updateJob = async (req, res) => {
  try {
    const { title, company, description, applyUrl, applicationDeadline } = req.body;

    const jobFields = {};
    if (title) jobFields.title = title;
    if (company) jobFields.company = company;
    if (description) jobFields.description = description;
    if (applyUrl) jobFields.applyUrl = applyUrl;
    if (applicationDeadline) jobFields.applicationDeadline = applicationDeadline;
    jobFields.updatedAt = Date.now();

    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, { $set: jobFields }, { new: true });

    // Notify students of update
    const students = await User.find({ role: 'Student' });
    if (students.length > 0) {
      await User.updateMany(
        { role: 'Student' },
        {
          $push: {
            notifications: {
              message: `Job updated: ${title} at ${company}`,
              type: 'info',
              link: `/student/jobs/${job._id}`,
              relatedId: job._id,
            },
          },
        }
      );

      const emailPromises = students.map(student =>
        sendEmail(
          student.email,
          `Job Updated: ${title} at ${company}`,
          `
            <h2>Job Update</h2>
            <p>The following job has been updated:</p>
            <h3>${title} at ${company}</h3>
            <p><strong>Description:</strong> ${description || 'N/A'}</p>
            <p><strong>Apply URL:</strong> <a href="${applyUrl}">${applyUrl}</a></p>
            <p><strong>Deadline:</strong> ${new Date(applicationDeadline).toLocaleDateString()}</p>
            <p>Check your dashboard for the latest details!</p>
          `
        )
      );
      await Promise.all(emailPromises);
    }

    res.json(job);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ errors: messages });
    }
    res.status(500).send('Server Error');
  }
};

// Delete a job
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    await job.deleteOne();
    res.json({ msg: 'Job removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};