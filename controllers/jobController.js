const Job = require('../models/Job');

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
    
    const newJob = new Job({
      title,
      company,
      description,
      applyUrl,
      applicationDeadline
    });
    
    const job = await newJob.save();
    
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
    
    // Build job object
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
    
    // Update
    job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: jobFields },
      { new: true }
    );
    
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
  deleteJob
};