import React, { useState, useEffect } from 'react';
import { Building2, Users, X, Download, Search, Filter, ChevronDown, ChevronUp, Badge } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const PlacementResults = () => {
  const { role } = useAuth();
  const [showDetails, setShowDetails] = useState(null);
  const [placements, setPlacements] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('companyName');
  const [sortDirection, setSortDirection] = useState('asc');

  if (role !== 'Coordinator') return <Navigate to="/" replace />;

  // Fetch all available years once on component mount
  useEffect(() => {
    fetchAllYears();
  }, []);

  // Fetch drives whenever selected year changes
  useEffect(() => {
    if (selectedYear) {
      fetchCompletedDrives(selectedYear);
    }
  }, [selectedYear]);

  const fetchAllYears = async () => {
    try {
      const response = await axios.get('/api/placement-drives/all', { withCredentials: true });
      const completedDrives = response.data.filter(drive => drive.status === 'Completed');
      const years = [...new Set(completedDrives.map(drive => new Date(drive.date).getFullYear()))].sort((a, b) => b - a); // Sort newest first
      
      if (years.length > 0) {
        setAvailableYears(years);
        // If we have years but current selectedYear isn't in the list, pick the most recent one
        if (!years.includes(parseInt(selectedYear))) {
          setSelectedYear(years[0].toString());
        }
      } else {
        // If no years found, keep current year as default
        setAvailableYears([new Date().getFullYear()]);
      }
    } catch (err) {
      console.error('Error fetching all years:', err);
      setError(err.response?.data.message || 'Error fetching years');
    }
  };

  const fetchCompletedDrives = async (year = null) => {
    try {
      setLoading(true);
      const url = year ? `/api/placement-drives/all?year=${year}` : '/api/placement-drives/all';
      const response = await axios.get(url, { withCredentials: true });
      
      let completedDrives = response.data.filter(drive => drive.status === 'Completed');
      
      // If year is provided, filter drives by that year
      if (year) {
        completedDrives = completedDrives.filter(drive => 
          new Date(drive.date).getFullYear().toString() === year
        );
      }

      console.log('Raw API response for completed drives:', completedDrives);

      const placementData = completedDrives.reduce((acc, drive) => {
        const companyKey = `${drive.companyName} (${drive.role})`;
        const finalPhase = drive.phases.find(phase => phase.name === 'Final Selection');
        
        // Handle both populated and unpopulated student data
        const students = finalPhase?.shortlistedStudents ? 
          finalPhase.shortlistedStudents.map(student => {
            // Check if student is a populated object or just an ID
            if (typeof student === 'string' || !student.name) {
              return {
                id: typeof student === 'object' ? student._id || student : student,
                name: 'Unknown',
                email: 'N/A',
                registrationNumber: 'N/A',
                package: drive.package || 'N/A'
              };
            }
            
            return {
              id: student._id || 'N/A',
              name: student.name || 'Unknown',
              email: student.email || 'N/A',
              registrationNumber: student.registrationNumber || 'N/A',
              package: drive.package || 'N/A'
            };
          }) : [];
        
        console.log(`Transformed students for ${companyKey}:`, students);
        acc[companyKey] = { date: drive.date, students };
        return acc;
      }, {});

      setPlacements(placementData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching placement data:', err);
      setError(err.response?.data.message || 'Error fetching placement results');
      setLoading(false);
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const downloadCompanyExcel = (company, students) => {
    const excelData = students.map(student => ({
      'Company Name': company,
      'Student Name': student.name,
      'Email': student.email,
      'Registration Number': student.registrationNumber,
      'Package': student.package
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
    XLSX.writeFile(workbook, `${company}_placement_results.xlsx`);
  };

  const downloadYearExcel = () => {
    const excelData = [];
    Object.entries(placements).forEach(([company, data]) => {
      data.students.forEach(student => {
        excelData.push({
          'Company Name': company,
          'Student Name': student.name,
          'Email': student.email,
          'Registration Number': student.registrationNumber,
          'Package': student.package,
          'Date': new Date(data.date).toLocaleDateString()
        });
      });
    });

    if (excelData.length === 0) {
      alert(`No placement results found for ${selectedYear}`);
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Placement Results');
    XLSX.writeFile(workbook, `placement_results_${selectedYear}.xlsx`);
  };

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  const sortedPlacements = () => {
    const entries = Object.entries(placements);
    if (sortBy === 'companyName') {
      return entries.sort((a, b) => sortDirection === 'asc' ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0]));
    } else if (sortBy === 'studentCount') {
      return entries.sort((a, b) => sortDirection === 'asc' ? a[1].students.length - b[1].students.length : b[1].students.length - a[1].students.length);
    } else if (sortBy === 'date') {
      return entries.sort((a, b) => {
        const dateA = new Date(a[1].date);
        const dateB = new Date(b[1].date);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }
    return entries;
  };

  const filteredPlacements = () => {
    if (!searchTerm.trim()) return sortedPlacements();
    return sortedPlacements().filter(([company]) => company.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center text-white">
          <div className="w-12 h-12 border-t-4 border-teal-500 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading placement results...</p>
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
          <button onClick={() => fetchCompletedDrives(selectedYear)} className="mt-4 px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg shadow-md transition-all duration-300">
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
              Placement Results
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {Object.keys(placements).length} companies | {Object.values(placements).reduce((total, company) => total + company.students.length, 0)} students placed
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-2 sm:mt-0">
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="bg-gray-800/80 border border-gray-700 rounded-lg px-2 py-1 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availableYears.map(year => (
                <option key={year} value={year.toString()} className="bg-gray-900 text-gray-200">{year}</option>
              ))}
            </select>
            <button
              onClick={downloadYearExcel}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-3 py-1.5 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 flex items-center text-sm"
            >
              <Download size={16} className="mr-1" /> Download {selectedYear} Results
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
            />
          </div>
          
          <div className="flex gap-2">
            {['companyName', 'studentCount', 'date'].map(key => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm ${sortBy === key ? 'border-teal-500 text-teal-400 bg-teal-500/10' : 'border-gray-700 text-gray-400 hover:border-teal-500 hover:text-teal-400'} transition-all duration-200`}
              >
                {key === 'companyName' ? 'Company' : key === 'studentCount' ? 'Students' : 'Date'}
                {sortBy === key && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
              </button>
            ))}
          </div>
        </div>

        {filteredPlacements().length === 0 ? (
          <div className="bg-gray-800/80 backdrop-blur-md p-4 rounded-lg border border-gray-700 text-center">
            <Filter size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-lg text-gray-300 mb-1">No placement results found</p>
            <p className="text-gray-500 text-sm">
              {searchTerm ? `No companies match "${searchTerm}"` : `No placement data available for ${selectedYear}`}
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
            {filteredPlacements().map(([company, data]) => (
              <div
                key={company}
                className="bg-gray-800/80 backdrop-blur-md p-4 rounded-lg border border-gray-700 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-teal-500/20 p-2 rounded-lg">
                    <Building2 className="text-teal-400" size={20} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-white line-clamp-2">{company}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="flex items-center gap-1 text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded-full text-xs">
                        <Users size={12} /> {data.students.length} students
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded-full text-xs">
                        <Badge size={12} /> {new Date(data.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowDetails(company)}
                    className="flex-1 px-3 py-1 bg-gray-700 text-gray-300 rounded-lg shadow-md hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => downloadCompanyExcel(company, data.students)}
                    className="px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 flex items-center text-sm"
                  >
                    <Download size={14} className="mr-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDetails && placements[showDetails] && (
        <DetailView 
          company={showDetails} 
          students={placements[showDetails].students || []} 
          onClose={() => setShowDetails(null)} 
          downloadCompanyExcel={downloadCompanyExcel}
        />
      )}
    </div>
  );
};

const DetailView = ({ company, students, onClose, downloadCompanyExcel }) => {
  const [searchTerm, setSearchTerm] = useState('');

  console.log(`DetailView - Raw students for ${company}:`, students);

  // Check if all students have only placeholder data
  const hasValidStudentData = students.some(student => 
    student.name !== 'Unknown' || student.email !== 'N/A' || student.registrationNumber !== 'N/A'
  );

  const filteredStudents = students.filter(student => {
    const name = (student.name || '').toLowerCase();
    const email = (student.email || '').toLowerCase();
    const registrationNumber = (student.registrationNumber || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    return (
      name.includes(search) ||
      email.includes(search) ||
      registrationNumber.includes(search)
    );
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-xl p-3 w-full max-w-3xl shadow-2xl border border-gray-800 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-lg font-extrabold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              {company}
            </h3>
            <p className="text-gray-400 text-xs">{students.length} students placed</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-0.5 rounded-full hover:bg-gray-700 transition-colors duration-200"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
          />
        </div>
        
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {!hasValidStudentData && students.length > 0 ? (
            <div className="text-center py-4 text-gray-400 text-sm">
              Student data is incomplete. Please check the placement records.
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-sm">
              {searchTerm ? "No students match your search criteria" : "No students placed in this drive"}
            </div>
          ) : (
            filteredStudents.map((student, index) => (
              <div
                key={student.id || index}
                className="bg-gray-800/80 p-2 rounded-lg border border-gray-700 hover:shadow-md transition-shadow duration-200"
              >
                <p className="font-medium text-sm text-white line-clamp-1">{student.name || 'Unknown'}</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  <span className="bg-teal-500/20 text-teal-400 text-[0.65rem] px-1.5 py-0.5 rounded">{student.registrationNumber || 'N/A'}</span>
                </p>
                <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{student.email || 'N/A'}</p>
              </div>
            ))
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded-lg shadow-md hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 text-xs"
          >
            Close
          </button>
          <button
            onClick={() => downloadCompanyExcel(company, students)}
            className="px-2 py-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center text-xs"
          >
            <Download size={12} className="mr-1" /> Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlacementResults;