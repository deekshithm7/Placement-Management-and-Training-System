import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

axios.defaults.baseURL = 'http://localhost:8080';

const PlacementDriveDashboard = () => {
  const { role } = useAuth();
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    description: '',
    minCGPA: '',
    maxBacklogs: '',
    eligibleBranches: '',
    minSemestersCompleted: '',
    date: ''
  });
  const [drives, setDrives] = useState([]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);

  if (role !== 'Coordinator') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const response = await axios.get('/api/placement-drives/all', { withCredentials: true });
      setDrives(response.data);
    } catch (error) {
      setErrors([error.response?.data.message || 'Error fetching placement drives']);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setMessage('');

    try {
      const response = await axios.post('/api/placement-drives/create', {
        ...formData,
        eligibleBranches: formData.eligibleBranches.split(',').map(b => b.trim()),
        minCGPA: parseFloat(formData.minCGPA) || 0,
        maxBacklogs: parseInt(formData.maxBacklogs) || 0,
        minSemestersCompleted: parseInt(formData.minSemestersCompleted) || 0
      }, { withCredentials: true });
      setMessage(response.data.message);
      setFormData({
        companyName: '', role: '', description: '', minCGPA: '',
        maxBacklogs: '', eligibleBranches: '', minSemestersCompleted: '', date: ''
      });
      fetchDrives();
    } catch (error) {
      setErrors([error.response?.data.message || 'Error creating placement drive']);
    }
  };

  const updateStatus = async (driveId, studentId, status) => {
    try {
      await axios.put(`/api/placement-drives/status/${driveId}/${studentId}`, { status }, { withCredentials: true });
      fetchDrives();
    } catch (error) {
      setErrors([error.response?.data.message || 'Error updating status']);
    }
  };

  return (
    <div className="bg-[#0f1218] min-h-screen p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Placement Drive Dashboard</h2>

        {/* Add Placement Drive Form */}
        <div className="bg-[#1a2233] p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-xl mb-4">Add New Placement Drive</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Company Name" className="bg-[#2c3e50] text-white p-2 rounded" required />
              <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="Role" className="bg-[#2c3e50] text-white p-2 rounded" required />
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="bg-[#2c3e50] text-white p-2 rounded col-span-2" />
              <input type="number" name="minCGPA" value={formData.minCGPA} onChange={handleChange} placeholder="Min CGPA" step="0.1" className="bg-[#2c3e50] text-white p-2 rounded" />
              <input type="number" name="maxBacklogs" value={formData.maxBacklogs} onChange={handleChange} placeholder="Max Backlogs" className="bg-[#2c3e50] text-white p-2 rounded" />
              <input type="text" name="eligibleBranches" value={formData.eligibleBranches} onChange={handleChange} placeholder="Eligible Branches (comma-separated)" className="bg-[#2c3e50] text-white p-2 rounded" required />
              <input type="number" name="minSemestersCompleted" value={formData.minSemestersCompleted} onChange={handleChange} placeholder="Min Semesters" className="bg-[#2c3e50] text-white p-2 rounded" />
              <input type="date" name="date" value={formData.date} onChange={handleChange} className="bg-[#2c3e50] text-white p-2 rounded" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded">Create Placement Drive</button>
          </form>
        </div>

        {/* List of Placement Drives */}
        <div className="bg-[#1a2233] p-6 rounded-lg shadow-lg">
          <h3 className="text-xl mb-4">Placement Drives</h3>
          {drives.map(drive => (
            <div key={drive._id} className="border-b border-[#2c3e50] py-4">
              <p><strong>{drive.companyName} - {drive.role}</strong></p>
              <p>Date: {new Date(drive.date).toLocaleDateString()}</p>
              <p>Eligible Branches: {drive.eligibleBranches.join(', ')}</p>
              <p>Applications: {drive.applications.length}</p>
              {drive.applications.map(app => (
                <div key={app._id} className="ml-4 mt-2">
                  <p>{app.student.name} ({app.student.registrationNumber}) - {app.status}</p>
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(drive._id, app.student._id, e.target.value)}
                    className="bg-[#2c3e50] text-white p-1 rounded"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              ))}
            </div>
          ))}
        </div>

        {errors.length > 0 && (
          <div className="mt-4 bg-red-600 bg-opacity-20 p-4 rounded">
            {errors.map((error, index) => <p key={index} className="text-red-400">{error}</p>)}
          </div>
        )}
        {message && (
          <div className="mt-4 bg-green-600 bg-opacity-20 p-4 rounded">
            <p className="text-green-400">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementDriveDashboard;