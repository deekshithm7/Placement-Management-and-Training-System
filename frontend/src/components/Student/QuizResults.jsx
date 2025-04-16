import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Award, Check, X } from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const QuizResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const submissionResult = location.state?.submissionResult;

  useEffect(() => {
    if (submissionResult) {
      setResult(submissionResult);
      setLoading(false);
      return;
    }
    const fetchResult = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/aptitude-tests/result/${id}`, { withCredentials: true });
        setResult(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quiz result:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to fetch quiz result.');
        setLoading(false);
      }
    };
    fetchResult();
  }, [id, submissionResult]);

  const calculatePercentage = (score, totalMarks) => ((score / totalMarks) * 100).toFixed(2);
  const getPerformanceMessage = (percentage) => {
    if (percentage >= 90) return 'Outstanding performance!';
    if (percentage >= 75) return 'Excellent work!';
    if (percentage >= 60) return 'Good job!';
    if (percentage >= 50) return 'Satisfactory result.';
    return 'Keep practicing to improve.';
  };

  if (loading) return (
    <div className="min-h-screen bg-primary-bg p-4 sm:p-6 flex justify-center items-center font-sans">
      <div className="text-text-secondary animate-pulse">Loading results...</div>
    </div>
  );

  if (error || !result || !result.test) return (
    <div className="min-h-screen bg-primary-bg p-4 sm:p-6 flex flex-col items-center font-sans">
      <div className="w-full max-w-4xl bg-secondary-bg rounded-xl p-6 shadow-glass text-text-primary">
        <h2 className="text-xl font-semibold text-error mb-4">Error</h2>
        <p className="text-text-secondary mb-6">{error || 'The requested quiz result could not be found.'}</p>
        <button 
          onClick={() => navigate('/student/aptitude-tests')}
          className="bg-gradient-to-r from-highlight to-accent hover:from-accent hover:to-highlight text-text-primary px-4 py-2 rounded-lg flex items-center transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="mr-2" size={18} /> Back to Tests
        </button>
      </div>
    </div>
  );

  const percentage = calculatePercentage(result.score, result.totalMarks);
  const performanceMessage = getPerformanceMessage(percentage);
  const hasDetailedAnswers = result.answers && result.test.questions && result.test.questions[0].correctOption !== undefined;

  return (
    <div className="min-h-screen bg-primary-bg p-4 sm:p-6 flex flex-col items-center font-sans">
      <div className="w-full max-w-4xl bg-secondary-bg rounded-xl p-6 shadow-glass text-text-primary animate-fade-in">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2">{result.test.title} - Results</h2>
        <p className="text-text-secondary mb-6">Submitted on {new Date(result.submittedAt).toLocaleString()}</p>
        <div className="bg-primary-bg rounded-lg p-6 mb-6 shadow-glass">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center mb-4 md:mb-0">
              <Award className="text-accent mr-3" size={36} />
              <div>
                <h3 className="text-xl font-semibold">Your Score</h3>
                <p className="text-3xl font-bold text-highlight">{result.score} / {result.totalMarks}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold">{percentage}%</div>
              <div className={`text-sm ${parseInt(percentage) >= 60 ? 'text-accent' : 'text-yellow-400'}`}>
                {performanceMessage}
              </div>
            </div>
          </div>
        </div>
        {hasDetailedAnswers && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Question Breakdown</h3>
            <div className="space-y-4">
              {result.test.questions.map((question, idx) => (
                <div key={idx} className="bg-primary-bg rounded-lg p-4 shadow-glass">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="mr-0 sm:mr-3 mt-1">
                      {result.answers[idx] === question.correctOption ? (
                        <Check className="text-accent" size={20} />
                      ) : (
                        <X className="text-error" size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{question.question}</p>
                      <div className="mt-2 text-sm text-text-secondary">
                        <p>Your answer: <span className={result.answers[idx] === question.correctOption ? 'text-accent' : 'text-error'}>{question.options[result.answers[idx]]}</span></p>
                        {result.answers[idx] !== question.correctOption && (
                          <p>Correct answer: <span className="text-accent">{question.options[question.correctOption]}</span></p>
                        )}
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <span className={`text-sm ${result.answers[idx] === question.correctOption ? 'text-accent' : 'text-error'}`}>
                        {result.answers[idx] === question.correctOption ? `+${question.marks}` : '0'} / {question.marks}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <button 
            onClick={() => navigate('/student/aptitude-tests')}
            className="w-full sm:w-auto bg-gradient-to-r from-highlight to-accent hover:from-accent hover:to-highlight text-text-primary px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="mr-2" size={18} /> Back to Tests
          </button>
          <button 
            onClick={() => navigate('/student/analytics')}
            className="w-full sm:w-auto bg-gradient-to-r from-highlight to-accent hover:from-accent hover:to-highlight text-text-primary px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105"
          >
            View All Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;