import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Edit, Upload, Download, Search } from 'lucide-react';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState({ message: '', isError: false });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    // Filter students when search term changes
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = students.filter(
        student => 
          student.name.toLowerCase().includes(lowercasedSearch) ||
          student.registrationNumber.toLowerCase().includes(lowercasedSearch) ||
          student.branch.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students/list', { withCredentials: true });
      setStudents(response.data);
      setFilteredStudents(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch students');
      setLoading(false);
    }
  };

  const handleEditStudent = (studentId) => navigate(`/Advisor/edit-student/${studentId}`);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && !selectedFile.name.match(/\.(xlsx|xls)$/)) {
      setUploadStatus({ message: 'Please select a valid Excel file', isError: true });
      return;
    }
    setFile(selectedFile);
    setUploadStatus({ message: '', isError: false });
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus({ message: 'Please select a file', isError: true });
      return;
    }
    const formData = new FormData();
    formData.append('studentFile', file);
    setUploading(true);
    try {
      const response = await axios.post('/api/students/bulk-edit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      setUploadStatus({
        message: `Successfully updated ${response.data.successfulStudents.length} students. ${
          response.data.errors.length > 0 ? `${response.data.errors.length} errors.` : ''
        }`,
        isError: false,
      });
      fetchStudents();
    } catch (err) {
      setUploadStatus({ message: err.response?.data?.message || 'Upload failed', isError: true });
    } finally {
      setUploading(false);
      setFile(null);
      document.getElementById('fileUpload').value = '';
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await axios.get('/api/students/edit-template', { responseType: 'blob', withCredentials: true });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_edit_template.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setUploadStatus({ message: 'Failed to download template', isError: true });
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) return <div className="text-text-primary text-center py-12">Loading...</div>;
  if (error) return <div className="text-error text-center py-12">{error}</div>;

  return (
    <div className="min-h-screen bg-primary-bg p-4 sm:p-6 lg:p-8">
      <div className="bg-secondary-bg rounded-xl shadow-glass p-6">
        <h2 className="text-2xl md:text-3xl text-text-primary mb-6">Student List</h2>
        
        {/* Bulk Upload Section */}
        <div className="mb-6 p-4 bg-[#232d3f] rounded-lg">
          <h3 className="text-xl text-text-primary mb-3">Bulk Update Students</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <button
              onClick={downloadTemplate}
              className="bg-accent hover:bg-green-600 text-text-primary py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-200 hover:shadow-lg focus:ring-2 focus:ring-highlight"
              aria-label="Download Template"
            >
              <Download size={18} /> Download Template
            </button>
            <div className="flex-1">
              <input
                id="fileUpload"
                type="file"
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                className="block w-full text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-text-primary hover:file:bg-green-600 transition-all duration-200"
                aria-label="Upload student file"
              />
              <p className="text-text-secondary text-sm mt-1">Upload Excel file with student details</p>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-all duration-200 ${
                uploading || !file
                  ? 'bg-gray-600 text-text-secondary cursor-not-allowed'
                  : 'bg-highlight hover:bg-blue-500 text-text-primary hover:shadow-lg focus:ring-2 focus:ring-accent'
              }`}
              aria-label="Upload File"
            >
              <Upload size={18} /> {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          {uploadStatus.message && (
            <div
              className={`p-3 rounded-lg mt-3 ${
                uploadStatus.isError ? 'bg-error bg-opacity-20 text-error' : 'bg-accent bg-opacity-20 text-accent'
              }`}
            >
              {uploadStatus.message}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className="flex items-center bg-[#1e2a3a] rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-highlight">
            <Search size={20} className="text-text-secondary mr-2" />
            <input
              type="text"
              placeholder="Search by name or registration number..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="bg-transparent border-none w-full text-text-primary focus:outline-none"
              aria-label="Search students"
            />
          </div>
        </div>

        {/* Student List */}
        <div className="overflow-x-auto">
          <table className="w-full text-text-primary">
            <thead className="bg-[#2c3e50]">
              <tr>
                {['Name', 'Registration Number', 'Branch', 'Actions'].map((header) => (
                  <th key={header} className="p-3 text-left">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-3 text-center text-text-secondary">
                    {students.length === 0 ? 'No students found.' : 'No matching students found.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="border-b border-gray-700 hover:bg-gray-700 transition-all duration-200">
                    <td className="p-3">{student.name}</td>
                    <td className="p-3">{student.registrationNumber}</td>
                    <td className="p-3">{student.branch}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleEditStudent(student._id)}
                        className="text-highlight hover:text-blue-400 transition-all duration-200 focus:ring-2 focus:ring-accent"
                        aria-label={`Edit ${student.name}`}
                      >
                        <Edit size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentList;