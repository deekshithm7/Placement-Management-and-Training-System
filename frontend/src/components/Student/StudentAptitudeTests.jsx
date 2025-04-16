import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, FileText } from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const StudentAptitudeTests = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableTests();
  }, []);

  useEffect(() => {
    if (dateFilter) {
      const filtered = tests.filter(test => new Date(test.createdAt).toISOString().split('T')[0] === dateFilter);
      setFilteredTests(filtered);
    } else {
      setFilteredTests(tests);
    }
  }, [dateFilter, tests]);

  const fetchAvailableTests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/aptitude-tests/available`, { withCredentials: true });
      setTests(response.data.tests);
      setFilteredTests(response.data.tests);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch available tests');
      setLoading(false);
    }
  };

  const handleAttemptQuiz = (id) => navigate(`/student/take-quiz/${id}`);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-primary-bg font-sans">
      <div className="text-text-secondary animate-pulse">Loading available tests...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary-bg text-text-primary p-4 sm:p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 animate-fade-in">Available Aptitude Tests</h1>
        {error && (
          <div className="bg-error/20 text-error p-3 rounded-xl mb-4 animate-fade-in">{error}</div>
        )}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-text-secondary">Filter by Date</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-primary-bg text-text-primary p-2 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-highlight"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-text-secondary hover:text-text-primary transition-all duration-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        {filteredTests.length === 0 ? (
          <div className="bg-secondary-bg rounded-xl p-6 text-center shadow-glass">
            <p className="text-text-secondary">
              {dateFilter ? 'No tests available for the selected date' : 'No tests available to attempt'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <div key={test._id} className="bg-secondary-bg rounded-xl p-6 shadow-glass hover:-translate-y-1 transition-all duration-300">
                <h2 className="text-xl font-semibold mb-3">{test.title}</h2>
                {test.description && (
                  <p className="text-text-secondary mb-4 line-clamp-2">{test.description}</p>
                )}
                <div className="space-y-2 mb-4 text-text-secondary">
                  <div className="flex items-center"><Calendar size={16} className="mr-2" /> Created: {formatDate(test.createdAt)}</div>
                  <div className="flex items-center"><Clock size={16} className="mr-2" /> Duration: {test.duration} minutes</div>
                  <div className="flex items-center"><FileText size={16} className="mr-2" /> Questions: {test.questions.length}</div>
                </div>
                <button
                  onClick={() => handleAttemptQuiz(test._id)}
                  className="w-full bg-gradient-to-r from-highlight to-accent hover:from-accent hover:to-highlight text-text-primary px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Attempt Quiz
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAptitudeTests;