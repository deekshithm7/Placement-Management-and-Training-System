const PlacementDrive = require('../models/PlacementDrive');
const User = require('../models/User');
const xlsx = require('xlsx');
const axios = require('axios'); // Add this
const sendPhaseEmail = async (students, phaseName, companyName, role, requirements, instructions) => {
  console.log('DEBUG: Sending emails to:', students.map(s => s.email));
  try {
    const emailPromises = students.map(student => 
      axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { name: "PMTS", email: process.env.BREVO_EMAIL },
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
</html>`
        },
        {
          headers: { 
            "api-key": process.env.BREVO_API_KEY, 
            "Content-Type": "application/json" 
          }
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
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "PMTS", email: process.env.BREVO_EMAIL },
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
</html>`
      },
      {
        headers: { 
          "api-key": process.env.BREVO_API_KEY, 
          "Content-Type": "application/json" 
        }
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
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { name: "PMTS", email: process.env.BREVO_EMAIL },
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
</html>`
        },
        {
          headers: { 
            "api-key": process.env.BREVO_API_KEY, 
            "Content-Type": "application/json" 
          }
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
      createdBy: req.user._id
    });
    await placementDrive.save();
    console.log('DEBUG: Placement drive created, ID:', placementDrive._id);

    // Find eligible students with case-insensitive branch check
    console.log('DEBUG: Finding eligible students');
    const eligibleStudents = await User.find({
      role: 'Student',
      branch: { $in: eligibleBranches.map(branch => new RegExp(`^${branch}$`, 'i')) }, // Case-insensitive match
      cgpa: { $gte: minCGPA || 0 },
      numberOfBacklogs: { $lte: maxBacklogs || 0 },
      semestersCompleted: { $gte: minSemestersCompleted || 0 }
    });
    console.log('DEBUG: Eligible students found:', eligibleStudents.length);

    // Update students' eligibleDrives
    if (eligibleStudents.length > 0) {
      await User.updateMany(
        { _id: { $in: eligibleStudents.map(s => s._id) } },
        { $addToSet: { eligibleDrives: placementDrive._id } }
      );
      console.log('DEBUG: Updated eligibleDrives for students');

      // Send emails to eligible students
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
    console.log('DEBUG: Fetching all placement drives');
    const placementDrives = await PlacementDrive.find()
      .sort({ createdAt: -1 }) // Sort by createdAt descending (latest first)
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

exports.getPlacementDriveById = async (req, res) => {
  const { id } = req.params;

  try {
    const placementDrive = await PlacementDrive.findById(id)
      .populate('createdBy', 'name email')
      .populate('applications.student', 'name email registrationNumber')
      .populate('phases.shortlistedStudents', 'name email registrationNumber');
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
    console.log('DEBUG: Applying to placement drive, ID:', id);
    const placementDrive = await PlacementDrive.findById(id);
    if (!placementDrive) {
      console.log('DEBUG: Placement drive not found');
      return res.status(404).json({ message: 'Placement drive not found' });
    }

    const student = req.user;
    console.log('DEBUG: Student applying:', student.email);
    if (!placementDrive.eligibleBranches.some(b => new RegExp(`^${b}$`, 'i').test(student.branch)) ||
        (student.cgpa || 0) < placementDrive.minCGPA ||
        (student.numberOfBacklogs || 0) > placementDrive.maxBacklogs ||
        (student.semestersCompleted || 0) < placementDrive.minSemestersCompleted) {
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

    console.log('DEBUG: Updating student eligible drives');
    await User.findByIdAndUpdate(student._id, { $addToSet: { eligibleDrives: placementDrive._id } });

    // Send email notification
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
        role: 'Student' 
      });
      shortlistedStudents = students.map(student => student._id);

      const invalidEmails = emails.filter(email => !students.some(s => s.email.toLowerCase() === email));
      if (invalidEmails.length > 0) {
        return res.status(400).json({ 
          message: `The following emails are invalid or not registered students: ${invalidEmails.join(', ')}`, 
          invalidEmails 
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

    // Send emails
    await sendPhaseEmail(students, phaseName, placementDrive.companyName, placementDrive.role, requirements, instructions);

    res.status(200).json({ message: `Phase ${phaseName} added successfully`, placementDrive });
  } catch (error) {
    console.error('ERROR in addPhaseToDrive:', error.message, error.stack);
    res.status(500).json({ message: 'Error adding phase', error: error.message });
  }
};

exports.endPlacementDrive = async (req, res) => {
  const { id } = req.params;
  const shortlistFile = req.file;
  const { requirements, instructions } = req.body; // Add these from request body

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
      role: 'Student' 
    });
    const shortlistedStudents = students.map(student => student._id);

    const invalidEmails = emails.filter(email => !students.some(s => s.email.toLowerCase() === email));
    if (invalidEmails.length > 0) {
      return res.status(400).json({ 
        message: `The following emails are invalid or not registered students: ${invalidEmails.join(', ')}`, 
        invalidEmails 
      });
    }

    placementDrive.phases.push({ name: 'Final Selection', shortlistedStudents, requirements, instructions });
    placementDrive.status = 'Completed';
    placementDrive.updatedAt = new Date();
    await placementDrive.save();

    // Send emails
    await sendPhaseEmail(students, 'Final Selection', placementDrive.companyName, placementDrive.role, requirements, instructions);

    res.status(200).json({ message: 'Placement drive ended successfully', placementDrive });
  } catch (error) {
    console.error('ERROR in endPlacementDrive:', error.message, error.stack);
    res.status(500).json({ message: 'Error ending placement drive', error: error.message });
  }
};
exports.getShortlistTemplate = (req, res) => {
  console.log('DEBUG: Entering getShortlistTemplate');
  try {
    const headers = ['Email'];
    console.log('DEBUG: Creating worksheet with headers:', headers);

    const worksheet = xlsx.utils.aoa_to_sheet([headers]);
    console.log('DEBUG: Worksheet created');

    const workbook = xlsx.utils.book_new();
    console.log('DEBUG: Workbook created');

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Shortlist');
    console.log('DEBUG: Sheet appended to workbook');

    const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    console.log('DEBUG: Excel buffer generated, size:', excelBuffer.length);

    res.setHeader('Content-Disposition', 'attachment; filename=shortlist_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(excelBuffer);
    console.log('DEBUG: Response sent successfully');
  } catch (error) {
    console.error('ERROR in getShortlistTemplate:', error.message, error.stack);
    res.status(500).json({ message: 'Error generating shortlist template', error: error.message });
  }
};