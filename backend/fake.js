// seed.js - Database seeding script for campus placement system
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

// Import all models
const User = require('./models/User');
const AptitudeTest = require('./models/AptitudeTest');
const Event = require('./models/Event');
const Job = require('./models/Job');
const PlacementDrive = require('./models/PlacementDrive');
const QuizResult = require('./models/QuizResult');
const RegistrationRequest = require('./models/RegistrationRequest');
const Resource = require('./models/Resource');
const TestResult = require('./models/TestResult');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/placement-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Configuration
const NUM_STUDENTS = 500;
const NUM_ALUMNI = 50;
const NUM_EVENTS = 30;
const NUM_JOBS = 100;
const NUM_PLACEMENT_DRIVES = 40;
const NUM_APTITUDE_TESTS = 20;
const NUM_RESOURCES = 50;

// Helper arrays
const BRANCHES = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AE', 'CHE', 'BME'];
const BATCH_YEARS = [2020, 2021, 2022, 2023, 2024];
const EVENT_VENUES = ['Main Auditorium', 'Seminar Hall', 'Computer Lab', 'Classroom A1', 'Classroom B2', 'Conference Room', 'Library Hall'];
const COMPANY_NAMES = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Facebook', 'Netflix', 'IBM', 'Oracle', 'Intel', 'Adobe', 'Cisco', 'Infosys', 'TCS', 'Wipro', 'HCL', 'Cognizant', 'Accenture', 'Deloitte', 'KPMG', 'PwC'];
const COMPANY_DOMAINS = ['Tech', 'Finance', 'Consulting', 'Healthcare', 'Manufacturing', 'Retail', 'Telecommunications', 'Education', 'Entertainment', 'Energy'];
const JOB_TITLES = ['Software Engineer', 'Data Scientist', 'Web Developer', 'System Administrator', 'Network Engineer', 'Database Administrator', 'UI/UX Designer', 'Project Manager', 'Business Analyst', 'Quality Assurance Engineer', 'DevOps Engineer', 'Product Manager', 'Technical Writer', 'Security Specialist', 'Cloud Architect'];
const RESOURCE_TYPES = ['document', 'video', 'link'];
const MIME_TYPES = {
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  video: ['video/mp4', 'video/mpeg', 'video/webm'],
  link: ['text/html']
};

// ========== Helper functions ==========

// Generate a hashed password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Generate a random number within a range
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get random item from array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Get random items from array
function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Generate unique registration number
function generateRegistrationNumber(batchYear, index) {
  return `${batchYear}${Math.floor(Math.random() * 9) + 1}${String(index).padStart(3, '0')}`;
}

// Create a date in recent past
function getRecentPastDate(daysAgo = 60) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
}

// Create a date in near future
function getNearFutureDate(daysAhead = 60) {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead));
  return date;
}

// Check if student is eligible for placement drive
function isStudentEligibleForDrive(student, drive) {
  return (
    student.semestersCompleted >= drive.minSemestersCompleted &&
    student.cgpa >= drive.minCGPA &&
    student.numberOfBacklogs <= drive.maxBacklogs &&
    drive.eligibleBranches.includes(student.branch)
  );
}

// ========== Seed database ==========

async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await AptitudeTest.deleteMany({});
    await Event.deleteMany({});
    await Job.deleteMany({});
    await PlacementDrive.deleteMany({});
    await QuizResult.deleteMany({});
    await RegistrationRequest.deleteMany({});
    await Resource.deleteMany({});
    await TestResult.deleteMany({});

    console.log('Cleared existing data');

    // 1. Create users
    const users = {
      students: [],
      coordinators: [],
      advisors: [],
      alumni: []
    };

    // Create coordinators - one for each branch
    console.log('Creating coordinators...');
    for (let i = 0; i < BRANCHES.length; i++) {
      const branch = BRANCHES[i];
      const coordinator = new User({
        name: faker.person.fullName(),
        email: `coordinator.${branch.toLowerCase()}@gcek.ac.in`,
        password: await hashPassword('password123'),
        role: 'Coordinator',
        registered: true,
        branch: branch,
        phoneNumber: faker.phone.number('+91 #### ######'),
        createdAt: getRecentPastDate(365),
        updatedAt: getRecentPastDate(30)
      });
      await coordinator.save();
      users.coordinators.push(coordinator);
    }
    console.log(`Created ${BRANCHES.length} coordinators (one per branch)`);

    // Create advisors - one for each branch and batch year combination
    console.log('Creating advisors...');
    for (const branch of BRANCHES) {
      for (const batchYear of BATCH_YEARS) {
        const advisor = new User({
          name: faker.person.fullName(),
          email: `advisor.${branch.toLowerCase()}.${batchYear}@gcek.ac.in`,
          password: await hashPassword('password123'),
          role: 'Advisor',
          registered: true,
          branch: branch,
          batch: batchYear, // Adding batch year for advisors
          phoneNumber: faker.phone.number('+91 #### ######'),
          createdAt: getRecentPastDate(365),
          updatedAt: getRecentPastDate(30)
        });
        await advisor.save();
        users.advisors.push(advisor);
      }
    }
    console.log(`Created ${BRANCHES.length * BATCH_YEARS.length} advisors (one per branch and batch year)`);

    // Create students
    console.log('Creating students...');
    for (let i = 0; i < NUM_STUDENTS; i++) {
      const batchYear = getRandomItem(BATCH_YEARS);
      const branch = getRandomItem(BRANCHES);
      const semestersCompleted = (2025 - batchYear) * 2; // Rough estimate of completed semesters
      const student = new User({
        name: faker.person.fullName(),
        email: `student${i+1}@gcek.ac.in`,
        password: await hashPassword('password123'),
        role: 'Student',
        registered: true,
        registrationNumber: generateRegistrationNumber(batchYear, i+1),
        batch: batchYear,
        semestersCompleted: Math.min(semestersCompleted, 8), // Max 8 semesters
        cgpa: parseFloat((Math.random() * 4 + 6).toFixed(2)), // CGPA between 6.0 and 10.0
        numberOfBacklogs: Math.random() > 0.8 ? getRandomNumber(1, 3) : 0,
        branch: branch,
        phoneNumber: faker.phone.number('+91 #### ######'),
        createdAt: getRecentPastDate(365),
        updatedAt: getRecentPastDate(30),
        eligibleDrives: [], // Will be populated later
        notifications: []
      });
      await student.save();
      users.students.push(student);
    }
    console.log(`Created ${NUM_STUDENTS} students`);

    // Create alumni
    console.log('Creating alumni...');
    for (let i = 0; i < NUM_ALUMNI; i++) {
      const batchYear = 2016 + i % 4; // Alumni from 2016-2019
      const branch = getRandomItem(BRANCHES);
      const alumni = new User({
        name: faker.person.fullName(),
        email: `alumni${i+1}@gcek.ac.in`,
        password: await hashPassword('password123'),
        role: 'Alumni',
        registered: true,
        batch: batchYear,
        branch: branch,
        phoneNumber: faker.phone.number('+91 #### ######'),
        createdAt: getRecentPastDate(365 * 5), // Created account long ago
        updatedAt: getRecentPastDate(365), // But updated more recently
        cgpa: parseFloat((Math.random() * 4 + 6).toFixed(2)) // CGPA between 6.0 and 10.0
      });
      await alumni.save();
      users.alumni.push(alumni);
    }
    console.log(`Created ${NUM_ALUMNI} alumni`);

    // 2. Create events
    console.log('Creating events...');
    const events = [];
    for (let i = 0; i < NUM_EVENTS; i++) {
      const isPastEvent = Math.random() > 0.6;
      const eventDate = isPastEvent ? getRecentPastDate(120) : getNearFutureDate(90);
      const relatedBranch = Math.random() > 0.3 ? getRandomItem(BRANCHES) : null; // Some events are branch-specific
      
      // Find the coordinator for this branch if branch-specific
      let mentorName;
      if (relatedBranch) {
        const branchCoordinator = users.coordinators.find(c => c.branch === relatedBranch);
        mentorName = branchCoordinator ? branchCoordinator.name : faker.person.fullName();
      } else {
        mentorName = getRandomItem(users.coordinators).name;
      }
      
      const event = new Event({
        title: faker.word.words({ count: { min: 3, max: 6 } }),
        mentor: mentorName,
        description: faker.lorem.paragraphs(2),
        date: eventDate,
        time: `${getRandomNumber(9, 17)}:${getRandomNumber(0, 1) * 30}`,
        venue: getRandomItem(EVENT_VENUES),
        registeredStudents: isPastEvent 
          ? getRandomItems(
              relatedBranch 
                ? users.students.filter(s => s.branch === relatedBranch)
                : users.students, 
              getRandomNumber(20, 100)
            ).map(s => s._id) 
          : [],
        maxParticipants: getRandomNumber(50, 200)
      });
      await event.save();
      events.push(event);
    }
    console.log(`Created ${NUM_EVENTS} events`);

    // 3. Create resources
    console.log('Creating resources...');
    const resources = [];
    for (let i = 0; i < NUM_RESOURCES; i++) {
      const type = getRandomItem(RESOURCE_TYPES);
      const relatedBranch = Math.random() > 0.5 ? getRandomItem(BRANCHES) : null; // Some resources are branch-specific
      
      const resource = new Resource({
        title: `${relatedBranch ? `[${relatedBranch}] ` : ''}${faker.word.words({ count: { min: 3, max: 6 } })}`,
        description: faker.lorem.paragraph(),
        type: type,
        url: type === 'link' ? faker.internet.url() : null,
        fileName: type !== 'link' ? `file-${i+1}.${type === 'document' ? 'pdf' : 'mp4'}` : null,
        filePath: type !== 'link' ? `/uploads/${type}s/file-${i+1}.${type === 'document' ? 'pdf' : 'mp4'}` : null,
        originalFileName: type !== 'link' ? faker.system.fileName() : null,
        fileSize: type !== 'link' ? getRandomNumber(100000, 10000000) : null,
        uploadDate: getRecentPastDate(180),
        mimeType: type !== 'link' ? getRandomItem(MIME_TYPES[type]) : null
      });
      await resource.save();
      resources.push(resource);
    }
    console.log(`Created ${NUM_RESOURCES} resources`);

    // 4. Create jobs
    console.log('Creating jobs...');
    const jobs = [];
    for (let i = 0; i < NUM_JOBS; i++) {
      const preferredBranches = getRandomItems(BRANCHES, getRandomNumber(1, 3));
      const jobTitle = getRandomItem(JOB_TITLES);
      
      const job = new Job({
        title: `${jobTitle}${preferredBranches.length < 3 ? ` (${preferredBranches.join('/')})` : ''}`,
        company: getRandomItem(COMPANY_NAMES),
        description: `${faker.lorem.paragraphs(3)}\n\nPreferred branches: ${preferredBranches.join(', ')}`,
        applyUrl: `https://${faker.internet.domainName()}/careers/apply`,
        applicationDeadline: getNearFutureDate(90),
        createdAt: getRecentPastDate(30),
        updatedAt: getRecentPastDate(15)
      });
      await job.save();
      jobs.push(job);
    }
    console.log(`Created ${NUM_JOBS} jobs`);

    // 5. Create aptitude tests
    console.log('Creating aptitude tests...');
    const aptitudeTests = [];
    for (let i = 0; i < NUM_APTITUDE_TESTS; i++) {
      const questions = [];
      const numQuestions = getRandomNumber(20, 50);
      const createdByCoordinator = getRandomItem(users.coordinators);
      
      for (let j = 0; j < numQuestions; j++) {
        const options = [
          faker.lorem.sentence(),
          faker.lorem.sentence(),
          faker.lorem.sentence(),
          faker.lorem.sentence()
        ];
        
        questions.push({
          question: faker.lorem.sentence() + '?',
          options: options,
          correctOption: Math.floor(Math.random() * 4),
          marks: Math.random() > 0.2 ? 1 : 2 // Most questions 1 mark, some 2 marks
        });
      }
      
      const aptitudeTest = new AptitudeTest({
        title: `${faker.company.name()} Aptitude Test ${i+1}`,
        description: faker.lorem.paragraph(),
        questions: questions,
        duration: getRandomNumber(30, 120),
        createdBy: createdByCoordinator._id,
        createdAt: getRecentPastDate(60),
        updatedAt: getRecentPastDate(30)
      });
      await aptitudeTest.save();
      aptitudeTests.push(aptitudeTest);
    }
    console.log(`Created ${NUM_APTITUDE_TESTS} aptitude tests`);

    // 6. Create placement drives
    console.log('Creating placement drives...');
    const placementDrives = [];
    for (let i = 0; i < NUM_PLACEMENT_DRIVES; i++) {
      const isPastDrive = Math.random() > 0.7;
      const driveDate = isPastDrive ? getRecentPastDate(120) : getNearFutureDate(60);
      const eligibleBranches = getRandomItems(BRANCHES, getRandomNumber(1, BRANCHES.length));
      const minCGPA = parseFloat((Math.random() * 2 + 6).toFixed(1)); // Between 6.0 and 8.0
      const maxBacklogs = Math.random() > 0.5 ? 0 : getRandomNumber(1, 2);
      const minSemestersCompleted = getRandomNumber(4, 8);
      
      // Get coordinator from one of the eligible branches
      const responsibleBranch = getRandomItem(eligibleBranches);
      const responsibleCoordinator = users.coordinators.find(c => c.branch === responsibleBranch);
      
      // Create phases
      const numPhases = getRandomNumber(3, 7);
      const phaseTypes = [
        'Resume Screening', 
        'Written Test', 
        'Interview HR', 
        'Interview Technical', 
        'Aptitude Test', 
        'Coding Test', 
        'Final Selection'
      ];
      
      const phases = [];
      for (let j = 0; j < numPhases; j++) {
        phases.push({
          name: phaseTypes[j % phaseTypes.length],
          shortlistedStudents: isPastDrive && j < numPhases - 1 ? [] : [], // Will populate later
          requirements: faker.lorem.paragraph(),
          instructions: faker.lorem.paragraph(),
          createdAt: getRecentPastDate(60),
          updatedAt: getRecentPastDate(30)
        });
      }
      
      const placementDrive = new PlacementDrive({
        companyName: getRandomItem(COMPANY_NAMES),
        role: getRandomItem(JOB_TITLES),
        description: faker.lorem.paragraphs(2),
        minCGPA: minCGPA,
        maxBacklogs: maxBacklogs,
        eligibleBranches: eligibleBranches,
        minSemestersCompleted: minSemestersCompleted,
        date: driveDate,
        applications: [], // Will be populated
        phases: phases,
        status: isPastDrive ? (Math.random() > 0.5 ? 'Completed' : 'In Progress') : 'Open',
        createdBy: responsibleCoordinator._id,
        createdAt: getRecentPastDate(60),
        updatedAt: getRecentPastDate(30)
      });
      
      await placementDrive.save();
      placementDrives.push(placementDrive);
    }
    console.log(`Created ${NUM_PLACEMENT_DRIVES} placement drives`);

    // 7. Process eligibility and applications for students
    console.log('Processing student eligibility and applications...');
    const applicationStatuses = ['Applied', 'Interview', 'Selected', 'Rejected'];
    
    for (const student of users.students) {
      const eligibleDrives = [];
      
      for (const drive of placementDrives) {
        if (isStudentEligibleForDrive(student, drive)) {
          eligibleDrives.push(drive._id);
          
          // 70% chance eligible student applies
          if (Math.random() < 0.7) {
            const status = drive.status === 'Completed' 
              ? getRandomItem(applicationStatuses)
              : drive.status === 'In Progress'
                ? applicationStatuses.slice(0, 3)[Math.floor(Math.random() * 3)]
                : 'Applied';
                
            const application = {
              student: student._id,
              status: status,
              appliedAt: getRecentPastDate(30),
              updatedAt: getRecentPastDate(15)
            };
            
            drive.applications.push(application);
            
            // If student is selected or in interview, add to shortlisted in phases
            if (status === 'Selected' || status === 'Interview') {
              const numPhases = Math.min(drive.phases.length, status === 'Selected' ? drive.phases.length : getRandomNumber(1, drive.phases.length - 1));
              
              for (let i = 0; i < numPhases; i++) {
                drive.phases[i].shortlistedStudents.push(student._id);
              }
            }
            
            // Add notification from the drive's creator (coordinator)
            const coordinator = users.coordinators.find(c => c._id.equals(drive.createdBy));
            
            student.notifications.push({
              message: `You have been ${status.toLowerCase()} for the ${drive.role} position at ${drive.companyName}.`,
              type: status === 'Rejected' ? 'error' : status === 'Selected' ? 'success' : 'info',
              read: Math.random() > 0.5,
              createdAt: getRecentPastDate(15),
              link: `/placement-drives/${drive._id}`,
              relatedId: drive._id
            });
          }
        }
      }
      
      // Add advisor-specific notifications
      const studentAdvisor = users.advisors.find(a => 
        a.branch === student.branch && a.batch === student.batch
      );
      
      if (studentAdvisor && Math.random() > 0.7) {
        student.notifications.push({
          message: `Your advisor ${studentAdvisor.name} has scheduled a meeting for career guidance.`,
          type: 'info',
          read: Math.random() > 0.5,
          createdAt: getRecentPastDate(7)
        });
      }
      
      // Update student with eligible drives
      student.eligibleDrives = eligibleDrives;
      await student.save();
    }
    
    // Save updated placement drives with applications
    for (const drive of placementDrives) {
      await drive.save();
    }
    console.log('Processed student eligibility and applications');

    // 8. Create quiz results
    console.log('Creating quiz results...');
    const quizResults = [];
    // Only 60% of students take the tests
    const studentsWhoTookTests = getRandomItems(users.students, Math.floor(users.students.length * 0.6));
    
    for (const test of aptitudeTests) {
      // Each test is taken by a random subset of students
      const testTakers = getRandomItems(studentsWhoTookTests, getRandomNumber(Math.floor(studentsWhoTookTests.length * 0.3), Math.floor(studentsWhoTookTests.length * 0.8)));
      
      for (const student of testTakers) {
        const answers = [];
        let score = 0;
        let totalMarks = 0;
        
        for (const question of test.questions) {
          // 60-90% chance of getting the answer right based on CGPA
          const isCorrect = Math.random() < (0.6 + (student.cgpa - 6) / 10);
          const answer = isCorrect ? question.correctOption : Math.floor(Math.random() * 4);
          answers.push(answer);
          
          totalMarks += question.marks;
          if (isCorrect) score += question.marks;
        }
        
        const quizResult = new QuizResult({
          student: student._id,
          test: test._id,
          answers: answers,
          score: score,
          totalMarks: totalMarks,
          submittedAt: getRecentPastDate(30)
        });
        
        // try/catch to handle the unique compound index constraint
        try {
          await quizResult.save();
          quizResults.push(quizResult);
        } catch (error) {
          if (error.code !== 11000) { // Ignore duplicate key errors
            throw error;
          }
        }
      }
    }
    console.log(`Created ${quizResults.length} quiz results`);

    // 9. Create test results (same as quiz results but with more details)
    console.log('Creating test results...');
    const testResults = [];
    
    for (const test of aptitudeTests) {
      // Each test is taken by a different random subset of students
      const testTakers = getRandomItems(users.students, getRandomNumber(Math.floor(users.students.length * 0.3), Math.floor(users.students.length * 0.7)));
      
      for (const student of testTakers) {
        const answers = [];
        let score = 0;
        const passingScore = Math.floor(test.questions.reduce((total, q) => total + q.marks, 0) * 0.6);
        const maxScore = test.questions.reduce((total, q) => total + q.marks, 0);
        
        for (const question of test.questions) {
          // 60-90% chance of getting the answer right based on CGPA
          const isCorrect = Math.random() < (0.6 + (student.cgpa - 6) / 10);
          const answer = isCorrect ? question.correctOption : Math.floor(Math.random() * 4);
          
          answers.push({
            questionId: mongoose.Types.ObjectId(), // Fake ID for the question
            selectedOption: answer,
            isCorrect: isCorrect
          });
          
          if (isCorrect) score += question.marks;
        }
        
        const timeSpent = getRandomNumber(Math.floor(test.duration * 0.4), test.duration);
        
        const testResult = new TestResult({
          testId: test._id,
          student: student._id,
          score: score,
          passingScore: passingScore,
          maxScore: maxScore,
          answers: answers,
          timeSpent: timeSpent,
          status: 'Completed',
          completedAt: getRecentPastDate(30)
        });
        
        // try/catch to handle the unique compound index constraint
        try {
          await testResult.save();
          testResults.push(testResult);
        } catch (error) {
          if (error.code !== 11000) { // Ignore duplicate key errors
            throw error;
          }
        }
      }
    }
    console.log(`Created ${testResults.length} test results`);

    // 10. Create some pending registration requests
    console.log('Creating registration requests...');
    const registrationRequests = [];
    for (let i = 0; i < 20; i++) {
      const status = ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)];
      const branch = getRandomItem(BRANCHES);
      const batchYear = getRandomItem(BATCH_YEARS);
      
      const registrationRequest = new RegistrationRequest({
        name: faker.person.fullName(),
        email: `pending${i+1}@gcek.ac.in`,
        batchYear: batchYear,
        branch: branch,
        password: await hashPassword('password123'),
        status: status,
        createdAt: getRecentPastDate(5)
      });
      await registrationRequest.save();
      registrationRequests.push(registrationRequest);
    }
    console.log(`Created ${registrationRequests.length} registration requests`);

    console.log('Database seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// Run the seeding
seedDatabase();
