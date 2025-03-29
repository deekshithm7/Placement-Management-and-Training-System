// backend/controllers/placementDriveController.js
const PlacementDrive = require('../models/PlacementDrive');
const User = require('../models/User');
const xlsx = require('xlsx');
const axios = require('axios');

const sendPhaseEmail = async (students, phaseName, companyName, role, requirements, instructions) => {
  console.log('DEBUG: Sending emails to:', students.map(s => s.email));
  try {
    const emailPromises = students.map(student =>
      axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: 'PMTS', email: process.env.BREVO_EMAIL },
          to: [{ email: student.email }],
          subject: `Shortlisted for ${phaseName} - ${companyName} (${role})`,
          htmlContent: `<!DOCTYPE html>
<html>
<head><title>Shortlist Notification</title></head>
<body>
    <div style="text-align:center; padding:20px; font-family:Arial,sans-serif;">
        <h2>Congratulations!</h2>
        <p>You have been shortlisted for the <strong>${phaseName}</strong> phase of the placement drive for <strong>${companyName} - ${role}</strong>.</p>
        <h3>Requirements</h3>
        <p>${requirements || 'No specific requirements provided.'}</p>
        <h3>Instructions</h3>
        <p>${instructions || 'No additional instructions provided.'}</p>
        <p>Please prepare accordingly and check your dashboard for updates.</p>
    </div>
</body>
</html>`,
        },
        {
          headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
        }
      )
    );
    await Promise.all(emailPromises);
    console.log('DEBUG: Emails sent successfully');
  } catch (error) {
    console.error('ERROR sending emails:', error.response?.data || error.message);
    throw new Error('Failed to send notification emails');
  }
};

const sendApplicationEmail = async (student, placementDrive) => {
  console.log('DEBUG: Sending application email to:', student.email);
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'PMTS', email: process.env.BREVO_EMAIL },
        to: [{ email: student.email }],
        subject: `Application Successful - ${placementDrive.companyName} (${placementDrive.role})`,
        htmlContent: `<!DOCTYPE html>
<html>
<head><title>Application Confirmation</title></head>
<body>
    <div style="text-align:center; padding:20px; font-family:Arial,sans-serif;">
        <h2>Application Submitted Successfully!</h2>
        <p>Dear ${student.name},</p>
        <p>You have successfully applied to the following placement drive:</p>
        <h3>${placementDrive.companyName} - ${placementDrive.role}</h3>
        <p><strong>Date:</strong> ${new Date(placementDrive.date).toLocaleDateString()}</p>
        <p><strong>Eligible Branches:</strong> ${placementDrive.eligibleBranches.join(', ')}</p>
        <p><strong>Minimum CGPA:</strong> ${placementDrive.minCGPA}</p>
        <p><strong>Maximum Backlogs:</strong> ${placementDrive.maxBacklogs}</p>
        <p><strong>Minimum Semesters Completed:</strong> ${placementDrive.minSemestersCompleted}</p>
        <p><strong>Description:</strong> ${placementDrive.description || 'No description provided'}</p>
        <p>Please stay updated via your dashboard for further instructions.</p>
    </div>
</body>
</html>`,
      },
      {
        headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
      }
    );
    console.log('DEBUG: Application email sent successfully:', response.data);
  } catch (error) {
    console.error('ERROR sending application email:', error.response?.data || error.message);
    throw new Error('Failed to send application confirmation email');
  }
};

const sendDriveCreationEmail = async (students, placementDrive) => {
  console.log('DEBUG: Sending drive creation emails to:', students.map(s => s.email));
  try {
    const emailPromises = students.map(student =>
      axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: 'PMTS', email: process.env.BREVO_EMAIL },
          to: [{ email: student.email }],
          subject: `New Placement Drive: ${placementDrive.companyName} (${placementDrive.role})`,
          htmlContent: `<!DOCTYPE html>
<html>
<head><title>New Placement Drive</title></head>
<body>
    <div style="text-align:center; padding:20px; font-family:Arial,sans-serif;">
        <h2>New Placement Opportunity!</h2>
        <p>Dear ${student.name},</p>
        <p>A new placement drive has been created that you may be eligible for:</p>
        <h3>${placementDrive.companyName} - ${placementDrive.role}</h3>
        <p><strong>Date:</strong> ${new Date(placementDrive.date).toLocaleDateString()}</p>
        <p><strong>Eligible Branches:</strong> ${placementDrive.eligibleBranches.join(', ')}</p>
        <p><strong>Minimum CGPA:</strong> ${placementDrive.minCGPA}</p>
        <p><strong>Maximum Backlogs:</strong> ${placementDrive.maxBacklogs}</p>
        <p><strong>Minimum Semesters Completed:</strong> ${placementDrive.minSemestersCompleted}</p>
        <p><strong>Description:</strong> ${placementDrive.description || 'No description provided'}</p>
        <p>Log in to your dashboard to apply!</p>
    </div>
</body>
</html>`,
        },
        {
          headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
        }
      )
    );
    await Promise.all(emailPromises);
    console.log('DEBUG: Drive creation emails sent successfully');
  } catch (error) {
    console.error('ERROR sending drive creation emails:', error.response?.data || error.message);
    throw new Error('Failed to send drive creation notification emails');
  }
};

exports.createPlacementDrive = async (req, res) => {
  const { companyName, role, description, minCGPA, maxBacklogs, eligibleBranches, minSemestersCompleted, date } = req.body;

  try {
    console.log('DEBUG: Creating placement drive:', { companyName, role });
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
    });
    await placementDrive.save();
    console.log('DEBUG: Placement drive created, ID:', placementDrive._id);

    console.log('DEBUG: Finding eligible students');
    const eligibleStudents = await User.find({
      role: 'Student',
      branch: { $in: eligibleBranches.map(branch => new RegExp(`^${branch}$`, 'i')) },
      cgpa: { $gte: minCGPA || 0 },
      numberOfBacklogs: { $lte: maxBacklogs || 0 },
      semestersCompleted: { $gte: minSemestersCompleted || 0 },
    });
    console.log('DEBUG: Eligible students found:', eligibleStudents.length);

    if (eligibleStudents.length > 0) {
      await User.updateMany(
        { _id: { $in: eligibleStudents.map(s => s._id) } },
        {
          $addToSet: { eligibleDrives: placementDrive._id },
          $push: {
            notifications: {
              message: `New placement drive: ${companyName} - ${role}`,
              type: 'info',
              link: '/student/placement',
              relatedId: placementDrive._id,
            },
          },
        }
      );
      console.log('DEBUG: Updated eligibleDrives and notifications for students');

      await sendDriveCreationEmail(eligibleStudents, placementDrive);
    }

    res.status(201).json({ message: 'Placement drive created successfully', placementDrive });
  } catch (error) {
    console.error('ERROR in createPlacementDrive:', error.message, error.stack);
    res.status(500).json({ message: 'Error creating placement drive', error: error.message });
  }
};

exports.getAllPlacementDrives = async (req, res) => {
  try {
    const { year } = req.query;
    console.log('DEBUG: Fetching all placement drives, year filter:', year);

    let query = {};
    if (year) {
      const startOfYear = new Date(`${year}-01-01T00:00:00Z`);
      const endOfYear = new Date(`${year}-12-31T23:59:59Z`);
      query.date = { $gte: startOfYear, $lte: endOfYear };
    }

    const placementDrives = await PlacementDrive.find(query)
      .sort({ createdAt: -1 })
      .populate('applications.student', 'name email registrationNumber branch cgpa numberOfBacklogs semestersCompleted')
      .populate('phases.shortlistedStudents', 'name email registrationNumber')
      .populate('createdBy', 'name email');

    console.log('DEBUG: Placement drives fetched:', placementDrives.length);
    res.status(200).json(placementDrives);
  } catch (error) {
    console.error('ERROR in getAllPlacementDrives:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching placement drives', error: error.message });
  }
};

// backend/controllers/placementDriveController.js
exports.getPlacementDriveById = async (req, res) => {
  const { id } = req.params;

  try {
    const placementDrive = await PlacementDrive.findById(id)
      .populate('createdBy', 'name email')
      .populate('applications.student', 'name email registrationNumber branch') // Add 'branch'
      .populate('phases.shortlistedStudents', 'name email registrationNumber');

    if (!placementDrive) {
      return res.status(404).json({ message: 'Placement drive not found' });
    }

    // Determine the current phase (the last phase added, if any)
    const currentPhase = placementDrive.phases.length > 0 
      ? placementDrive.phases[placementDrive.phases.length - 1] 
      : null;

    // Add current phase and student status to the response
    const response = {
      ...placementDrive.toObject(),
      currentPhase: currentPhase ? {
        name: currentPhase.name,
        createdAt: currentPhase.createdAt,
        requirements: currentPhase.requirements,
        instructions: currentPhase.instructions,
      } : null,
      studentPhaseStatus: null,
    };

    // If the user is a student, determine their status for the current phase
    if (req.user.role === 'Student' && currentPhase) {
      const studentId = req.user._id;
      const isShortlisted = currentPhase.shortlistedStudents.some(s => s._id.equals(studentId));
      response.studentPhaseStatus = isShortlisted ? 'Shortlisted' : 'Rejected';
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching placement drive', error: error.message });
  }
};
exports.applyToPlacementDrive = async (req, res) => {
  const { id } = req.params;

  try {
    console.log('DEBUG: Applying to placement drive, ID:', id);
    const placementDrive = await PlacementDrive.findById(id);
    if (!placementDrive) {
      console.log('DEBUG: Placement drive not found');
      return res.status(404).json({ message: 'Placement drive not found' });
    }

    const student = req.user;
    console.log('DEBUG: Student applying:', student.email);
    if (
      !placementDrive.eligibleBranches.some(b => new RegExp(`^${b}$`, 'i').test(student.branch)) ||
      (student.cgpa || 0) < placementDrive.minCGPA ||
      (student.numberOfBacklogs || 0) > placementDrive.maxBacklogs ||
      (student.semestersCompleted || 0) < placementDrive.minSemestersCompleted
    ) {
      console.log('DEBUG: Student not eligible');
      return res.status(403).json({ message: 'You are not eligible for this placement drive' });
    }

    if (placementDrive.applications.some(app => app.student.equals(student._id))) {
      console.log('DEBUG: Student already applied');
      return res.status(400).json({ message: 'You have already applied to this placement drive' });
    }

    console.log('DEBUG: Adding application');
    placementDrive.applications.push({ student: student._id });
    await placementDrive.save();

    console.log('DEBUG: Updating student eligible drives and notification');
    await User.findByIdAndUpdate(student._id, {
      $addToSet: { eligibleDrives: placementDrive._id },
      $push: {
        notifications: {
          message: `Application successful for ${placementDrive.companyName} - ${placementDrive.role}`,
          type: 'success',
          link: '/student/placement',
          relatedId: placementDrive._id,
        },
      },
    });

    await sendApplicationEmail(student, placementDrive);

    res.status(200).json({ message: 'Successfully applied to placement drive' });
  } catch (error) {
    console.error('ERROR in applyToPlacementDrive:', error.message, error.stack);
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

    // Notify student of status update
    const student = await User.findById(studentId);
    if (student) {
      await User.updateOne(
        { _id: studentId },
        {
          $push: {
            notifications: {
              message: `Application status updated to "${status}" for ${placementDrive.companyName} - ${placementDrive.role}`,
              type: status === 'Selected' ? 'success' : 'info',
              link: '/student/placement',
              relatedId: placementDrive._id,
            },
          },
        }
      );
      // Optional: Send email for status update (not in original, but added for consistency)
      await sendEmail(
        student.email,
        `Application Status Update: ${placementDrive.companyName} (${placementDrive.role})`,
        `
          <h2>Application Status Update</h2>
          <p>Your application status for ${placementDrive.companyName} - ${placementDrive.role} has been updated to <strong>${status}</strong>.</p>
          <p>Check your dashboard for more details!</p>
        `
      );
    }

    res.status(200).json({ message: 'Application status updated successfully', placementDrive });
  } catch (error) {
    res.status(500).json({ message: 'Error updating application status', error: error.message });
  }
};

exports.addPhaseToDrive = async (req, res) => {
  const { id } = req.params;
  const { phaseName, requirements, instructions } = req.body;
  const shortlistFile = req.file;

  try {
    const placementDrive = await PlacementDrive.findById(id);
    if (!placementDrive) {
      return res.status(404).json({ message: 'Placement drive not found' });
    }
    if (placementDrive.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot add phase to a completed drive' });
    }
    if (!['Resume Screening', 'Written Test', 'Interview HR', 'Interview Technical', 'Aptitude Test', 'Coding Test'].includes(phaseName)) {
      return res.status(400).json({ message: 'Invalid phase name' });
    }

    let shortlistedStudents = [];
    if (placementDrive.phases.length === 0) {
      shortlistedStudents = placementDrive.applications.map(app => app.student);
    } else if (shortlistFile) {
      const workbook = xlsx.read(shortlistFile.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      const emails = worksheet.map(row => row.Email?.trim().toLowerCase()).filter(email => email);

      const students = await User.find({
        email: { $in: emails.map(email => new RegExp(`^${email}$`, 'i')) },
        role: 'Student',
      });
      shortlistedStudents = students.map(student => student._id);

      const invalidEmails = emails.filter(email => !students.some(s => s.email.toLowerCase() === email));
      if (invalidEmails.length > 0) {
        return res.status(400).json({
          message: `The following emails are invalid or not registered students: ${invalidEmails.join(', ')}`,
          invalidEmails,
        });
      }
    } else {
      return res.status(400).json({ message: 'Shortlist file required for subsequent phases' });
    }

    const students = await User.find({ _id: { $in: shortlistedStudents } });
    placementDrive.phases.push({ name: phaseName, shortlistedStudents, requirements, instructions });
    placementDrive.status = 'In Progress';
    placementDrive.updatedAt = new Date();
    await placementDrive.save();

    // Notify shortlisted students
    if (students.length > 0) {
      await User.updateMany(
        { _id: { $in: shortlistedStudents } },
        {
          $push: {
            notifications: {
              message: `Shortlisted for ${phaseName} - ${placementDrive.companyName} (${placementDrive.role})`,
              type: 'success',
              link: '/student/placement',
              relatedId: placementDrive._id,
            },
          },
        }
      );
      await sendPhaseEmail(students, phaseName, placementDrive.companyName, placementDrive.role, requirements, instructions);
    }

    res.status(200).json({ message: `Phase ${phaseName} added successfully`, placementDrive });
  } catch (error) {
    console.error('ERROR in addPhaseToDrive:', error.message, error.stack);
    res.status(500).json({ message: 'Error adding phase', error: error.message });
  }
};

exports.endPlacementDrive = async (req, res) => {
  const { id } = req.params;
  const shortlistFile = req.file;
  const { requirements, instructions } = req.body;

  console.log('DEBUG: Entering endPlacementDrive, ID:', id);
  console.log('DEBUG: Shortlist file:', shortlistFile ? shortlistFile.originalname : 'None');

  try {
    const placementDrive = await PlacementDrive.findById(id);
    if (!placementDrive) {
      return res.status(404).json({ message: 'Placement drive not found' });
    }
    if (placementDrive.status === 'Completed') {
      return res.status(400).json({ message: 'Drive already completed' });
    }
    if (!shortlistFile) {
      return res.status(400).json({ message: 'Final shortlist file required to end drive' });
    }

    const workbook = xlsx.read(shortlistFile.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const emails = worksheet.map(row => row.Email?.trim().toLowerCase()).filter(email => email);

    const students = await User.find({
      email: { $in: emails.map(email => new RegExp(`^${email}$`, 'i')) },
      role: 'Student',
    });
    const shortlistedStudents = students.map(student => student._id);

    const invalidEmails = emails.filter(email => !students.some(s => s.email.toLowerCase() === email));
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        message: `The following emails are invalid or not registered students: ${invalidEmails.join(', ')}`,
        invalidEmails,
      });
    }

    placementDrive.phases.push({ name: 'Final Selection', shortlistedStudents, requirements, instructions });
    placementDrive.status = 'Completed';
    placementDrive.updatedAt = new Date();
    await placementDrive.save();

    // Notify selected students
    if (students.length > 0) {
      await User.updateMany(
        { _id: { $in: shortlistedStudents } },
        {
          $push: {
            notifications: {
              message: `Congratulations! Selected for ${placementDrive.companyName} (${placementDrive.role})`,
              type: 'success',
              link: '/student/placement',
              relatedId: placementDrive._id,
            },
          },
        }
      );
      await sendPhaseEmail(students, 'Final Selection', placementDrive.companyName, placementDrive.role, requirements, instructions);
    }

    res.status(200).json({ message: 'Placement drive ended successfully', placementDrive });
  } catch (error) {
    console.error('ERROR in endPlacementDrive:', error.message, error.stack);
    res.status(500).json({ message: 'Error ending placement drive', error: error.message });
  }
};

exports.getShortlistTemplate = (req, res) => {
  // Unchanged, no notification needed
  console.log('DEBUG: Entering getShortlistTemplate');
  try {
    const workbook = xlsx.utils.book_new();
    if (!workbook) throw new Error('Failed to create workbook');

    const headers = ['Email'];
    const worksheet = xlsx.utils.aoa_to_sheet([headers]);
    if (!worksheet) throw new Error('Failed to create worksheet');

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Shortlist');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    if (!buffer || buffer.length === 0) throw new Error('Failed to generate buffer');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=shortlist_template.xlsx');

    return res.send(buffer);
  } catch (error) {
    console.error('ERROR in getShortlistTemplate:', error);
    return res.status(500).json({
      message: 'Error generating shortlist template',
      error: error.message || 'Unknown error',
    });
  }
};

