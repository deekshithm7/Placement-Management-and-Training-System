import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const AptitudeTest = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchAllYears();
    fetchTests(selectedYear);
  }, []);

  const fetchAllYears = async () => {
    try {
      const response = await axios.get('/api/aptitude-tests', { withCredentials: true });
      const years = [...new Set(response.data.tests.map(test => new Date(test.createdAt).getFullYear()))].sort((a, b) => a - b);
      setAvailableYears(years);
    } catch (error) {
      console.error('Error fetching years:', error);
    }
  };

  const fetchTests = async (year = null) => {
    try {
      setLoading(true);
      const url = year ? `/api/aptitude-tests?year=${year}` : '/api/aptitude-tests';
      const response = await axios.get(url, { withCredentials: true });
      setTests(response.data.tests || []);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch tests');
      setLoading(false);
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    fetchTests(year);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/aptitude-tests/${id}`, { withCredentials: true });
      setTests(tests.filter(test => test._id !== id));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete test');
    }
  };

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  const sortedTests = () => {
    const sorted = [...tests];
    if (sortBy === 'title') {
      return sorted.sort((a, b) => sortDirection === 'asc' 
        ? a.title.localeCompare(b.title) 
        : b.title.localeCompare(a.title));
    } else if (sortBy === 'date') {
      return sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (sortBy === 'duration') {
      return sorted.sort((a, b) => sortDirection === 'asc' 
        ? a.duration - b.duration 
        : b.duration - a.duration);
    } else if (sortBy === 'questions') {
      return sorted.sort((a, b) => sortDirection === 'asc' 
        ? a.questions.length - b.questions.length 
        : b.questions.length - a.questions.length);
    }
    return sorted;
  };

  const filteredTests = () => {
    if (!searchTerm.trim()) return sortedTests();
    return sortedTests().filter(test => test.title.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center text-white">
          <div className="w-12 h-12 border-t-4 border-teal-500 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading aptitude tests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="bg-gray-800/90 backdrop-blur-md p-4 rounded-lg shadow-lg border border-red-500/50 max-w-md">
          <h3 className="text-lg font-bold text-red-400 mb-2">Error</h3>
          <p className="text-gray-300">{error}</p>
          <button onClick={() => fetchTests(selectedYear)} className="mt-4 px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg shadow-md transition-all duration-300">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="bg-gray-800/90 backdrop-blur-md shadow-xl rounded-lg border border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Aptitude Tests
            </h2>
            <p className="text-gray-400 text-sm mt-1">{filteredTests().length} tests found</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-2 sm:mt-0">
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="bg-gray-800/80 border border-gray-700 rounded-lg px-2 py-1 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {availableYears.map(year => (
                <option key={year} value={year} className="bg-gray-900 text-gray-200">{year}</option>
              ))}
            </select>
            <button
              onClick={() => navigate('/coordinator/create-test')}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-3 py-1.5 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 flex items-center text-sm"
            >
              <Plus size={16} className="mr-1" /> Create New Test
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
            />
          </div>
          <div className="flex gap-2">
            {['title', 'date', 'duration', 'questions'].map(key => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm ${sortBy === key ? 'border-teal-500 text-teal-400 bg-teal-500/10' : 'border-gray-700 text-gray-400 hover:border-teal-500 hover:text-teal-400'} transition-all duration-200`}
              >
                {key === 'title' ? 'Title' : key === 'date' ? 'Date' : key === 'duration' ? 'Duration' : 'Questions'}
                {sortBy === key && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
              </button>
            ))}
          </div>
        </div>

        {filteredTests().length === 0 ? (
          <div className="bg-gray-800/80 backdrop-blur-md p-4 rounded-lg border border-gray-700 text-center">
            <Filter size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-lg text-gray-300 mb-1">No tests found</p>
            <p className="text-gray-500 text-sm">
              {searchTerm ? `No tests match "${searchTerm}"` : `No tests available for ${selectedYear}`}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded-lg shadow-md transition-all duration-300 text-sm"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTests().map((test) => (
              <div key={test._id} className="bg-gray-800/80 backdrop-blur-md p-4 rounded-lg border border-gray-700 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start gap-3">
                  <div className="bg-teal-500/20 p-2 rounded-lg">
                    <Edit className="text-teal-400" size={20} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-white line-clamp-2">{test.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="flex items-center gap-1 text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded-full text-xs">
                        <ChevronDown size={12} /> {test.duration} min
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded-full text-xs">
                        <Plus size={12} /> {test.questions.length} questions
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded-full text-xs">
                        <Trash2 size={12} /> {new Date(test.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/coordinator/edit-test/${test._id}`, { state: { test } })}
                    className="flex-1 px-3 py-1 bg-gray-700 text-gray-300 rounded-lg shadow-md hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(test._id)}
                    className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 text-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AptitudeTest;