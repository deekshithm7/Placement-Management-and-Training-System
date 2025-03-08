const PlacementDrive = require('../models/PlacementDrive');
const User = require('../models/User');

exports.createPlacementDrive = async (req, res) => {
  const {
    companyName,
    role,
    description,
    minCGPA,
    maxBacklogs,
    eligibleBranches,
    minSemestersCompleted,
    date
  } = req.body;

  try {
    if (!companyName || !role || !date || !eligibleBranches || !Array.isArray(eligibleBranches)) {
      return res.status(400).json({ message: 'Missing or invalid required fields' });
    }

    const placementDrive = new PlacementDrive({
      companyName,
      role,
      description,
      minCGPA: minCGPA || 0,
      maxBacklogs: maxBacklogs || 0,
      eligibleBranches,
      minSemestersCompleted: minSemestersCompleted || 0,
      date,
      createdBy: req.user._id,
      applications: []
    });

    await placementDrive.save();

    const eligibleStudents = await User.find({
      role: 'Student',
      branch: { $in: eligibleBranches },
      cgpa: { $gte: minCGPA || 0 },
      numberOfBacklogs: { $lte: maxBacklogs || 0 },
      semestersCompleted: { $gte: minSemestersCompleted || 0 }
    });

    await User.updateMany(
      { _id: { $in: eligibleStudents.map(student => student._id) } },
      { $addToSet: { eligibleDrives: placementDrive._id } }
    );

    res.status(201).json({
      message: 'Placement drive created successfully',
      placementDrive,
      eligibleStudentsCount: eligibleStudents.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating placement drive', error: error.message });
  }
};

exports.getAllPlacementDrives = async (req, res) => {
  try {
    const placementDrives = await PlacementDrive.find()
      .populate('createdBy', 'name email')
      .populate('applications.student', 'name email registrationNumber');
    res.status(200).json(placementDrives);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching placement drives', error: error.message });
  }
};

exports.getPlacementDriveById = async (req, res) => {
  const { id } = req.params;

  try {
    const placementDrive = await PlacementDrive.findById(id)
      .populate('createdBy', 'name email')
      .populate('applications.student', 'name email registrationNumber');
    if (!placementDrive) {
      return res.status(404).json({ message: 'Placement drive not found' });
    }
    res.status(200).json(placementDrive);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching placement drive', error: error.message });
  }
};

exports.applyToPlacementDrive = async (req, res) => {
  const { id } = req.params;

  try {
    const placementDrive = await PlacementDrive.findById(id);
    if (!placementDrive) {
      return res.status(404).json({ message: 'Placement drive not found' });
    }

    const student = req.user;
    if (!placementDrive.eligibleBranches.includes(student.branch) ||
        (student.cgpa || 0) < placementDrive.minCGPA ||
        (student.numberOfBacklogs || 0) > placementDrive.maxBacklogs ||
        (student.semestersCompleted || 0) < placementDrive.minSemestersCompleted) {
      return res.status(403).json({ message: 'You are not eligible for this placement drive' });
    }

    if (placementDrive.applications.some(app => app.student.equals(student._id))) {
      return res.status(400).json({ message: 'You have already applied to this placement drive' });
    }

    placementDrive.applications.push({ student: student._id });
    await placementDrive.save();

    await User.findByIdAndUpdate(student._id, { $addToSet: { eligibleDrives: placementDrive._id } });

    res.status(200).json({ message: 'Successfully applied to placement drive' });
  } catch (error) {
    res.status(500).json({ message: 'Error applying to placement drive', error: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  const { driveId, studentId } = req.params;
  const { status } = req.body;

  try {
    if (!['Applied', 'Interview', 'Selected', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const placementDrive = await PlacementDrive.findById(driveId);
    if (!placementDrive) {
      return res.status(404).json({ message: 'Placement drive not found' });
    }

    const application = placementDrive.applications.find(app => app.student.equals(studentId));
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    application.updatedAt = new Date();
    await placementDrive.save();

    res.status(200).json({ message: 'Application status updated successfully', placementDrive });
  } catch (error) {
    res.status(500).json({ message: 'Error updating application status', error: error.message });
  }
};