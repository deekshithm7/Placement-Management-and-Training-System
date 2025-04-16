const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const resourceController = require('../controllers/resourceController');
const { isAuthenticated, checkRole } = require('../middleware/authMiddleware');

// Create a new resource
router.post('/',isAuthenticated,checkRole(["Coordinator","Alumni"]), 
   upload.single('file'), resourceController.createResource);

// Get all resources
router.get('/',isAuthenticated,checkRole(["Coordinator","Alumni","Student"]), resourceController.getAllResources);

// Download a resource
router.get('/download/:id',isAuthenticated,checkRole(["Coordinator","Alumni","Student"]), resourceController.downloadResource);

// Update a resource
router.put('/:id',isAuthenticated,checkRole(["Coordinator","Alumni"]), upload.single('file'), resourceController.updateResource);

// Delete a resource
router.delete('/:id',isAuthenticated,checkRole(["Coordinator","Alumni"]), resourceController.deleteResource);

module.exports = router;