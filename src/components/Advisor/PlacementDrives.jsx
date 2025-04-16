// frontend/src/components/PlacementDrives.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PlacementDrives = () => {
  const { user, role, loading: authLoading } = useAuth();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDrive, setSelectedDrive] = useState(null); // Track the drive to show in modal

  useEffect(() => {
    if (!authLoading && role === 'Advisor') {
      fetchPlacementDrives();
    }
  }, [authLoading, role]);

  const fetchPlacementDrives = async () => {
    try {
      const response = await axios.get('/api/advisors/placements', { withCredentials: true });
      console.log('[PLACEMENT DRIVES] Fetched data:', response.data); // Debug log
      setDrives(response.data);
      setLoading(false);
    } catch (err) {
      console.error('[PLACEMENT DRIVES] Fetch error:', err.response?.data || err.message);
      setError(
        err.response?.status === 403
          ? 'You are not authorized to view placement drives. Please log in as an Advisor.'
          : 'Failed to fetch placement drives'
      );
      setLoading(false);
    }
  };

  const openDriveDetails = (drive) => {
    console.log('[PLACEMENT DRIVES] Opening drive:', drive); // Debug log
    setSelectedDrive(drive);
  };

  const closeDriveDetails = () => {
    setSelectedDrive(null);
  };

  if (authLoading) return <div className="text-[#F1F5F9] text-center py-12 animate-pulse">Authenticating...</div>;
  if (role !== 'Advisor') {
    return <div className="text-[#F87171] text-center py-12">Unauthorized: Only Advisors can view placement drives.</div>;
  }
  if (loading) return <div className="text-[#F1F5F9] text-center py-12 animate-pulse">Loading...</div>;
  if (error) return <div className="text-[#F87171] text-center py-12">{error}</div>;

  return (
    <div className="min-h-screen bg-[#0F172A] p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl text-[#F1F5F9] font-semibold mb-6 flex items-center gap-2">
          <Briefcase size={28} className="text-[#10B981]" /> Placement Drives
        </h2>

        {drives.length === 0 ? (
          <p className="text-[#94A3B8] text-center text-lg">No placement drives found for your branch.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {drives.map(drive => (
              <button
                key={drive._id}
                onClick={() => openDriveDetails(drive)}
                className="bg-[#1E293B] rounded-lg shadow-md p-4 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#60A5FA]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg text-[#F1F5F9] font-semibold truncate">
                      {drive.companyName} - {drive.role}
                    </h3>
                    <div className="mt-2 text-[#94A3B8] text-sm space-y-1">
                      <p><span className="font-medium">Date:</span> {new Date(drive.date).toLocaleDateString()}</p>
                      <p>
                        <span className="font-medium">Status:</span>{' '}
                        <span
                          className={`${
                            drive.status === 'Open'
                              ? 'text-[#10B981]'
                              : drive.status === 'In Progress'
                              ? 'text-[#60A5FA]'
                              : 'text-[#94A3B8]'
                          }`}
                        >
                          {drive.status}
                        </span>
                      </p>
                      <p><span className="font-medium">Applications:</span> {drive.totalApplicationsFromBranch}</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Modal Overlay for Drive Details */}
        {selectedDrive && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-[#1E293B] rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
              {/* Close Button */}
              <button
                onClick={closeDriveDetails}
                className="absolute top-4 right-4 text-[#F1F5F9] hover:text-[#60A5FA] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] rounded-full p-1"
              >
                <X size={24} />
              </button>

              {/* Modal Content */}
              <h3 className="text-xl text-[#F1F5F9] font-semibold mb-4">
                {selectedDrive.companyName || 'Unknown Company'} - {selectedDrive.role || 'Unknown Role'}
              </h3>
              <p className="text-[#94A3B8] text-sm mb-4 italic">{selectedDrive.description || 'No description provided'}</p>

              {/* Summary Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-[#94A3B8] text-sm">
                <p>
                  <span className="font-medium">Date:</span>{' '}
                  {selectedDrive.date ? new Date(selectedDrive.date).toLocaleDateString() : 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <span
                    className={`${
                      selectedDrive.status === 'Open'
                        ? 'text-[#10B981]'
                        : selectedDrive.status === 'In Progress'
                        ? 'text-[#60A5FA]'
                        : 'text-[#94A3B8]'
                    }`}
                  >
                    {selectedDrive.status || 'Unknown'}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Applications:</span>{' '}
                  {selectedDrive.totalApplicationsFromBranch || 0}
                </p>
                <p>
                  <span className="font-medium">Eligible Branches:</span>{' '}
                  {selectedDrive.eligibleBranches?.join(', ') || 'N/A'}
                </p>
              </div>

              {/* Applications */}
              <div className="mb-6">
                <h4 className="text-md text-[#F1F5F9] font-medium mb-2">Applications</h4>
                {!selectedDrive.applications || selectedDrive.applications.length === 0 ? (
                  <p className="text-[#94A3B8] text-sm">No students from your branch have applied.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[#F1F5F9] text-sm">
                      <thead className="bg-[#0F172A] sticky top-0">
                        <tr>
                          {['Name', 'Reg. No.', 'Email', 'Status'].map(header => (
                            <th key={header} className="p-2 text-left font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDrive.applications.map(app => (
                          <tr
                            key={app.student?._id || app._id} // Fallback to app._id if student._id is missing
                            className="border-b border-[#94A3B8] border-opacity-20 hover:bg-[#0F172A] transition-all duration-200"
                          >
                            <td className="p-2 truncate max-w-[120px]">{app.student?.name || 'N/A'}</td>
                            <td className="p-2">{app.student?.registrationNumber || 'N/A'}</td>
                            <td className="p-2 truncate max-w-[150px]">{app.student?.email || 'N/A'}</td>
                            <td className="p-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  app.status === 'Selected'
                                    ? 'bg-[#10B981] text-[#0F172A]'
                                    : app.status === 'Rejected'
                                    ? 'bg-[#F87171] text-[#0F172A]'
                                    : 'bg-[#60A5FA] text-[#0F172A]'
                                }`}
                              >
                                {app.status || 'Applied'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Phases */}
              <div>
                <h4 className="text-md text-[#F1F5F9] font-medium mb-2">Phases</h4>
                {!selectedDrive.phases || selectedDrive.phases.length === 0 ? (
                  <p className="text-[#94A3B8] text-sm">No phases added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {selectedDrive.phases.map((phase, index) => (
                      <div
                        key={index}
                        className="bg-[#0F172A] p-3 rounded-md shadow-sm transition-all duration-200 hover:shadow-md"
                      >
                        <p className="text-[#F1F5F9] font-medium">
                          {phase.name || 'Unnamed Phase'}{' '}
                          <span className="text-[#94A3B8] text-xs">
                            (Created:{' '}
                            {phase.createdAt ? new Date(phase.createdAt).toLocaleDateString() : 'N/A'})
                          </span>
                        </p>
                        <div className="text-[#94A3B8] text-sm mt-1 space-y-1">
                          <p>
                            <span className="font-medium">Requirements:</span>{' '}
                            {phase.requirements || 'None'}
                          </p>
                          <p>
                            <span className="font-medium">Instructions:</span>{' '}
                            {phase.instructions || 'None'}
                          </p>
                        </div>
                        {/* Shortlisted Students */}
                        <p className="text-[#94A3B8] mt-2 font-medium">Shortlisted Students:</p>
                        {!phase.shortlistedStudents || phase.shortlistedStudents.length === 0 ? (
                          <p className="text-[#94A3B8] text-sm">No students shortlisted from your branch.</p>
                        ) : (
                          <ul className="list-disc list-inside text-[#94A3B8] text-sm mt-1">
                            {phase.shortlistedStudents.map(student => (
                              <li key={student._id || `${index}-${student.email}`}>
                                {student.name || 'N/A'} ({student.registrationNumber || 'N/A'},{' '}
                                {student.email || 'N/A'})
                              </li>
                            ))}
                          </ul>
                        )}
                        {/* Unattended Students */}
                        <p className="text-[#94A3B8] mt-2 font-medium">Unattended Students:</p>
                        {!phase.unattendedStudents || phase.unattendedStudents.length === 0 ? (
                          <p className="text-[#94A3B8] text-sm">No unattended students from your branch.</p>
                        ) : (
                          <ul className="list-disc list-inside text-[#94A3B8] text-sm mt-1">
                            {phase.unattendedStudents.map(student => (
                              <li key={student._id || `${index}-${student.email}`}>
                                {student.name || 'N/A'} ({student.registrationNumber || 'N/A'},{' '}
                                {student.email || 'N/A'})
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementDrives;