const Resource = require('../models/Resource');
const fs = require('fs');

// Create a new resource
exports.createResource = async (req, res) => {
  try {
    const { title, description, type, url } = req.body;
    
    const resourceData = {
      title,
      description,
      type
    };

    if (type === 'link') {
      resourceData.url = url;
    } else if (req.file) {
      resourceData.fileName = req.file.filename;
      resourceData.filePath = req.file.path;
      resourceData.originalFileName = req.file.originalname;
      resourceData.fileSize = req.file.size;
      resourceData.mimeType = req.file.mimetype;
    }

    const resource = new Resource(resourceData);
    await resource.save();

    res.status(201).json({ resource });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all resources
exports.getAllResources = async (req, res) => {
  try {
    
    const resources = await Resource.find().sort({ uploadDate: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Download a resource
exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.type === 'link') {
      return res.redirect(resource.url);
    }

    res.download(resource.filePath, resource.originalFileName);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a resource
exports.updateResource = async (req, res) => {
  try {
    const { title, description, type, url } = req.body;
    const resourceId = req.params.id;

    const existingResource = await Resource.findById(resourceId);
    if (!existingResource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    existingResource.title = title;
    existingResource.description = description;
    existingResource.type = type;

    if (req.file) {
      if (existingResource.filePath) {
        try {
          fs.unlinkSync(existingResource.filePath);
        } catch (fileError) {
          console.warn('Could not delete old file:', fileError);
        }
      }

      existingResource.fileName = req.file.filename;
      existingResource.filePath = req.file.path;
      existingResource.originalFileName = req.file.originalname;
      existingResource.fileSize = req.file.size;
      existingResource.mimeType = req.file.mimetype;
    }

    if (type === 'link') {
      existingResource.url = url;
      existingResource.fileName = undefined;
      existingResource.filePath = undefined;
      existingResource.originalFileName = undefined;
      existingResource.fileSize = undefined;
      existingResource.mimeType = undefined;
    }

    await existingResource.save();
    res.json(existingResource);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a resource
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.filePath) {
      try {
        fs.unlinkSync(resource.filePath);
      } catch (fileError) {
        console.warn('Could not delete file:', fileError);
      }
    }

    await Resource.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};