const express = require('express');
const router = express.Router();
const AptitudeTest = require('../models/AptitudeTest');
const QuizResult = require('../models/QuizResult');
const { isAuthenticated, checkRole } = require('../middleware/authMiddleware');


// ==================== Student Routes ====================

// Get available quizzes for a student
router.get('/available', isAuthenticated, checkRole(['Student']), async (req, res) => {
    try {
      console.log('STUDENT ROUTE: /available accessed');
      // Find all tests
      const allTests = await AptitudeTest.find().sort({ createdAt: -1 });
      
      // Find tests the student has already attempted
      const attemptedTests = await QuizResult.find({ student: req.user._id }).select('test');
      const attemptedTestIds = attemptedTests.map(result => result.test.toString());
      
      // Filter out tests the student has already attempted
      const availableTests = allTests.filter(test => !attemptedTestIds.includes(test._id.toString()));
      
      res.status(200).json({ tests: availableTests });
    } catch (error) {
      console.error('Error fetching available tests:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Get a specific quiz for taking (excluding correctOption)
  router.get('/take/:id', isAuthenticated, checkRole(['Student']), async (req, res) => {
    try {
      // Check if student has already attempted this quiz
      const existingResult = await QuizResult.findOne({
        student: req.user._id,
        test: req.params.id
      });
  
      if (existingResult) {
        return res.status(400).json({ message: 'You have already attempted this quiz' });
      }
  
      // Fetch the test
      const test = await AptitudeTest.findById(req.params.id);
      
      if (!test) {
        return res.status(404).json({ message: 'Aptitude test not found' });
      }
  
      // Create a safe version of the test without correct answers
      const safeTest = {
        _id: test._id,
        title: test.title,
        description: test.description,
        duration: test.duration,
        questions: test.questions.map(q => ({
          _id: q._id,
          question: q.question,
          options: q.options,
          marks: q.marks
          // correctOption is omitted
        })),
        createdAt: test.createdAt
      };
  
      res.status(200).json({ test: safeTest });
    } catch (error) {
      console.error('Error fetching test for taking:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Submit answers for a quiz
  router.post('/:id/submit', isAuthenticated, checkRole(['Student']), async (req, res) => {
    try {
      const { answers } = req.body;
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: 'Valid answers array is required' });
      }
      const existingResult = await QuizResult.findOne({
        student: req.user._id,
        test: req.params.id
      });
      if (existingResult) {
        return res.status(400).json({ message: 'You have already attempted this quiz' });
      }
      const test = await AptitudeTest.findById(req.params.id);
      if (!test) {
        return res.status(404).json({ message: 'Aptitude test not found' });
      }
      if (answers.length !== test.questions.length) {
        return res.status(400).json({ message: 'Number of answers does not match number of questions' });
      }
      let score = 0;
      let totalMarks = 0;
      test.questions.forEach((question, index) => {
        totalMarks += question.marks;
        if (answers[index] === question.correctOption) {
          score += question.marks;
        }
      });
      const quizResult = new QuizResult({
        student: req.user._id,
        test: test._id,
        answers,
        score,
        totalMarks
      });
      await quizResult.save();
      console.log('Quiz result saved with ID:', quizResult._id);
  
      // Fetch the full result with populated fields
      const populatedResult = await QuizResult.findById(quizResult._id)
        .populate({
          path: 'test',
          select: 'title description duration questions createdAt'
        })
        .populate({
          path: 'student',
          select: 'name email'
        });
  
      res.status(201).json({
        message: 'Quiz submitted successfully',
        result: populatedResult
      });
    } catch (error) {
      console.error('Error submitting quiz answers:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Get all results for a specific student (for student analytics)
  router.get('/result/:studentId', isAuthenticated, async (req, res) => {
    try {
      if (
        req.user.role !== 'Coordinator' && 
        req.user._id.toString() !== req.params.studentId
      ) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }
      const results = await QuizResult.find({ student: req.params.studentId })
        .populate({
          path: 'test',
          select: 'title description duration questions createdAt'
        })
        .sort({ submittedAt: -1 });
  
      const totalAttempts = results.length;
      const highestScore = results.length > 0 
        ? Math.max(...results.map(r => (r.score / r.totalMarks) * 100))
        : 0;
      const averageScore = results.length > 0 
        ? (results.reduce((sum, r) => sum + (r.score / r.totalMarks) * 100, 0) / results.length)
        : 0;
  
      res.json({
        results,
        analytics: {
          totalAttempts,
          highestScore: parseFloat(highestScore.toFixed(2)),
          averageScore: parseFloat(averageScore.toFixed(2))
        }
      });
    } catch (error) {
      console.error('Error fetching student results:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get specific quiz result (for viewing individual result)
  router.get('/result/:id', isAuthenticated, async (req, res) => {
    try {
      const result = await QuizResult.findById(req.params.id)
        .populate({
          path: 'test',
          select: 'title description duration questions createdAt'
        })
        .populate({
          path: 'student',
          select: 'name email'
        });
  
      if (!result) {
        return res.status(404).json({ message: 'Result not found' });
      }
  
      // Ensure the requesting user can only access their own results
      // or a coordinator can access any result
      if (
        req.user.role !== 'Coordinator' && 
        req.user._id.toString() !== result.student._id.toString()
      ) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }
  
      res.json(result);
    } catch (error) {
      console.error('Error fetching quiz result:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get all results for a specific test (for coordinator analytics)
  router.get('/test/:testId', isAuthenticated, checkRole(['Coordinator']), async (req, res) => {
    try {
      const results = await QuizResult.find({ test: req.params.testId })
        .populate({
          path: 'student',
          select: 'name email branch'
        });
  
      const test = await AptitudeTest.findById(req.params.testId);
      
      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }
  
      // Calculate test analytics
      const totalParticipants = results.length;
      const averageScore = results.length > 0 
        ? results.reduce((sum, r) => sum + r.score, 0) / results.length 
        : 0;
      const highestScore = results.length > 0 ? Math.max(...results.map(r => r.score)) : 0;
      const lowestScore = results.length > 0 ? Math.min(...results.map(r => r.score)) : 0;
  
      res.json({
        results,
        analytics: {
          totalParticipants,
          averageScore: parseFloat(averageScore.toFixed(2)),
          highestScore,
          lowestScore
        },
        test
      });
    } catch (error) {
      console.error('Error fetching test results:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
// ==================== Coordinator Routes ====================

// Create a new aptitude test
router.post('/create', isAuthenticated, checkRole(['Coordinator']), async (req, res) => {
  try {
    const { title, description, questions, duration } = req.body;

    // Validate duration
    if (!duration || duration <= 0) {
      return res.status(400).json({ message: 'Valid duration is required' });
    }

    // Validate questions
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'At least one question is required' });
    }

    // Validate each question
    for (const q of questions) {
      if (!q.question || !q.options || q.options.length !== 4 || 
          q.correctOption === undefined || q.correctOption < 0 || q.correctOption > 3 || 
          !q.marks || q.marks <= 0) {
        return res.status(400).json({ message: 'Invalid question format' });
      }
    }

    const newTest = new AptitudeTest({
      title,
      description,
      questions,
      duration,
      createdBy: req.user._id
    });

    await newTest.save();
    res.status(201).json({ message: 'Aptitude test created successfully', test: newTest });
  } catch (error) {
    console.error('Error creating aptitude test:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all aptitude tests (for coordinators)
router.get('/', isAuthenticated, checkRole(['Coordinator']), async (req, res) => {
  try {
    console.log('COORDINATOR ROUTE: / accessed');
    const tests = await AptitudeTest.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ tests });
  } catch (error) {
    console.error('Error fetching aptitude tests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific aptitude test by ID (for editing by coordinators)
router.get('/:id', isAuthenticated, checkRole(['Coordinator']), async (req, res) => {
  try {
    const test = await AptitudeTest.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!test) {
      return res.status(404).json({ message: 'Aptitude test not found' });
    }
    
    res.status(200).json({ test });
  } catch (error) {
    console.error('Error fetching aptitude test:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an aptitude test
router.put('/:id', isAuthenticated, checkRole(['Coordinator']), async (req, res) => {
  try {
    const { title, description, questions, duration } = req.body;
    
    // Validate duration
    if (!duration || duration <= 0) {
      return res.status(400).json({ message: 'Valid duration is required' });
    }

    // Validate questions
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'At least one question is required' });
    }

    const test = await AptitudeTest.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ message: 'Aptitude test not found' });
    }

    // Update the test
    test.title = title;
    test.description = description;
    test.questions = questions;
    test.duration = duration;
    test.updatedAt = Date.now();

    await test.save();
    res.status(200).json({ message: 'Aptitude test updated successfully', test });
  } catch (error) {
    console.error('Error updating aptitude test:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete an aptitude test
router.delete('/:id', isAuthenticated, checkRole(['Coordinator']), async (req, res) => {
  try {
    const test = await AptitudeTest.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ message: 'Aptitude test not found' });
    }

    // Delete the test and associated results
    await Promise.all([
      AptitudeTest.findByIdAndDelete(req.params.id),
      QuizResult.deleteMany({ test: req.params.id })
    ]);

    res.status(200).json({ message: 'Aptitude test deleted successfully' });
  } catch (error) {
    console.error('Error deleting aptitude test:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;