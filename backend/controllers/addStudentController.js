const User = require('../models/User');
const PlacementDrive = require('../models/PlacementDrive');
const xlsx = require('xlsx');

const validateStudentData = (studentData, advisorBranch) => {
  const errors = [];

  if (studentData.branch !== advisorBranch) {
    console.log(`Branch mismatch. Student branch (${studentData.branch}) does not match advisor's branch (${advisorBranch})`);
    errors.push(`Branch mismatch. Student branch (${studentData.branch}) does not match advisor's branch (${advisorBranch})`);
  }

  const requiredFields = ['name', 'email', 'batch', 'registrationNumber', 'branch'];
  requiredFields.forEach(field => {
    if (!studentData[field]) {
      console.log(`Missing required field: ${field}`);
      errors.push(`Missing required field: ${field}`);
    }
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (studentData.email && !emailRegex.test(studentData.email)) {
    errors.push('Invalid email format');
  }

  if (studentData.cgpa !== undefined && (isNaN(studentData.cgpa) || studentData.cgpa < 0 || studentData.cgpa > 10)) {
    console.log('CGPA must be a number between 0 and 10');
    errors.push('CGPA must be a number between 0 and 10');
  }

  if (studentData.semestersCompleted !== undefined && 
      (isNaN(studentData.semestersCompleted) || studentData.semestersCompleted < 0)) {
        console.log('Semesters completed must be a non-negative number');
    errors.push('Semesters completed must be a non-negative number');
  }

  return errors;
};

const updateEligibleDrives = async (student) => {
  try {
    const placementDrives = await PlacementDrive.find({});

    const eligibleDriveIds = placementDrives
      .filter(drive => 
        drive.eligibleBranches.includes(student.branch) &&
        (student.cgpa || 0) >= (drive.minCGPA || 0) &&
        (student.numberOfBacklogs || 0) <= (drive.maxBacklogs || 0) &&
        (student.semestersCompleted || 0) >= (drive.minSemestersCompleted || 0)
      )
      .map(drive => drive._id);

    const currentEligibleDrives = student.eligibleDrives.map(id => id.toString());
    const newEligibleDrives = eligibleDriveIds.map(id => id.toString());

    if (JSON.stringify(currentEligibleDrives.sort()) !== JSON.stringify(newEligibleDrives.sort())) {
      student.eligibleDrives = eligibleDriveIds;
      await student.save();
      console.log(`Updated eligibleDrives for student ${student.registrationNumber}: ${eligibleDriveIds}`);
    }
  } catch (error) {
    console.error(`Error updating eligibleDrives for student ${student.registrationNumber}:`, error.message);
  }
};

exports.addStudentsSingle = async (req, res) => {
  try {
    const advisorBranch = req.user.branch;
    const studentData = {
      ...req.body,
      role: 'Student',
      registered: false,
      password: null
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

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findOne({ 
      _id: id, 
      role: 'Student', 
      branch: req.user.branch 
    }).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found or unauthorized' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.listStudents = async (req, res) => {
  try {
    const students = await User.find({ 
      role: 'Student', 
      branch: req.user.branch 
    }).select('name registrationNumber branch batch email phoneNumber');

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const advisorBranch = req.user.branch;

    const student = await User.findOne({ 
      _id: id, 
      role: 'Student', 
      branch: advisorBranch 
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found or unauthorized' });
    }

    const validationErrors = validateStudentData({...student.toObject(), ...updateData}, advisorBranch);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }

    const updatedStudent = await User.findByIdAndUpdate(
      id, 
      { 
        ...updateData, 
        updatedAt: new Date() 
      }, 
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');

    if (updateData.branch || updateData.cgpa || updateData.numberOfBacklogs || updateData.semestersCompleted) {
      await updateEligibleDrives(updatedStudent);
    }

    res.json({
      message: 'Student updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate key error',
        duplicateField: Object.keys(error.keyPattern)[0]
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.editStudentsBulk = async (req, res) => {
  if (!req.file) {
    console.log('Error: No file uploaded');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const advisorBranch = req.user.branch;
    console.log(`Processing bulk edit as advisor from branch: ${advisorBranch}`);
    
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    if (workbook.SheetNames.length === 0) {
      console.log('Error: Excel file has no sheets');
      return res.status(400).json({ message: 'Excel file has no sheets' });
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { 
      raw: false,
      defval: undefined,
      header: 'A'
    });
    
    if (worksheet.length <= 1) {
      console.log('Error: Excel file contains no data');
      return res.status(400).json({ message: 'Excel file contains no data' });
    }

    console.log(`Found ${worksheet.length - 1} data rows in the Excel file`);
    
    const headers = {};
    const headerRow = worksheet[0];
    Object.keys(headerRow).forEach(cell => {
      const value = headerRow[cell] ? String(headerRow[cell]).toLowerCase().trim() : '';
      headers[cell] = value;
    });
    
    const fieldMap = {
      'name': 'name',
      'regno': 'registrationNumber',
      'semcompleted': 'semestersCompleted',
      'cgpa': 'cgpa',
      'numberofbacklogs': 'numberOfBacklogs'
    };
    
    const nameColumn = Object.keys(headers).find(key => headers[key] === 'name');
    const regNoColumn = Object.keys(headers).find(key => headers[key] === 'regno');
    
    if (!nameColumn || !regNoColumn) {
      return res.status(400).json({ 
        message: 'Excel file is missing required columns: name and/or regno' 
      });
    }
    
    const processedStudents = [];
    const errors = [];

    for (let i = 1; i < worksheet.length; i++) {
      const rowNumber = i + 1;
      const row = worksheet[i];
      
      if (!row[nameColumn] && !row[regNoColumn]) {
        console.log(`Row ${rowNumber}: Skipping empty row`);
        continue;
      }
      
      if (!row[regNoColumn]) {
        console.log(`Row ${rowNumber}: Missing registration number`);
        errors.push({
          rowNumber,
          name: row[nameColumn] || 'Unknown',
          errors: ['Registration number is required']
        });
        continue;
      }

      if (!row[nameColumn]) {
        console.log(`Row ${rowNumber}: Missing name`);
        errors.push({
          rowNumber,
          registrationNumber: row[regNoColumn],
          errors: ['Name is required']
        });
        continue;
      }

      const updateData = { name: row[nameColumn] };
      
      Object.keys(headers).forEach(col => {
        const fieldName = fieldMap[headers[col]];
        if (fieldName && row[col] !== undefined && row[col] !== '') {
          if (['semestersCompleted', 'cgpa', 'numberOfBacklogs'].includes(fieldName)) {
            const numValue = parseFloat(row[col]);
            if (!isNaN(numValue)) {
              updateData[fieldName] = numValue;
            }
          } else {
            updateData[fieldName] = row[col];
          }
        }
      });
      
      updateData.updatedAt = Date.now();
      
      console.log(`Row ${rowNumber}: Processing student with regNo: ${row[regNoColumn]}`);

      try {
        const registrationNumber = row[regNoColumn];
        const existingStudent = await User.findOne({ 
          registrationNumber, 
          branch: advisorBranch 
        });

        if (!existingStudent) {
          console.log(`Row ${rowNumber}: Student with regNo ${registrationNumber} not found or not in advisor's branch`);
          errors.push({
            rowNumber,
            registrationNumber,
            name: row[nameColumn],
            errors: ['Student with this registration number not found or not in your branch']
          });
          continue;
        }

        const mergedData = {...existingStudent.toObject(), ...updateData};
        const validationErrors = validateStudentData(mergedData, advisorBranch);
        
        if (validationErrors.length > 0) {
          console.log(`Row ${rowNumber}: Validation errors:`, validationErrors);
          errors.push({
            rowNumber,
            registrationNumber,
            name: row[nameColumn],
            errors: validationErrors
          });
          continue;
        }

        console.log(`Row ${rowNumber}: Updating student: ${registrationNumber} with fields:`, updateData);
        
        const updatedStudent = await User.findOneAndUpdate(
          { registrationNumber, branch: advisorBranch },
          { $set: updateData },
          { new: true, runValidators: true }
        );
        
        if (updateData.branch || updateData.cgpa || updateData.numberOfBacklogs || updateData.semestersCompleted) {
          await updateEligibleDrives(updatedStudent);
        }
        
        processedStudents.push(updatedStudent);
        console.log(`Row ${rowNumber}: Successfully updated student: ${registrationNumber}`);
      } catch (error) {
        console.error(`Row ${rowNumber}: Error updating student:`, error);
        errors.push({
          rowNumber,
          registrationNumber: row[regNoColumn],
          name: row[nameColumn],
          errors: [error.message]
        });
      }
    }

    console.log(`Bulk processing complete. Successes: ${processedStudents.length}, Errors: ${errors.length}`);
    
    res.status(200).json({
      message: `Processed ${worksheet.length - 1} entries. Updated ${processedStudents.length} students successfully${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
      processedStudents: processedStudents.length,
      successfulStudents: processedStudents.map(s => ({ 
        registrationNumber: s.registrationNumber,
        name: s.name
      })),
      errors
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    if (error.message && error.message.includes('XLSX')) {
      return res.status(400).json({ 
        message: 'Invalid Excel file format. Please ensure you are uploading a valid .xlsx or .xls file.'
      });
    }
    res.status(500).json({ 
      message: 'Error processing bulk student upload', 
      error: error.message || 'Unknown error'
    });
  }
};

exports.editStudentUploadTemplate = (req, res) => {
  const headers = [
    'name', 'regno', 'semcompleted', 'cgpa', 'numberofbacklogs'
  ];

  const worksheet = xlsx.utils.aoa_to_sheet([headers]);
  
  const range = xlsx.utils.decode_range(worksheet['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = xlsx.utils.encode_col(C) + "1";
    if (!worksheet[address]) continue;
    worksheet[address].s = { 
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } }
    };
  }

  const notesData = [
    ["Student Edit Instructions:"],
    [""],
    ["1. Required columns: 'name' and 'regno' (both must have values)"],
    ["2. The 'regno' column is used to identify existing students"],
    ["3. Only students in your branch can be edited"],
    ["4. Optional columns:"],
    ["   - semcompleted: Number of semesters completed (number)"],
    ["   - cgpa: Current CGPA (number between 0-10)"],
    ["   - numberofbacklogs: Number of backlogs (number)"],
    [""],
    ["5. Only fields with values will be updated"],
    ["6. Don't change column headings"],
  ];
  const notesSheet = xlsx.utils.aoa_to_sheet(notesData);

  console.log('Generating student edit template');
  
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');
  xlsx.utils.book_append_sheet(workbook, notesSheet, 'Instructions');

  const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename=student_edit_template.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(excelBuffer);
};

exports.getCurrentStudent = async (req, res) => {
  try {
    console.log('DEBUG: getCurrentStudent - req.user._id:', req.user._id);
    const student = await User.findById(req.user._id)
      .populate({
        path: 'eligibleDrives',
        options: { sort: { createdAt: -1 } }, // Sort drives by createdAt in descending order
        populate: {
          path: 'applications.student', // Populate the student field inside applications
          select: 'name email' // Select only necessary fields
        }
      })
      .select('-password');

    console.log('DEBUG: Fetched student:', student);

    if (!student || student.role !== 'Student') {
      console.log('DEBUG: Student not found or not a student');
      return res.status(404).json({ message: 'Student not found' });
    }

    // Filter and map the eligibleDrives to include only the necessary details
    const eligibleDrives = student.eligibleDrives.map(drive => {
      const application = drive.applications.find(app => app.student._id.toString() === req.user._id.toString());
      return {
        _id: drive._id,
        companyName: drive.companyName,
        jobTitle: drive.jobTitle,
        location: drive.location,
        salary: drive.salary,
        date: drive.date,
        status: application ? application.status : 'Not Applied',
        createdAt: drive.createdAt // Include createdAt for frontend sorting (if needed)
      };
    });

    console.log('DEBUG: Returning eligibleDrives:', JSON.stringify(eligibleDrives, null, 2));
    res.status(200).json({ eligibleDrives });
  } catch (error) {
    console.error('DEBUG: Error in getCurrentStudent:', error.message);
    res.status(500).json({ message: 'Error fetching student details', error: error.message });
  }
};