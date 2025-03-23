import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useParams } from 'react-router-dom';
import { 
  Download, 
  FileSpreadsheet, 
  ChevronDown, 
  ChevronUp, 
  PlusCircle, 
  Calendar, 
  Users, 
  Briefcase, 
  Clock, 
  Award, 
  CheckCircle2,
  XCircle,
  ListFilter
} from 'lucide-react';
import * as XLSX from 'xlsx';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const PlacementDriveDetail = () => {
  const { role } = useAuth();
  const { id } = useParams();
  const [drive, setDrive] = useState(null);
  const [phaseName, setPhaseName] = useState('');
  const [requirements, setRequirements] = useState('');
  const [instructions, setInstructions] = useState('');
  const [shortlistFile, setShortlistFile] = useState(null);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [isEndingDrive, setIsEndingDrive] = useState(false);

  if (role !== 'Coordinator') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchDrive();
  }, [id]);

  const fetchDrive = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/placement-drives/${id}`, { withCredentials: true });
      setDrive(response.data || {});
      setErrors([]);
    } catch (error) {
      setErrors([error.response?.data.message || 'Error fetching placement drive']);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhase = async (e) => {
    e.preventDefault();
    setErrors([]);
    setMessage('');

    if (drive.phases.length > 0 && !shortlistFile) {
      setErrors(['Shortlist file is required for subsequent phases']);
      return;
    }

    const formData = new FormData();
    formData.append('phaseName', phaseName);
    formData.append('requirements', requirements);
    formData.append('instructions', instructions);
    if (shortlistFile) formData.append('shortlistFile', shortlistFile);

    try {
      const response = await axios.post(`/api/placement-drives/${id}/add-phase`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(response.data.message);
      setPhaseName('');
      setRequirements('');
      setInstructions('');
      setShortlistFile(null);
      setIsAddingPhase(false);
      fetchDrive();
    } catch (error) {
      setErrors([error.response?.data.message || 'Error adding phase']);
    }
  };

  const handleEndDrive = async (e) => {
    e.preventDefault();
    setErrors([]);
    setMessage('');

    if (!shortlistFile) {
      setErrors(['Final shortlist file is required to end the drive']);
      return;
    }

    const formData = new FormData();
    formData.append('shortlistFile', shortlistFile);
    formData.append('requirements', requirements);
    formData.append('instructions', instructions);

    try {
      const response = await axios.post(`/api/placement-drives/${id}/end`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(response.data.message);
      setRequirements('');
      setInstructions('');
      setShortlistFile(null);
      setIsEndingDrive(false);
      fetchDrive();
    } catch (error) {
      setErrors([error.response?.data.message || 'Error ending drive']);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.post('/api/placement-drives/template', {}, {
        withCredentials: true,
        responseType: 'blob'
      });
      
      if (response.data.size === 0) {
        throw new Error('Received empty file');
      }
      
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'shortlist_template.xlsx');
      document.body.appendChild(link);
      link.click();
      
      window.URL.revokeObjectURL(url);
      link.remove();
    } catch (error) {
      console.error('Download error:', error);
      setErrors(['Error downloading template: ' + (error.message || 'Unknown error')]);
    }
  };

  const downloadApplicants = () => {
    if (!drive || drive.applications.length === 0) {
      setErrors(['No applicants available to download']);
      return;
    }

    const excelData = drive.applications.map(app => ({
      'Student Name': app.student.name,
      'Email': app.student.email,
      'Registration Number': app.student.registrationNumber,
      'Application Status': app.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applicants');
    XLSX.writeFile(workbook, `${drive.companyName}_${drive.role}_applicants.xlsx`);
  };

  const togglePhase = (index) => {
    setExpandedPhase(expandedPhase === index ? null : index);
  };

  const getLatestShortlistCount = () => {
    if (!drive || !drive.phases || drive.phases.length === 0) {
      return 0;
    }
    const latestPhase = drive.phases[drive.phases.length - 1];
    return latestPhase.shortlistedStudents.length;
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-500';
      case 'In Progress': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
      {/* Header */}
      <div className="bg-gray-800/90 backdrop-blur-md shadow-xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-extrabold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              {drive.companyName || 'Company'} <span className="text-gray-400">|</span> {drive.role || 'Role'}
            </h1>
            <span className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusColor(drive.status)} text-white shadow-md`}>
              {drive.status || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Drive Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <Calendar className="h-10 w-10 text-indigo-400 mr-4" />
              <div>
                <h3 className="text-gray-400 text-sm font-medium">Drive Date</h3>
                <p className="text-white text-lg font-semibold">
                  {drive.date ? new Date(drive.date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <Users className="h-10 w-10 text-indigo-400 mr-4" />
              <div>
                <h3 className="text-gray-400 text-sm font-medium">Total Applicants</h3>
                <p className="text-white text-lg font-semibold">{drive.applications?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <ListFilter className="h-10 w-10 text-indigo-400 mr-4" />
              <div>
                <h3 className="text-gray-400 text-sm font-medium">Latest Shortlist</h3>
                <p className="text-white text-lg font-semibold">
                  {getLatestShortlistCount()} students
                  {drive.phases?.length > 0 && (
                    <span className="text-xs ml-2 text-gray-400">
                      ({(getLatestShortlistCount() / (drive.applications?.length || 1) * 100).toFixed(1)}%)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <Briefcase className="h-10 w-10 text-indigo-400 mr-4" />
              <div>
                <h3 className="text-gray-400 text-sm font-medium">Eligible Branches</h3>
                <p className="text-white text-lg font-semibold truncate">
                  {drive.eligibleBranches?.join(', ') || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Application List */}
        <div className="bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg mb-8 overflow-hidden border border-gray-700">
          <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Applicants
            </h2>
            <button
              onClick={downloadApplicants}
              className="inline-flex items-center bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300"
            >
              <Download size={16} className="mr-2" />
              Export List
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-600 text-white sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Registration No.</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {drive.applications?.length > 0 ? (
                  drive.applications.map(app => (
                    <tr key={app._id} className="hover:bg-gray-750 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{app.student.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{app.student.email || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{app.student.registrationNumber || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          app.status === 'Selected' ? 'bg-green-500 text-white' : 
                          app.status === 'Rejected' ? 'bg-red-500 text-white' : 
                          'bg-yellow-500 text-white'
                        }`}>
                          {app.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-400">No applicants found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Phases Section */}
        <div className="bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg mb-8 overflow-hidden border border-gray-700">
          <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Selection Phases
            </h2>
            <div className="flex space-x-3">
              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300"
              >
                <FileSpreadsheet size={16} className="mr-2" />
                Download Template
              </button>
              
              {drive.status !== 'Completed' && (
                <button
                  onClick={() => setIsAddingPhase(!isAddingPhase)}
                  className="inline-flex items-center bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300"
                >
                  <PlusCircle size={16} className="mr-2" />
                  Add Phase
                </button>
              )}
            </div>
          </div>
          
          {drive.phases?.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {drive.phases.map((phase, index) => (
                <div key={index} className="bg-gray-800">
                  <div 
                    className={`px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-750 transition-colors duration-150 ${
                      index === drive.phases.length - 1 ? "border-l-4 border-indigo-500" : ""
                    }`}
                    onClick={() => togglePhase(index)}
                  >
                    <div className="flex items-center">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
                        index === drive.phases.length - 1 
                          ? "bg-indigo-500 text-white" 
                          : "bg-indigo-500 bg-opacity-10 text-indigo-500"
                      } mr-4`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-white">{phase.name || 'Unnamed Phase'}</h3>
                          {index === drive.phases.length - 1 && (
                            <span className="ml-3 px-2 py-0.5 text-xs bg-indigo-500 bg-opacity-20 text-indigo-300 rounded">
                              Latest
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          Shortlisted: {phase.shortlistedStudents?.length || 0} students
                          {drive.applications?.length > 0 && (
                            <span className="ml-1">
                              ({((phase.shortlistedStudents?.length || 0) / (drive.applications?.length || 1) * 100).toFixed(1)}%)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {expandedPhase === index ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                  </div>
                  
                  {expandedPhase === index && (
                    <div className="px-6 py-4 bg-gray-750">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-1">Requirements</h4>
                          <p className="text-white text-sm">{phase.requirements || 'None specified'}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-1">Instructions</h4>
                          <p className="text-white text-sm">{phase.instructions || 'None specified'}</p>
                        </div>
                      </div>
                      
                      <h4 className="text-sm font-medium text-gray-300 mt-4 mb-2">Shortlisted Students</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-gray-700">
                            <tr>
                              <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                              <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                              <th className="px-4 py-2 text-xs font-medium text-gray-300 uppercase tracking-wider">Registration No.</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {phase.shortlistedStudents?.length > 0 ? (
                              phase.shortlistedStudents.map(student => (
                                <tr key={student._id} className="hover:bg-gray-700 transition-colors duration-150">
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-white">{student.name || 'N/A'}</td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{student.email || 'N/A'}</td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{student.registrationNumber || 'N/A'}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="3" className="px-4 py-2 text-center text-gray-400">No students shortlisted</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-400">
              No phases have been added yet
            </div>
          )}
          
          {/* Add Phase Form */}
          {isAddingPhase && drive.status !== 'Completed' && (
            <div className="p-6 border-t border-gray-700 bg-gray-750">
              <h3 className="text-lg font-medium text-white bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent mb-4">
                Add New Phase
              </h3>
              <form onSubmit={handleAddPhase} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phase Type</label>
                  <select
                    value={phaseName}
                    onChange={e => setPhaseName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                    required
                  >
                    <option value="">Select Phase</option>
                    <option value="Resume Screening">Resume Screening</option>
                    <option value="Written Test">Written Test</option>
                    <option value="Interview HR">Interview HR</option>
                    <option value="Interview Technical">Interview Technical</option>
                    <option value="Aptitude Test">Aptitude Test</option>
                    <option value="Coding Test">Coding Test</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Requirements</label>
                  <textarea
                    value={requirements}
                    onChange={e => setRequirements(e.target.value)}
                    placeholder="Phase Requirements (e.g., Bring resume, laptop)"
                    className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Instructions</label>
                  <textarea
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    placeholder="Instructions (e.g., Arrive by 9 AM)"
                    className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Shortlist File {drive.phases.length > 0 && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={e => setShortlistFile(e.target.files[0])}
                    className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 file:bg-teal-500 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                    required={drive.phases.length > 0}
                  />
                  <p className="text-xs text-gray-400 mt-1">Upload Excel file with shortlisted students</p>
                </div>
                
                <div className="flex justify-end space-x-4 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingPhase(false)} 
                    className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg shadow-md hover:bg-gray-600 transform hover:scale-105 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg shadow-md transform hover:scale-105 transition-all duration-300"
                  >
                    Add Phase
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* End Drive Section */}
        {drive.status !== 'Completed' && (
          <div className="bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg mb-8 overflow-hidden border border-gray-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                Complete Placement Drive
              </h2>
              {!isEndingDrive && (
                <button
                  onClick={() => setIsEndingDrive(true)}
                  className="inline-flex items-center bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300"
                >
                  <Award size={16} className="mr-2" />
                  End Drive
                </button>
              )}
            </div>
            
            {isEndingDrive && (
              <div className="p-6 bg-gray-750">
                <div className="rounded-lg bg-red-500/10 p-4 mb-6 shadow-md">
                  <div className="flex">
                    <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-400">Attention Required</h3>
                      <p className="mt-2 text-sm text-red-300">
                        Completing a placement drive is irreversible. This will mark the drive as completed and notify all selected students as of March 21, 2025.
                      </p>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleEndDrive} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Final Requirements</label>
                    <textarea
                      value={requirements}
                      onChange={e => setRequirements(e.target.value)}
                      placeholder="Final Selection Requirements (e.g., Offer letter acceptance)"
                      className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                      rows="3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Final Instructions</label>
                    <textarea
                      value={instructions}
                      onChange={e => setInstructions(e.target.value)}
                      placeholder="Instructions (e.g., Submit documents by tomorrow)"
                      className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                      rows="3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Final Selection File <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={e => setShortlistFile(e.target.files[0])}
                      className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 file:bg-red-500 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">Upload Excel file with final selected students</p>
                  </div>
                  
                  <div className="flex justify-end space-x-4 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setIsEndingDrive(false)} 
                      className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg shadow-md hover:bg-gray-600 transform hover:scale-105 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg shadow-md transform hover:scale-105 transition-all duration-300"
                    >
                      Complete Drive
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Error and Success Messages */}
        {errors.length > 0 && (
          <div className="mb-8 bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg shadow-md animate-fade-in">
            {errors.map((error, index) => <p key={index}>{error}</p>)}
          </div>
        )}
        
        {message && (
          <div className="mb-8 bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg shadow-md animate-fade-in">
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementDriveDetail;