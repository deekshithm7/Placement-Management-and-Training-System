import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const StudentPlacementDrives = () => {
  const { user, role } = useAuth();
  const [drives, setDrives] = useState([]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  if (role !== 'Student') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/placement-drives/placements/me`, { withCredentials: true });
      const studentDrives = response.data.eligibleDrives || [];
      const sortedDrives = studentDrives.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setDrives(sortedDrives);
      setErrors([]);
    } catch (error) {
      console.error('Fetch error:', error.response?.data);
      setErrors([error.response?.data?.message || 'Error fetching placement drives']);
    } finally {
      setLoading(false);
    }
  };

  const applyToDrive = async (driveId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/placement-drives/apply/${driveId}`, {}, { withCredentials: true });
      setMessage(response.data.message);
      setErrors([]);
      fetchDrives();
    } catch (error) {
      console.error('Apply error:', error.response?.data);
      setErrors([error.response?.data?.message || 'Error applying to placement drive']);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return 'text-yellow-400';
      case 'Applied': return 'text-blue-400';
      case 'Accepted': return 'text-accent';
      case 'Rejected': return 'text-error';
      case 'Not Applied': return 'text-text-secondary';
      case 'Shortlisted': return 'text-accent';
      case 'Selected': return 'text-green-500';
      case 'Interview': return 'text-purple-400';
      default: return 'text-text-primary';
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
      case 'Applied': return 'bg-blue-400/20 text-blue-400 border-blue-400/30';
      case 'Accepted': return 'bg-accent/20 text-accent border-accent/30';
      case 'Rejected': return 'bg-error/20 text-error border-error/30';
      case 'Not Applied': return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
      case 'Shortlisted': return 'bg-accent/20 text-accent border-accent/30';
      case 'Selected': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'Interview': return 'bg-purple-400/20 text-purple-400 border-purple-400/30';
      default: return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
    }
  };

  const getPhaseIcon = (phaseName) => {
    switch (phaseName) {
      case 'Resume Screening': return '📄';
      case 'Written Test': return '📝';
      case 'Interview HR': return '👔';
      case 'Interview Technical': return '💻';
      case 'Aptitude Test': return '🧠';
      case 'Coding Test': return '⌨️';
      case 'Final Selection': return '🎯';
      default: return '📋';
    }
  };

  // Calculate the timeline progress based on phases
  const getPhaseProgress = (phases) => {
    if (!phases || phases.length === 0) return 0;
    
    const totalPhases = 7; // Based on enum in model
    return Math.min(100, Math.round((phases.length / totalPhases) * 100));
  };

  return (
    <div className="min-h-screen bg-primary-bg text-text-primary p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center animate-fade-in">
          Eligible Placement Drives
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-12 h-12 rounded-full border-4 border-accent/30 border-t-accent animate-spin"></div>
          </div>
        ) : drives.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {drives.map((drive) => (
              <div
                key={drive._id}
                className="bg-secondary-bg p-6 rounded-xl shadow-glass border border-white/10 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Company and Role Info */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{drive.companyName}</h3>
                    <p className="text-text-secondary line-clamp-2">{drive.role}</p>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeStyle(drive.status)}`}>
                    {drive.status}
                  </span>
                </div>

                {/* Drive Details */}
                <div className="space-y-2 mb-4">
                  <p className="text-text-secondary flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">{drive.date ? new Date(drive.date).toLocaleDateString('en-GB') : 'N/A'}</span>
                  </p>
                  <p className="text-text-secondary flex justify-between">
                    <span>Min CGPA:</span>
                    <span className="font-medium">{drive.minCGPA}</span>
                  </p>
                  <p className="text-text-secondary flex justify-between">
                    <span>Max Backlogs:</span>
                    <span className="font-medium">{drive.maxBacklogs}</span>
                  </p>
                </div>

                {/* Application Status */}
                {drive.status === 'Not Applied' ? (
                  <div className="mt-6">
                    <button
                      onClick={() => applyToDrive(drive._id)}
                      className="w-full bg-gradient-to-r from-highlight to-accent hover:from-accent hover:to-highlight text-text-primary py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Apply Now
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Current Phase Information */}
                    {drive.currentPhase && (
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <h4 className="font-medium mb-2 flex items-center">
                          <span className="mr-2">{getPhaseIcon(drive.currentPhase.name)}</span>
                          Current Phase: {drive.currentPhase.name}
                        </h4>
                        
                        <div className="mt-2 mb-3 bg-primary-bg rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-highlight to-accent h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${getPhaseProgress(drive.phases)}%` }}
                          ></div>
                        </div>
                        
                        <p className="text-sm mb-3">
                          <span className={getStatusStyle(drive.studentPhaseStatus)}>
                            Status: {drive.studentPhaseStatus || 'Pending'}
                          </span>
                        </p>
                        
                        {drive.currentPhase.instructions && (
                          <div className="mt-3 bg-primary-bg/50 p-3 rounded-lg text-sm">
                            <p className="font-medium mb-1">Instructions:</p>
                            <p className="text-text-secondary">{drive.currentPhase.instructions}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-secondary-bg/50 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-text-secondary/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20v-6m0 0c-3.5 0-6.5-3-6.5-6.5 0-3.58 2.92-6.5 6.5-6.5s6.5 2.92 6.5 6.5c0 3.5-3 6.5-6.5 6.5z" />
            </svg>
            <p className="text-text-secondary text-lg">No eligible placement drives available.</p>
            <p className="text-text-secondary/70 mt-2">Check back later for new opportunities.</p>
          </div>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mt-6 bg-error/20 p-4 rounded-xl animate-fade-in border border-error/30">
            {errors.map((error, index) => (
              <p key={index} className="text-error flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </p>
            ))}
          </div>
        )}

        {/* Success Messages */}
        {message && (
          <div className="mt-6 bg-accent/20 p-4 rounded-xl animate-fade-in border border-accent/30">
            <p className="text-accent flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPlacementDrives;