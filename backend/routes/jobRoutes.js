const express = require('express');
const { 
  getJobs, 
  getJobById, 
  createJob, 
  updateJob, 
  deleteJob 
} = require('../controllers/jobController');
const { isAuthenticated, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET api/jobs
// @desc    Get all jobs
// @access  Public
router.get('/',isAuthenticated,checkRole(["Alumni","Student"]), getJobs);

// @route   GET api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get('/:id',isAuthenticated,checkRole(["Alumni","Student"]), getJobById);

// @route   POST api/jobs
// @desc    Create a job
// @access  Private (in a real app, you'd add auth middleware)
router.post('/',isAuthenticated,checkRole(["Alumni"]), createJob);

// @route   PUT api/jobs/:id
// @desc    Update a job
// @access  Private (in a real app, you'd add auth middleware)
router.put('/:id',isAuthenticated,checkRole(["Alumni"]), updateJob);

// @route   DELETE api/jobs/:id
// @desc    Delete a job
// @access  Private (in a real app, you'd add auth middleware)
router.delete('/:id',isAuthenticated,checkRole(["Alumni"]), deleteJob);

module.exports = router;