// backend/controllers/addStudentController.js
const User = require('../models/User');
const xlsx = require('xlsx');

const validateStudentData = (studentData, advisorBranch) => {
  const errors = [];

  if (studentData.branch !== advisorBranch) {
    errors.push(`Branch mismatch. Student branch (${studentData.branch}) does not match advisor's branch (${advisorBranch})`);
  }

  const requiredFields = ['name', 'email', 'batch', 'registrationNumber', 'branch'];
  requiredFields.forEach(field => {
    if (!studentData[field]) errors.push(`Missing required field: ${field}`);
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (studentData.email && !emailRegex.test(studentData.email)) {
    errors.push('Invalid email format');
  }

  if (studentData.cgpa !== undefined && (isNaN(studentData.cgpa) || studentData.cgpa < 0 || studentData.cgpa > 10)) {
    errors.push('CGPA must be a number between 0 and 10');
  }

  if (studentData.semestersCompleted !== undefined && 
      (isNaN(studentData.semestersCompleted) || studentData.semestersCompleted < 0)) {
    errors.push('Semesters completed must be a non-negative number');
  }

  return errors;
};

exports.addStudentsSingle = async (req, res) => {
  try {
    const advisorBranch = req.user.branch;
    const studentData = {
      ...req.body,
      role: 'Student',
      registered: false,
      password: null // No password, student registers via OTP
    };

    const validationErrors = validateStudentData(studentData, advisorBranch);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const newStudent = new User(studentData);
    await newStudent.save();

    res.status(201).json({ 
      message: 'Student added successfully', 
      student: { email: newStudent.email, registrationNumber: newStudent.registrationNumber }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: 'Student with this email or registration number already exists' 
      });
    }
    res.status(500).json({ message: 'Error adding student', error: error.message });
  }
};

exports.addStudentsBulk = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const advisorBranch = req.user.branch;
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const processedStudents = [];
    const errors = [];

    for (const studentData of worksheet) {
      const preparedStudent = {
        name: studentData.Name,
        email: studentData.Email,
        batch: studentData.Batch,
        registrationNumber: studentData.RegistrationNumber,
        branch: studentData.Branch,
        semestersCompleted: studentData.SemestersCompleted || 0,
        numberOfBacklogs: studentData.NumberOfBacklogs || 0,
        phoneNumber: studentData.PhoneNumber,
        cgpa: studentData.CGPA || null,
        role: 'Student',
        registered: false,
        password: null
      };

      const validationErrors = validateStudentData(preparedStudent, advisorBranch);
      if (validationErrors.length > 0) {
        errors.push({ student: preparedStudent, errors: validationErrors });
        continue;
      }

      try {
        const newStudent = new User(preparedStudent);
        await newStudent.save();
        processedStudents.push(newStudent);
      } catch (saveError) {
        errors.push({
          student: preparedStudent,
          errors: saveError.code === 11000 ? ['Duplicate email or registration number'] : [saveError.message]
        });
      }
    }

    res.status(200).json({
      message: 'Bulk student addition processed',
      processedStudents: processedStudents.length,
      successfulStudents: processedStudents.map(s => ({ email: s.email, registrationNumber: s.registrationNumber })),
      errors
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing bulk student upload', error: error.message });
  }
};

exports.getStudentUploadTemplate = (req, res) => {
  const headers = [
    'Name', 'Email', 'Batch', 'RegistrationNumber', 
    'Branch', 'SemestersCompleted', 'NumberOfBacklogs', 
    'PhoneNumber', 'CGPA'
  ];

  const worksheet = xlsx.utils.aoa_to_sheet([headers]);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');

  const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename=student_upload_template.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(excelBuffer);
};