const PlacementDrive = require('../models/PlacementDrive');
const User = require('../models/User');
const xlsx = require('xlsx');
const axios = require('axios');

axios.defaults.baseURL = 'http://localhost:8080'; // Ensure consistency

const sendPhaseEmail = async (students, phaseName, companyName, role, requirements, instructions) => {
  const studentEmails = students.map(student => student.email);
  try {
    const response = await axios.post('/api/email/send-email', {
      to: studentEmails,
      subject: `Shortlisted for ${phaseName} - ${companyName} (${role})`,
      text: `Dear Student,\n\nYou have been shortlisted for the ${phaseName} phase of the placement drive for ${companyName} (${role}).\n\nRequirements: ${requirements || 'None specified'}\nInstructions: ${instructions || 'None specified'}\n\nBest of luck!\nPlacement Team`,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send phase email:', error.message);
    return null;
  }
};

const sendStatusEmail = async (students, status, companyName, role, requirements, instructions) => {
  const studentEmails = students.map(student => student.email);
  try {
    const subject = status === 'Selected' 
      ? `Congratulations! Selected for ${companyName} (${role})` 
      : `Update: ${companyName} (${role}) Application Status`;
    const text = status === 'Selected'
      ? `Dear Student,\n\nCongratulations! You have been selected for ${companyName} (${role}).\n\nRequirements: ${requirements || 'None specified'}\nInstructions: ${instructions || 'None specified'}\n\nBest regards,\nPlacement Team`
      : `Dear Student,\n\nWe regret to inform you that you have not been selected for ${companyName} (${role}) at this stage.\n\nBest regards,\nPlacement Team`;
    const response = await axios.post('/api/email/send-email', {
      to: studentEmails,
      subject,
      text,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to send ${status} status email:`, error.message);
    return null;
  }
};

const sendApplicationEmail = async (student, placementDrive) => {
  try {
    const response = await axios.post('/api/email/send-email', {
      to: [student.email],
      subject: `Application Submitted for ${placementDrive.companyName} (${placementDrive.role})`,
      text: `Dear ${student.name},\n\nYour application for ${placementDrive.companyName} (${placementDrive.role}) has been successfully submitted.\n\nBest of luck!\nPlacement Team`,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send application email:', error.message);
    return null;
  }
};

const sendDriveCreationEmail = async (students, placementDrive) => {
  const studentEmails = students.map(student => student.email);
  try {
    const response = await axios.post('/api/email/send-email', {
      to: studentEmails,
      subject: `New Placement Drive: ${placementDrive.companyName} (${placementDrive.role})`,
      text: `Dear Student,\n\nA new placement drive has been created for ${placementDrive.companyName} (${placementDrive.role}).\n\nEligible Branches: ${placementDrive.eligibleBranches.join(', ')}\nDate: ${new Date(placementDrive.date).toLocaleDateString()}\n\nApply now through the placement portal!\nPlacement Team`,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send drive creation email:', error.message);
    return null;
  }
};

const processExcelFile = async (file, type) => {
  const workbook = xlsx.read(file.buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

  const headers = worksheet[0];
  const emailColumnIndex = headers.findIndex(header => 
    header && ['Email', 'email', 'Student Email'].includes(header.trim())
  );
  if (emailColumnIndex === -1) {
    throw new Error(`Excel sheet for ${type} must contain an "Email" column (e.g., "Email", "email", or "Student Email")`);
  }

  const dataRows = worksheet.slice(1);
  const emails = dataRows
    .map(row => row[emailColumnIndex]?.toString().trim().toLowerCase())
    .filter(email => email);

  if (emails.length === 0) {
    if (type === 'unattended') {
      return [];
    } else {
      throw new Error(`No valid emails found in the Excel sheet for ${type}`);
    }
  }

  const students = await User.find({
    email: { $in: emails.map(email => new RegExp(`^${email}$`, 'i')) },
    role: 'Student',
  });

  const invalidEmails = emails.filter(email => !students.some(s => s.email.toLowerCase() === email));
  if (invalidEmails.length > 0) {
    throw new Error(`The following emails are invalid or not registered students in ${type}: ${invalidEmails.join(', ')}`);
  }

  return students.map(student => student._id);
};

exports.createPlacementDrive = async (req, res) => {
  const { companyName, role, eligibleBranches, date } = req.body;
  try {
    const placementDrive = new PlacementDrive({ companyName, role, eligibleBranches, date });
    await placementDrive.save();

    const students = await User.find({ branch: { $in: eligibleBranches }, role: 'Student' });
    if (students.length > 0) {
      await User.updateMany(
        { _id: { $in: students.map(s => s._id) } },
        {
          $push: {
            notifications: {
              message: `New Placement Drive: ${companyName} (${role})`,
              type: 'info',
              link: '/student/placement',
              relatedId: placementDrive._id,
            },
          },
        }
      );
      await sendDriveCreationEmail(students, placementDrive);
    }

    res.status(201).json({ message: 'Placement drive created successfully', placementDrive });
  } catch (error) {
    res.status(500).json({ message: 'Error creating placement drive', error: error.message });
  }
};

exports.getAllPlacementDrives = async (req, res) => {
  try {
    const placementDrives = await PlacementDrive.find();
    res.status(200).json(placementDrives);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching placement drives', error: error.message });
  }
};

exports.getPlacementDriveById = async (req, res) => {
  const { id } = req.params;
  try {
    const placementDrive = await PlacementDrive.findById(id)
      .populate('applications.student', 'name email registrationNumber branch')
      .populate('phases.shortlistedStudents', 'name email registrationNumber branch')
      .populate('phases.unattendedStudents', 'name email registrationNumber branch');
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
  const studentId = req.user.id;

  try {
    const placementDrive = await PlacementDrive.findById(id);
    if (!placementDrive) {
      return res.status(404).json({ message: 'Placement drive not found' });
    }
    if (placementDrive.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot apply to a completed drive' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'Student') {
      return res.status(400).json({ message: 'Only students can apply' });
    }
    if (!placementDrive.eligibleBranches.includes(student.branch)) {
      return res.status(400).json({ message: 'Your branch is not eligible for this drive' });
    }
    if (placementDrive.applications.some(app => app.student.toString() === studentId)) {
      return res.status(400).json({ message: 'You have already applied to this drive' });
    }

    placementDrive.applications.push({ student: studentId, status: 'Applied' });
    await placementDrive.save();

    await User.updateOne(
      { _id: studentId },
      {
        $push: {
          notifications: {
            message: `Application submitted for ${placementDrive.companyName} (${placementDrive.role})`,
            type: 'success',
            link: '/student/placement',
            relatedId: placementDrive._id,
          },
        },
      }
    );
    await sendApplicationEmail(student, placementDrive);

    res.status(200).json({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error applying to placement drive', error: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  const { driveId, studentId } = req.params; // Changed from id, studentId to match route
  const { status } = req.body;

  console.log(`Updating status for driveId: ${driveId}, studentId: ${studentId}, status: ${status}`); // Debug log

  try {
    const placementDrive = await PlacementDrive.findById(driveId);
    if (!placementDrive) {
      console.log(`Drive not found for ID: ${driveId}`);
      return res.status(404).json({ message: 'Placement drive not found' });
    }
    if (!['Applied', 'Selected', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = placementDrive.applications.find(app => app.student.toString() === studentId);
    if (!application) {
      console.log(`Application not found for studentId: ${studentId} in driveId: ${driveId}`);
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    application.updatedAt = new Date();

    const latestPhase = placementDrive.phases[placementDrive.phases.length - 1];
    if (latestPhase) {
      if (status === 'Selected' && !latestPhase.shortlistedStudents.some(s => s.toString() === studentId)) {
        latestPhase.shortlistedStudents.push(studentId);
        console.log(`Added ${studentId} to shortlistedStudents in phase ${latestPhase.name}`);
      } else if (status === 'Rejected') {
        latestPhase.shortlistedStudents = latestPhase.shortlistedStudents.filter(s => s.toString() !== studentId);
        console.log(`Removed ${studentId} from shortlistedStudents in phase ${latestPhase.name}`);
      }
    }

    await placementDrive.save();
    console.log('Updated applications:', placementDrive.applications);

    const student = await User.findById(studentId);
    if (student) {
      await User.updateOne(
        { _id: studentId },
        {
          $push: {
            notifications: {
              message: `Your application status for ${placementDrive.companyName} (${placementDrive.role}) has been updated to ${status}`,
              type: status === 'Selected' ? 'success' : 'error',
              link: '/student/placement',
              relatedId: placementDrive._id,
            },
          },
        }
      );
      await sendStatusEmail([student], status, placementDrive.companyName, placementDrive.role);
    }

    res.status(200).json({ message: 'Application status updated successfully', placementDrive });
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error.message, error.stack);
    res.status(500).json({ message: 'Error updating application status', error: error.message });
  }
};

exports.addPhaseToDrive = async (req, res) => {
  const { id } = req.params;
  const { phaseName, requirements, instructions } = req.body;
  const shortlistFile = req.files?.shortlistFile ? req.files.shortlistFile[0] : null;
  const unattendedFile = req.files?.unattendedFile ? req.files.unattendedFile[0] : null;

  try {
    const placementDrive = await PlacementDrive.findById(id);
    if (!placementDrive) {
      return res.status(404).json({ message: 'Placement drive not found' });
    }
    if (placementDrive.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot add phase to a completed drive' });
    }
    if (!['Resume Screening', 'Written Test', 'Interview HR', 'Interview Technical', 'Aptitude Test', 'Coding Test', 'Final Selection'].includes(phaseName)) {
      return res.status(400).json({ message: 'Invalid phase name' });
    }

    let shortlistedStudents = [];
    let unattendedStudents = [];
    let previouslyShortlisted = [];

    // Determine shortlisted students
    if (placementDrive.phases.length === 0) {
      if (shortlistFile) {
        shortlistedStudents = await processExcelFile(shortlistFile, 'shortlist');
      } else {
        shortlistedStudents = placementDrive.applications.map(app => app.student.toString());
      }
    } else {
      if (!shortlistFile) {
        return res.status(400).json({ message: 'Shortlist file is required for subsequent phases' });
      }
      shortlistedStudents = await processExcelFile(shortlistFile, 'shortlist');
      
      // Get previously shortlisted students
      const previousPhase = placementDrive.phases[placementDrive.phases.length - 1];
      previouslyShortlisted = previousPhase.shortlistedStudents.map(s => s.toString());
      
      if (unattendedFile) {
        unattendedStudents = await processExcelFile(unattendedFile, 'unattended');
        previousPhase.unattendedStudents = unattendedStudents;
      }
    }

    console.log('Shortlisted Students:', shortlistedStudents);
    console.log('Previously Shortlisted:', previouslyShortlisted);

    // 1. Update selected students
    for (const studentId of shortlistedStudents) {
      const application = placementDrive.applications.find(app => app.student.toString() === studentId);
      if (application) {
        console.log(`Updating ${studentId} to Selected`);
        application.status = 'Selected';
        application.updatedAt = new Date();
      }
    }

    // 2. Update rejected students (only those who were in previous phase but not now)
    if (placementDrive.phases.length > 0) {
      for (const studentId of previouslyShortlisted) {
        if (!shortlistedStudents.includes(studentId)) {
          const application = placementDrive.applications.find(app => app.student.toString() === studentId);
          if (application) {
            console.log(`Updating ${studentId} to Rejected (was previously shortlisted)`);
            application.status = 'Rejected';
            application.updatedAt = new Date();
          }
        }
      }
    }

    // Add the new phase
    placementDrive.phases.push({ 
      name: phaseName, 
      shortlistedStudents, 
      requirements, 
      instructions 
    });
    
    placementDrive.status = 'In Progress';
    placementDrive.updatedAt = new Date();

    console.log('Applications before save:', placementDrive.applications.map(app => ({ 
      student: app.student.toString(), 
      status: app.status
    })));

    await placementDrive.save();

    // Notify shortlisted students
    const selectedStudents = await User.find({ _id: { $in: shortlistedStudents } });
    console.log('Selected Students:', selectedStudents.map(s => s._id.toString()));

    if (selectedStudents.length > 0) {
      if (phaseName === 'Final Selection') {
        await User.updateMany(
          { _id: { $in: shortlistedStudents } },
          {
            $push: {
              notifications: {
                message: `🎉 Congratulations! You have been selected for ${placementDrive.companyName} (${placementDrive.role}).`,
                type: 'success',
                link: '/student/placement',
                relatedId: placementDrive._id,
              },
            },
          }
        );
        await sendStatusEmail(selectedStudents, 'Selected', placementDrive.companyName, placementDrive.role, requirements, instructions);
      } else {
        await User.updateMany(
          { _id: { $in: shortlistedStudents } },
          {
            $push: {
              notifications: {
                message: `✅ You've been shortlisted for ${phaseName} - ${placementDrive.companyName} (${placementDrive.role})`,
                type: 'success',
                link: '/student/placement',
                relatedId: placementDrive._id,
              },
            },
          }
        );
        await sendPhaseEmail(selectedStudents, phaseName, placementDrive.companyName, placementDrive.role, requirements, instructions);
      }
    }

    // Notify rejected students who were previously shortlisted
    if (placementDrive.phases.length > 1) {
      const rejectedStudentIds = previouslyShortlisted.filter(id => !shortlistedStudents.includes(id));
      if (rejectedStudentIds.length > 0) {
        const rejectedStudents = await User.find({ _id: { $in: rejectedStudentIds } });
        console.log('Rejected Students:', rejectedStudents.map(s => s._id.toString()));

        if (rejectedStudents.length > 0) {
          await User.updateMany(
            { _id: { $in: rejectedStudentIds } },
            {
              $push: {
                notifications: {
                  message: `Status Update: Your application for ${placementDrive.companyName} (${placementDrive.role}) has been updated.`,
                  type: 'error',
                  link: '/student/placement',
                  relatedId: placementDrive._id,
                },
              },
            }
          );
          await sendStatusEmail(rejectedStudents, 'Rejected', placementDrive.companyName, placementDrive.role);
        }
      }
    }

    res.status(200).json({ message: `Phase ${phaseName} added successfully`, placementDrive });
  } catch (error) {
    console.error('ERROR in addPhaseToDrive:', error.message, error.stack);
    res.status(500).json({ message: 'Error adding phase', error: error.message });
  }
};
exports.endPlacementDrive = async (req, res) => {
  const { id } = req.params;
  const { requirements, instructions } = req.body;
  const shortlistFile = req.files?.shortlistFile ? req.files.shortlistFile[0] : null;

  try {
    const placementDrive = await PlacementDrive.findById(id);
    if (!placementDrive) {
      return res.status(404).json({ message: 'Placement drive not found' });
    }
    if (placementDrive.status === 'Completed') {
      return res.status(400).json({ message: 'Drive is already completed' });
    }
    if (!shortlistFile) {
      return res.status(400).json({ message: 'Final shortlist file is required' });
    }

    // Process shortlist file and ensure all IDs are strings
    let shortlistedStudents = await processExcelFile(shortlistFile, 'shortlist');
    shortlistedStudents = shortlistedStudents.map(id => id.toString());
    
    console.log('Final Shortlisted Students:', shortlistedStudents);

    // Create a deep copy of applications to avoid reference issues
    const updatedApplications = placementDrive.applications.map(app => {
      const appObj = app.toObject ? app.toObject() : { ...app };
      const studentId = app.student.toString();
      
      if (shortlistedStudents.includes(studentId)) {
        console.log(`Marking ${studentId} as Selected for final selection`);
        appObj.status = 'Selected';
      } else {
        console.log(`Marking ${studentId} as Rejected for final selection`);
        appObj.status = 'Rejected';
      }
      
      appObj.updatedAt = new Date();
      return appObj;
    });

    // Update applications with the new statuses
    placementDrive.applications = updatedApplications;

    // Add final phase
    placementDrive.phases.push({
      name: 'Final Selection',
      shortlistedStudents,
      requirements,
      instructions,
    });
    
    placementDrive.status = 'Completed';
    placementDrive.updatedAt = new Date();
    
    console.log('Applications before save:', placementDrive.applications.map(app => ({ 
      student: typeof app.student === 'object' ? app.student.toString() : app.student, 
      status: app.status
    })));
    
    await placementDrive.save();

    // Notify selected students
    try {
      const selectedStudents = await User.find({ _id: { $in: shortlistedStudents } });
      console.log('Selected Students for notification:', selectedStudents.map(s => s._id.toString()));

      if (selectedStudents.length > 0) {
        await User.updateMany(
          { _id: { $in: shortlistedStudents } },
          {
            $push: {
              notifications: {
                message: `🎉 Congratulations! You have been selected for ${placementDrive.companyName} (${placementDrive.role}).`,
                type: 'success',
                link: '/student/placement',
                relatedId: placementDrive._id,
              },
            },
          }
        );
        await sendStatusEmail(selectedStudents, 'Selected', placementDrive.companyName, placementDrive.role, requirements, instructions);
      }
    } catch (emailError) {
      console.error('Failed to send notification emails to selected students:', emailError);
      // Continue execution - don't break the process if email fails
    }

    // Notify rejected students
    try {
      // Fix the duplicate key issue in the query
      const rejectedStudentIds = placementDrive.applications
        .filter(app => app.status === 'Rejected')
        .map(app => typeof app.student === 'object' ? app.student.toString() : app.student);
      
      console.log('Rejected Student IDs:', rejectedStudentIds);
      
      const notSelectedStudents = await User.find({
        _id: { $in: rejectedStudentIds }
      });
      
      console.log('Rejected Students for notification:', notSelectedStudents.map(s => s._id.toString()));

      if (notSelectedStudents.length > 0) {
        await User.updateMany(
          { _id: { $in: rejectedStudentIds } },
          {
            $push: {
              notifications: {
                message: `Status Update: Your application for ${placementDrive.companyName} (${placementDrive.role}) has been updated.`,
                type: 'error',
                link: '/student/placement',
                relatedId: placementDrive._id,
              },
            }
          }
        );
        await sendStatusEmail(notSelectedStudents, 'Rejected', placementDrive.companyName, placementDrive.role);
      }
    } catch (emailError) {
      console.error('Failed to send notification emails to rejected students:', emailError);
      // Continue execution - don't break the process if email fails
    }

    res.status(200).json({ message: 'Placement drive completed successfully', placementDrive });
  } catch (error) {
    console.error('ERROR in endPlacementDrive:', error.message, error.stack);
    res.status(500).json({ message: 'Error ending placement drive', error: error.message });
  }
};
exports.getShortlistTemplate = (req, res) => {
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet([{ Email: 'example@student.com' }]);
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Shortlist');
  const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename=shortlist_template.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
};

