const PlacementDrive = require('../models/PlacementDrive');
const AptitudeTest = require('../models/AptitudeTest');
const User = require('../models/User');
const QuizResult = require('../models/QuizResult');

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, filters } = req.body;

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Build filter query - already supports multiple selections
    const filterQuery = {
      date: { $gte: start, $lte: end },
    };
    if (filters.companies && filters.companies.length > 0) {
      filterQuery.companyName = { $in: filters.companies };
    }
    if (filters.roles && filters.roles.length > 0) {
      filterQuery.role = { $in: filters.roles };
    }
    if (filters.branches && filters.branches.length > 0) {
      filterQuery.eligibleBranches = { $in: filters.branches };
    }

    // Fetch data
    const placementDrives = await getPlacementDriveStats(filterQuery);
    const aptitudeTestQuery = {
      createdAt: { $gte: start, $lte: end },
      ...(filters.testTypes && filters.testTypes.length > 0
        ? { title: { $in: filters.testTypes.map((type) => new RegExp(`^${type}`)) } }
        : {}),
    };
    const aptitudeTests = await getAptitudeTestStats(aptitudeTestQuery);
    const phaseProgression = await getPhaseProgressionStats(filterQuery);
    const timeline = await getTimelineData(start, end, filters);

    // Branch Targeting Analysis: Selected students per company and branch
    const branchTargetingAgg = await PlacementDrive.aggregate([
      { $match: filterQuery },
      { $unwind: "$phases" },
      { $match: { "phases.name": "Final Selection" } },
      { $unwind: "$phases.shortlistedStudents" },
      {
        $lookup: {
          from: "users",
          localField: "phases.shortlistedStudents",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      ...(filters.branches && filters.branches.length > 0
        ? [{ $match: { "student.branch": { $in: filters.branches } } }]
        : []),
      {
        $group: {
          _id: { company: "$companyName", branch: "$student.branch" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.company",
          branches: {
            $push: {
              branch: "$_id.branch",
              count: "$count",
            },
          },
        },
      },
    ]);

    // Get unique companies and branches
    const companies = [...new Set(branchTargetingAgg.map((company) => company._id))];
    const branches = [
      ...new Set(branchTargetingAgg.flatMap((company) => company.branches.map((b) => b.branch))),
    ].sort();

    // Build the 2D array for chart data
    const branchTargetingData = companies.map((company) => {
      const companyData = branchTargetingAgg.find((c) => c._id === company) || { branches: [] };
      return branches.map((branch) => {
        const branchData = companyData.branches.find((b) => b.branch === branch);
        return branchData ? branchData.count : 0;
      });
    });

    // Calculate summary metrics
    const summary = {
      totalDrives: placementDrives.length,
      conversionRate: calculateConversionRate(placementDrives),
      avgAptitudeScore: calculateAvgAptitudeScore(aptitudeTests),
      totalPlacements: placementDrives.reduce((total, drive) => total + (drive.selectedCount || 0), 0),
    };

    const aptitudeSummary = {
      totalTests: aptitudeTests.tests.length,
      passRate: aptitudeTests.passRate,
      participationRate: aptitudeTests.participationRate,
    };

    // Send response
    res.json({
      summary,
      placementDrives,
      aptitudeTests: aptitudeTests.tests,
      phaseProgression,
      aptitudeSummary,
      aptitudePerformanceTrend: aptitudeTests.performanceTrend,
      timeline,
      branchTargeting: {
        companies,
        branches,
        data: branchTargetingData,
      },
    });
  } catch (error) {
    console.error('Error generating analytics dashboard:', error);
    res.status(500).json({ error: 'Failed to generate analytics data' });
  }
};

// Updated Aptitude Test Statistics with QuizResult instead of TestResult
async function getAptitudeTestStats(filterQuery) {
  const aptitudeTests = await AptitudeTest.aggregate([
    { $match: filterQuery },
    {
      $project: {
        title: 1,
        description: 1,
        questionCount: { $size: "$questions" },
        duration: 1,
        createdAt: 1,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  // Fetch quiz results
  const quizResults = await QuizResult.aggregate([
    {
      $match: {
        test: { $in: aptitudeTests.map((test) => test._id) },
      },
    },
    {
      $group: {
        _id: "$test",
        avgScore: { $avg: { $divide: ["$score", "$totalMarks"] } }, // Calculate percentage
        totalParticipants: { $sum: 1 },
        passCount: {
          $sum: {
            $cond: [
              { $gte: [{ $divide: ["$score", "$totalMarks"] }, 0.4] }, // Assuming 40% is passing
              1, 
              0
            ],
          },
        },
      },
    },
  ]);

  // Calculate unique participants
  const uniqueParticipants = await QuizResult.distinct("student", {
    test: { $in: aptitudeTests.map((test) => test._id) },
  });
  const totalParticipantsUnique = uniqueParticipants.length;
  const totalPossibleParticipants = await User.countDocuments({ role: 'student' });
  const participationRate = totalPossibleParticipants
    ? Math.round((totalParticipantsUnique / totalPossibleParticipants) * 100)
    : 0;

  // Calculate total participants (test attempts) and passes for pass rate
  const totalParticipants = quizResults.reduce((sum, r) => sum + r.totalParticipants, 0);
  const totalPasses = quizResults.reduce((sum, r) => sum + r.passCount, 0);
  const passRate = totalParticipants ? Math.round((totalPasses / totalParticipants) * 100) : 0;

  // Map test data with results
  const performanceTrend = aptitudeTests.map((test) => {
    const result = quizResults.find((r) => r._id.equals(test._id)) || {
      avgScore: 0,
      passCount: 0,
      totalParticipants: 0,
    };
    const testPassRate = result.totalParticipants
      ? (result.passCount / result.totalParticipants) * 100
      : 0;
    return {
      testId: test._id,
      testName: test.title,
      avgScore: Math.round(result.avgScore * 1000) / 10, // Convert to percentage with 1 decimal
      passRate: Math.round(testPassRate),
      participants: result.totalParticipants,
    };
  });

  return {
    tests: aptitudeTests,
    performanceTrend,
    passRate,
    participationRate,
  };
}

// Placement Drive Statistics function
async function getPlacementDriveStats(filterQuery) {
  return await PlacementDrive.aggregate([
    { $match: filterQuery },
    {
      $project: {
        companyName: 1,
        role: 1,
        minCGPA: 1,
        eligibleBranches: 1,
        date: 1,
        status: 1,
        applicationCount: { $size: "$applications" },
        applications: 1,
        phases: 1,
      },
    },
    {
      $addFields: {
        selectedCount: {
          $reduce: {
            input: "$phases",
            initialValue: 0,
            in: {
              $cond: [
                { $eq: ["$$this.name", "Final Selection"] },
                { $size: "$$this.shortlistedStudents" },
                "$$value",
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        conversionRate: {
          $cond: [
            { $eq: ["$applicationCount", 0] },
            0,
            { $multiply: [{ $divide: ["$selectedCount", "$applicationCount"] }, 100] },
          ],
        },
      },
    },
    { $sort: { date: -1 } },
  ]);
}

// Phase Progression Statistics
async function getPhaseProgressionStats(filterQuery) {
  const applicationCount = await PlacementDrive.aggregate([
    { $match: filterQuery },
    { $group: { _id: null, count: { $sum: { $size: "$applications" } } } },
  ]);
  const phaseCounts = await PlacementDrive.aggregate([
    { $match: filterQuery },
    { $unwind: "$phases" },
    { $group: { _id: "$phases.name", count: { $sum: { $size: "$phases.shortlistedStudents" } } } },
  ]);

  const phaseProgression = {
    applied: applicationCount.length > 0 ? applicationCount[0].count : 0,
    resumeScreening: 0,
    writtenTest: 0,
    aptitudeTest: 0,
    codingTest: 0,
    interviewHR: 0,
    interviewTechnical: 0,
    selected: 0,
  };
  phaseCounts.forEach((phase) => {
    const phaseMap = {
      'Resume Screening': 'resumeScreening',
      'Written Test': 'writtenTest',
      'Aptitude Test': 'aptitudeTest',
      'Coding Test': 'codingTest',
      'HR Interview': 'interviewHR',
      'Technical Interview': 'interviewTechnical',
      'Final Selection': 'selected',
    };
    const key = phaseMap[phase._id] || phase._id.toLowerCase().replace(/\s+/g, '');
    phaseProgression[key] = phase.count;
  });
  return phaseProgression;
}

// Timeline Data function
async function getTimelineData(start, end, filters) {
  const timeline = [];
  const placementDrives = await PlacementDrive.find({
    date: { $gte: start, $lte: end },
    ...(filters.companies && filters.companies.length > 0 ? { companyName: { $in: filters.companies } } : {}),
    ...(filters.roles && filters.roles.length > 0 ? { role: { $in: filters.roles } } : {}),
    ...(filters.branches && filters.branches.length > 0 ? { eligibleBranches: { $in: filters.branches } } : {}),
  }).select('companyName role date status');

  placementDrives.forEach((drive) => {
    timeline.push({
      date: drive.date,
      type: 'Placement Drive',
      title: drive.companyName,
      details: drive.role,
      status: drive.status || 'Completed',
    });
  });

  const aptitudeTests = await AptitudeTest.find({
    createdAt: { $gte: start, $lte: end },
    ...(filters.testTypes && filters.testTypes.length > 0
      ? { title: { $in: filters.testTypes.map((type) => new RegExp(`^${type}`)) } }
      : {}),
  }).select('title createdAt duration');

  aptitudeTests.forEach((test) => {
    timeline.push({
      date: test.createdAt,
      type: 'Aptitude Test',
      title: test.title,
      details: `Duration: ${test.duration || 60} mins`,
      status: 'Completed',
    });
  });

  return timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Helper function to calculate conversion rate
function calculateConversionRate(drives) {
  const totalApplications = drives.reduce((sum, drive) => sum + drive.applicationCount, 0);
  const totalSelections = drives.reduce((sum, drive) => sum + drive.selectedCount, 0);
  return totalApplications ? Math.round((totalSelections / totalApplications) * 100) : 0;
}

// Helper function to calculate average aptitude score
function calculateAvgAptitudeScore(aptitudeTestsData) {
  if (!aptitudeTestsData.performanceTrend.length) return 0;
  const totalScoreWeighted = aptitudeTestsData.performanceTrend.reduce(
    (sum, test) => sum + test.avgScore * test.participants,
    0
  );
  const totalParticipants = aptitudeTestsData.performanceTrend.reduce(
    (sum, test) => sum + test.participants,
    0
  );
  return totalParticipants ? Math.round((totalScoreWeighted / totalParticipants) * 10) / 10 : 0;
}