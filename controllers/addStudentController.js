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

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find student and ensure they're from advisor's branch
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

// Update student


// List students for advisor
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

// Fixed updateStudent function
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const advisorBranch = req.user.branch;

    // Find student and ensure they're from advisor's branch
    const student = await User.findOne({ 
      _id: id, 
      role: 'Student', 
      branch: advisorBranch 
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found or unauthorized' });
    }

    // Validate incoming data
    const validationErrors = validateStudentData({...student.toObject(), ...updateData}, advisorBranch);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }

    // Update student
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

    res.json({
      message: 'Student updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate key error',
        duplicateField: Object.keys(error.keyPattern)[0]
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Fixed editStudentsBulk function
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
      header: 'A'   // Use letter headers to avoid Excel's auto-formatting
    });
    
    if (worksheet.length <= 1) { // Account for header row
      console.log('Error: Excel file contains no data');
      return res.status(400).json({ message: 'Excel file contains no data' });
    }

    console.log(`Found ${worksheet.length - 1} data rows in the Excel file`);
    
    // Extract headers from first row and normalize them
    const headers = {};
    const headerRow = worksheet[0];
    Object.keys(headerRow).forEach(cell => {
      const value = headerRow[cell] ? String(headerRow[cell]).toLowerCase().trim() : '';
      headers[cell] = value;
    });
    
    // Map Excel columns to database fields
    const fieldMap = {
      'name': 'name',
      'regno': 'registrationNumber',
      'semcompleted': 'semestersCompleted',
      'cgpa': 'cgpa',
      'numberofbacklogs': 'numberOfBacklogs'
    };
    
    // Find column letters for required fields
    const nameColumn = Object.keys(headers).find(key => headers[key] === 'name');
    const regNoColumn = Object.keys(headers).find(key => headers[key] === 'regno');
    
    if (!nameColumn || !regNoColumn) {
      return res.status(400).json({ 
        message: 'Excel file is missing required columns: name and/or regno' 
      });
    }
    
    const processedStudents = [];
    const errors = [];

    // Process each row (skip the header row)
    for (let i = 1; i < worksheet.length; i++) {
      const rowNumber = i + 1; // Excel is 1-based
      const row = worksheet[i];
      
      // Skip empty rows
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

      // Prepare the update object
      const updateData = { name: row[nameColumn] };
      
      // Add other fields if they exist
      Object.keys(headers).forEach(col => {
        const fieldName = fieldMap[headers[col]];
        if (fieldName && row[col] !== undefined && row[col] !== '') {
          // Convert numeric values
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
      
      // Set the updatedAt timestamp
      updateData.updatedAt = Date.now();
      
      console.log(`Row ${rowNumber}: Processing student with regNo: ${row[regNoColumn]}`);

      try {
        // Find the student by registration number
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

        // Validate the update
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
        
        // Update student document
        const updatedStudent = await User.findOneAndUpdate(
          { registrationNumber, branch: advisorBranch },
          { $set: updateData },
          { new: true, runValidators: true }
        );
        
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
    
    // Specific error handling for different error types
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

// Fixed editStudentUploadTemplate function
exports.editStudentUploadTemplate = (req, res) => {
  // Only include header names as requested
  const headers = [
    'name', 'regno', 'semcompleted', 'cgpa', 'numberofbacklogs'
  ];


  // Create worksheet with headers 
  const worksheet = xlsx.utils.aoa_to_sheet([headers]);
  
  // Add some formatting to headers
  const range = xlsx.utils.decode_range(worksheet['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = xlsx.utils.encode_col(C) + "1"; // column header row
    if(!worksheet[address]) continue;
    worksheet[address].s = { 
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } }
    };
  }

  // Add a notes sheet with clearer instructions
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