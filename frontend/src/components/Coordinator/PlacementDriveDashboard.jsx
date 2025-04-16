import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Plus, Briefcase, Calendar, Users, Search, Filter, Check, X, ChevronDown, ChevronUp, Award } from 'lucide-react';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const PlacementDriveDashboard = () => {
  const { role } = useAuth();
  const [formData, setFormData] = useState({
    companyName: '', role: '', description: '', minCGPA: '', maxBacklogs: '', eligibleBranches: '', minSemestersCompleted: '', date: ''
  });
  const [drives, setDrives] = useState([]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  if (role !== 'Coordinator') return <Navigate to="/" replace />;

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/placement-drives/all', { withCredentials: true });
      setDrives(response.data);
    } catch (error) {
      setErrors([error.response?.data.message || 'Error fetching placement drives']);
    } finally {
      setIsLoading(false);
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
      setIsFormOpen(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setErrors([error.response?.data.message || 'Error creating placement drive']);
    }
  };

  const filteredDrives = drives
    .filter(drive => 
      (filterStatus === 'All' || drive.status === filterStatus) &&
      (drive.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
       drive.role.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'date') return sortOrder === 'desc' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date);
      if (sortBy === 'company') return sortOrder === 'desc' ? b.companyName.localeCompare(a.companyName) : a.companyName.localeCompare(b.companyName);
      if (sortBy === 'applicants') return sortOrder === 'desc' ? b.applications.length - a.applications.length : a.applications.length - b.applications.length;
      return 0;
    });

  const activeDrives = drives.filter(drive => drive.status !== 'Completed').length;
  const completedDrives = drives.filter(drive => drive.status === 'Completed').length;
  const totalApplicants = drives.reduce((sum, drive) => sum + drive.applications.length, 0);

  const toggleSort = (field) => {
    if (sortBy === field) setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    else { setSortBy(field); setSortOrder('desc'); }
  };

  // Loading Skeleton Components
  const StatCardSkeleton = () => (
    <div className="bg-secondary-bg p-4 sm:p-6 rounded-lg shadow-glass animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-gray-700 rounded"></div>
        <div className="p-2 bg-gray-700 rounded-full w-10 h-10"></div>
      </div>
      <div className="h-8 w-16 bg-gray-700 rounded mt-4"></div>
    </div>
  );

  const DriveCardSkeleton = () => (
    <div className="bg-secondary-bg p-4 sm:p-6 rounded-lg shadow-glass border border-gray-700 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-full bg-gray-700 w-10 h-10"></div>
        <div className="h-6 w-20 bg-gray-700 rounded-full"></div>
      </div>
      <div className="h-6 w-3/4 bg-gray-700 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-gray-700 rounded mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 w-2/3 bg-gray-700 rounded"></div>
        <div className="h-4 w-1/2 bg-gray-700 rounded"></div>
        <div className="h-4 w-2/3 bg-gray-700 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary-bg p-4 sm:p-6 lg:p-8 text-text-primary">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-highlight to-accent">
              Placement Drive Dashboard
            </h2>
            <p className="text-text-secondary text-sm mt-1">Manage company placements and student applications</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            disabled={isLoading}
          >
            <Plus size={18} /> Create New Drive
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {[
              { title: 'Active Drives', value: activeDrives, icon: Briefcase, color: 'highlight' },
              { title: 'Completed Drives', value: completedDrives, icon: Check, color: 'accent' },
              { title: 'Total Applicants', value: totalApplicants, icon: Users, color: 'highlight' },
            ].map(stat => (
              <div key={stat.title} className="bg-secondary-bg p-4 sm:p-6 rounded-lg shadow-glass hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-text-secondary font-medium">{stat.title}</h3>
                  <div className={`p-2 bg-${stat.color}/20 rounded-full`}>
                    <stat.icon className={`text-${stat.color}`} size={20} />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold mt-2">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="bg-secondary-bg p-4 rounded-lg shadow-glass mb-6 animate-pulse">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 h-10 bg-gray-700 rounded-lg"></div>
              <div className="flex gap-2 sm:gap-3">
                <div className="h-10 w-24 bg-gray-700 rounded-lg"></div>
                <div className="h-10 w-16 bg-gray-700 rounded-lg"></div>
                <div className="h-10 w-16 bg-gray-700 rounded-lg"></div>
                <div className="h-10 w-16 bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-secondary-bg p-4 rounded-lg shadow-glass mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
              <input
                type="text"
                placeholder="Search drives by company or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-primary-bg text-text-primary pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-highlight focus:outline-none transition-all"
              />
            </div>
            <div className="flex gap-2 sm:gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-primary-bg text-text-primary px-3 py-2 rounded-lg border border-gray-700 focus:border-highlight focus:outline-none"
              >
                <option value="All">All Status</option>
                <option value="Upcoming">Upcoming</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              {['date', 'company', 'applicants'].map(field => (
                <button
                  key={field}
                  onClick={() => toggleSort(field)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${
                    sortBy === field ? 'border-highlight bg-highlight/20' : 'border-gray-700 bg-primary-bg'
                  }`}
                >
                  {field === 'date' && <Calendar size={16} />}
                  {field === 'company' && <Briefcase size={16} />}
                  {field === 'applicants' && <Users size={16} />}
                  <span className="hidden sm:inline">{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                  {sortBy === field && (sortOrder === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />)}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <DriveCardSkeleton />
            <DriveCardSkeleton />
            <DriveCardSkeleton />
          </div>
        ) : filteredDrives.length === 0 ? (
          <div className="text-center text-text-secondary py-12 bg-secondary-bg rounded-lg shadow-glass">
            <Briefcase className="mx-auto mb-4 opacity-50" size={48} />
            <p className="text-lg sm:text-xl font-semibold mb-2">{drives.length === 0 ? 'No placement drives available' : 'No matching drives found'}</p>
            <p>{drives.length === 0 ? 'Create your first drive to get started!' : 'Try adjusting your search filters'}</p>
            <button
              onClick={() => { setIsFormOpen(true); setSearchTerm(''); setFilterStatus('All'); }}
              className="mt-4 bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              <Plus size={18} className="inline mr-2" /> Create New Drive
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredDrives.map(drive => (
              <div
                key={drive._id}
                className="bg-secondary-bg p-4 sm:p-6 rounded-lg shadow-glass hover:shadow-xl border border-gray-700 hover:border-highlight transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/Coordinator/placement-drives/${drive._id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-full bg-highlight/20">
                    <Briefcase className="text-highlight" size={24} />
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      drive.status === 'Completed' ? 'bg-accent/20 text-accent' : 
                      drive.status === 'In Progress' ? 'bg-yellow-900 text-yellow-300' : 
                      'bg-highlight/20 text-highlight'
                    }`}
                  >
                    {drive.status}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-text-primary hover:text-highlight transition-colors mb-1">
                  {drive.companyName}
                </h3>
                <p className="text-text-secondary mb-3">{drive.role}</p>
                <div className="space-y-2 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} /> <span>{new Date(drive.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} /> <span><strong>{drive.applications.length}</strong> Applicants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award size={16} /> <span><strong>{drive.phases.length}</strong> Selection Phases</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isFormOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-secondary-bg rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 glass">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Create New Placement Drive</h3>
                <button onClick={() => setIsFormOpen(false)} className="text-text-secondary hover:text-error">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Company Name', name: 'companyName', placeholder: 'e.g., TechCorp', required: true },
                    { label: 'Role', name: 'role', placeholder: 'e.g., Software Engineer', required: true },
                    { label: 'Minimum CGPA', name: 'minCGPA', type: 'number', step: '0.1', min: '0', max: '10' },
                    { label: 'Maximum Backlogs', name: 'maxBacklogs', type: 'number', min: '0' },
                    { label: 'Min Semesters Completed', name: 'minSemestersCompleted', type: 'number', min: '1', max: '8' },
                    { label: 'Drive Date', name: 'date', type: 'date', required: true },
                  ].map(field => (
                    <div key={field.name}>
                      <label className="block text-text-secondary text-sm mb-1">{field.label}</label>
                      <input
                        type={field.type || 'text'}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        step={field.step}
                        min={field.min}
                        max={field.max}
                        required={field.required}
                        className="w-full bg-primary-bg text-text-primary p-2 rounded-lg border border-gray-700 focus:border-highlight focus:outline-none transition-all"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-text-secondary text-sm mb-1">Eligible Branches (comma-separated)</label>
                    <input
                      type="text"
                      name="eligibleBranches"
                      value={formData.eligibleBranches}
                      onChange={handleChange}
                      placeholder="e.g., CSE, IT, ECE"
                      required
                      className="w-full bg-primary-bg text-text-primary p-2 rounded-lg border border-gray-700 focus:border-highlight focus:outline-none transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-text-secondary text-sm mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Brief description of the drive"
                      className="w-full bg-primary-bg text-text-primary p-2 rounded-lg border border-gray-700 focus:border-highlight focus:outline-none transition-all h-24 resize-y"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-text-primary py-2 rounded-lg transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-accent to-highlight hover:from-accent/80 hover:to-highlight/80 text-white py-2 rounded-lg transition-all duration-200"
                  >
                    Create Drive
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {message && (
          <div className="fixed bottom-4 right-4 bg-accent text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
            <Check size={20} className="inline mr-2" /> {message}
          </div>
        )}
        {errors.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-error text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
            <X size={20} className="inline mr-2" /> {errors[0]}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementDriveDashboard;