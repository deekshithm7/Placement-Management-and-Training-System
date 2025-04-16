import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchQuiz();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (quiz && timeLeft > 0) {
      startTimer();
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [quiz]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/aptitude-tests/take/${id}`, { withCredentials: true });
      const quizData = response.data.test;
      setQuiz(quizData);
      setAnswers(Array(quizData.questions.length).fill(null));
      setTimeLeft(quizData.duration * 60);
      setLoading(false);
    } catch (error) {
      console.error('Fetch quiz error:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to fetch quiz.');
      setLoading(false);
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          submitQuiz();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
      hours > 0 ? hours : null,
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ].filter(Boolean).join(':');
  };

  const handleAnswerSelect = (questionIndex, selectedOption) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = selectedOption;
    setAnswers(newAnswers);
    const answeredQuestions = newAnswers.filter((answer) => answer !== null).length;
    setProgress((answeredQuestions / quiz.questions.length) * 100);
  };

  // New function to handle option click and prevent Chrome focus issues
  const handleOptionClick = (questionIndex, selectedOption, event) => {
    // Prevent default browser behavior
    if (event) {
      event.preventDefault();
    }
    handleAnswerSelect(questionIndex, selectedOption);
    // Remove focus from the clicked element to prevent Chrome styling issues
    if (document.activeElement) {
      document.activeElement.blur();
    }
  };

  const handleSubmitClick = () => {
    const unansweredCount = answers.filter((a) => a === null).length;
    if (unansweredCount > 0) setConfirmSubmit(true);
    else submitQuiz();
  };

  const submitQuiz = async () => {
    if (isSubmitting) return;
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      setIsSubmitting(true);
      const response = await axios.post(`${API_BASE_URL}/api/aptitude-tests/${id}/submit`, { answers }, { withCredentials: true });
      const resultId = response.data.result._id;
      navigate(`/student/quiz-results/${resultId}`, {
        state: { submissionResult: response.data.result, answers, quiz },
      });
    } catch (error) {
      setError('Failed to submit quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-primary-bg">
        <div className="text-text-secondary animate-pulse">Loading quiz...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-bg text-text-primary p-4 sm:p-6 font-sans">
        <div className="max-w-3xl mx-auto bg-secondary-bg rounded-xl p-6 shadow-glass">
          <div className="flex items-center text-error mb-4">
            <AlertTriangle size={24} className="mr-2" />
            <h2 className="text-xl font-semibold">Error</h2>
          </div>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            onClick={() => navigate('/student/aptitude-tests')}
            className="bg-gradient-to-r from-highlight to-accent hover:from-accent hover:to-highlight text-text-primary px-6 py-2.5 rounded-lg transition-all duration-300 hover:scale-105"
          >
            Back to Available Tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-bg text-text-primary p-4 sm:p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Quiz Header */}
        <div className="bg-secondary-bg rounded-xl p-6 mb-6 shadow-glass animate-fade-in">
          <h1 className="text-xl sm:text-2xl font-semibold mb-3">{quiz.title}</h1>
          {quiz.description && <p className="text-text-secondary mb-4">{quiz.description}</p>}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center text-accent mb-4 sm:mb-0">
              <Clock size={20} className="mr-2" />
              <span className="font-semibold">{formatTime(timeLeft)}</span>
              <span className="text-text-secondary ml-2">remaining</span>
            </div>
            <div className="w-full sm:w-64">
              <div className="text-xs text-text-secondary mb-1">
                Progress: {Math.round(progress)}%
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-highlight to-accent transition-colors duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Quiz Questions */}
        <div className="space-y-6 mb-8">
          {quiz.questions.map((question, index) => (
            <div key={index} className="bg-secondary-bg rounded-xl p-6 shadow-glass">
              <div className="flex flex-col sm:flex-row items-start mb-4">
                <span className="bg-highlight/20 text-text-primary px-2 py-1 rounded-full text-sm mr-0 sm:mr-3 mb-2 sm:mb-0">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-medium">{question.question}</h3>
                  <div className="text-text-secondary text-sm mt-1">
                    {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                  </div>
                </div>
              </div>
              <div className="space-y-3 sm:pl-10">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-300 ${
                      answers[index] === optionIndex
                        ? 'bg-accent/20 border border-accent/50'
                        : 'hover:bg-highlight/10'
                    }`}
                    onClick={(e) => handleOptionClick(index, optionIndex, e)}
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      checked={answers[index] === optionIndex}
                      onChange={() => handleAnswerSelect(index, optionIndex)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                        answers[index] === optionIndex ? 'border-accent bg-accent' : 'border-text-secondary'
                      }`}
                    >
                      {answers[index] === optionIndex && (
                        <div className="w-2 h-2 bg-text-primary rounded-full" />
                      )}
                    </div>
                    <span>{String.fromCharCode(65 + optionIndex)}. {option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Submit Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-secondary-bg rounded-xl p-6 shadow-glass">
          <div className="text-sm text-text-secondary mb-4 sm:mb-0">
            {answers.filter((a) => a !== null).length} of {quiz.questions.length} questions answered
          </div>
          <button
            onClick={handleSubmitClick}
            className="w-full sm:w-auto bg-gradient-to-r from-highlight to-accent hover:from-accent hover:to-highlight text-text-primary px-6 py-2.5 rounded-lg flex items-center justify-center transition-colors duration-300 hover:scale-105 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            <CheckCircle size={18} className="ml-2" />
          </button>
        </div>
        {/* Confirmation Modal */}
        {confirmSubmit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-secondary-bg rounded-xl p-6 max-w-md w-full shadow-glass animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Confirm Submission</h2>
              <p className="text-text-secondary mb-6">
                You have {answers.filter((a) => a === null).length} unanswered questions. Are you sure?
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <button
                  onClick={() => setConfirmSubmit(false)}
                  className="px-4 py-2 bg-gray-700 text-text-secondary rounded-lg hover:bg-gray-600 transition-colors duration-300"
                >
                  Continue Quiz
                </button>
                <button
                  onClick={submitQuiz}
                  className="px-4 py-2 bg-gradient-to-r from-highlight to-accent hover:from-accent hover:to-highlight text-text-primary rounded-lg transition-colors duration-300 hover:scale-105"
                >
                  Submit Anyway
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;