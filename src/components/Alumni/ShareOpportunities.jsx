import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Briefcase, AlertCircle, Calendar, X, ExternalLink } from 'lucide-react';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const JobOpportunityModal = ({ onClose, onJobAdded, jobToEdit }) => {
  const [jobData, setJobData] = useState(
    jobToEdit
      ? {
          title: jobToEdit.title,
          company: jobToEdit.company,
          description: jobToEdit.description,
          applyUrl: jobToEdit.applyUrl,
          applicationDeadline: jobToEdit.applicationDeadline
            ? new Date(jobToEdit.applicationDeadline).toISOString().split('T')[0]
            : '',
        }
      : { title: '', company: '', description: '', applyUrl: '', applicationDeadline: '' }
  );
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidUrl = (url) => /^https?:\/\/.+/.test(url);

  const validateForm = () => {
    const newErrors = {};
    if (!jobData.title.trim()) newErrors.title = 'Job title is required';
    if (!jobData.company.trim()) newErrors.company = 'Company name is required';
    if (!jobData.description.trim()) newErrors.description = 'Description is required';
    if (!jobData.applyUrl.trim()) newErrors.applyUrl = 'Application URL is required';
    else if (!isValidUrl(jobData.applyUrl)) newErrors.applyUrl = 'Enter a valid URL';
    if (jobData.applicationDeadline && new Date(jobData.applicationDeadline) < new Date()) {
      newErrors.applicationDeadline = 'Deadline cannot be in the past';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const submitData = {
        ...jobData,
        applicationDeadline: jobData.applicationDeadline ? new Date(jobData.applicationDeadline).toISOString() : undefined,
      };
      const response = jobToEdit
        ? await axios.put(`/api/jobs/${jobToEdit._id}`, submitData, { withCredentials: true })
        : await axios.post('/api/jobs', submitData, { withCredentials: true });
      onJobAdded(response.data);
      setStatus('Job saved successfully!');
      setTimeout(() => {
        setStatus('');
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving job:', error);
      setErrors({ submit: 'Failed to save job opportunity. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000]"> {/* Increased z-index to 1000 */}
      <form onSubmit={handleSubmit} className="bg-secondary-bg rounded-xl shadow-glass w-full max-w-md text-text-primary">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-bold">{jobToEdit ? 'Edit Job Opportunity' : 'Add Job Opportunity'}</h3>
          <button type="button" onClick={onClose} className="text-text-secondary hover:text-error">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {status && (
            <div className="bg-accent bg-opacity-20 text-accent p-2 rounded-lg flex items-center">
              <span>{status}</span>
            </div>
          )}
          {errors.submit && (
            <div className="bg-error bg-opacity-20 text-error p-2 rounded-lg flex items-center">
              <AlertCircle size={18} className="mr-2" /> {errors.submit}
            </div>
          )}
          {[
            { name: 'title', label: 'Job Title', placeholder: 'Enter job title' },
            { name: 'company', label: 'Company', placeholder: 'Enter company name' },
            { name: 'description', label: 'Description', placeholder: 'Enter job description', textarea: true },
            { name: 'applyUrl', label: 'Application URL', placeholder: 'https://example.com/apply' },
            { name: 'applicationDeadline', label: 'Application Deadline', type: 'date' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-text-primary mb-1 text-sm font-medium">{field.label}</label>
              {field.textarea ? (
                <textarea
                  value={jobData[field.name]}
                  onChange={(e) => {
                    setJobData({ ...jobData, [field.name]: e.target.value });
                    setErrors({ ...errors, [field.name]: null });
                  }}
                  className={`w-full bg-[#2c3e50] text-text-primary p-2 rounded-lg border ${
                    errors[field.name] ? 'border-error' : 'border-gray-700'
                  } focus:outline-none focus:ring-2 focus:ring-highlight transition-all duration-200`}
                  placeholder={field.placeholder}
                  rows="3"
                  required
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  value={jobData[field.name]}
                  onChange={(e) => {
                    setJobData({ ...jobData, [field.name]: e.target.value });
                    setErrors({ ...errors, [field.name]: null });
                  }}
                  className={`w-full bg-[#2c3e50] text-text-primary p-2 rounded-lg border ${
                    errors[field.name] ? 'border-error' : 'border-gray-700'
                  } focus:outline-none focus:ring-2 focus:ring-highlight transition-all duration-200`}
                  placeholder={field.placeholder}
                  required={field.name !== 'applicationDeadline'}
                />
              )}
              {errors[field.name] && <p className="text-error text-xs mt-1">{errors[field.name]}</p>}
            </div>
          ))}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full p-2 rounded-lg text-text-primary transition-all duration-200 ${
              isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-highlight hover:bg-blue-500 hover:shadow-lg'
            }`}
          >
            {isSubmitting ? 'Saving...' : jobToEdit ? 'Update Job' : 'Add Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const ShareOpportunities = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddJob, setShowAddJob] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deletedExpiredCount, setDeletedExpiredCount] = useState(0);

  const checkAndDeleteExpiredJobs = async (jobsToCheck) => {
    const currentDate = new Date();
    const expiredJobs = jobsToCheck.filter((job) => job.applicationDeadline && new Date(job.applicationDeadline) < currentDate);
    if (expiredJobs.length > 0) {
      const deletePromises = expiredJobs.map((job) =>
        axios.delete(`/api/jobs/${job._id}`, { withCredentials: true }).catch((err) => {
          console.error(`Error deleting job ${job._id}:`, err);
          return null;
        })
      );
      try {
        const results = await Promise.all(deletePromises);
        const successfulDeletes = results.filter((result) => result !== null).length;
        setJobs((prevJobs) =>
          prevJobs.filter((job) => !job.applicationDeadline || new Date(job.applicationDeadline) >= currentDate)
        );
        setDeletedExpiredCount((prev) => prev + successfulDeletes);
      } catch (error) {
        console.error('Error processing job deletions:', error);
      }
    }
    return jobsToCheck.filter((job) => !job.applicationDeadline || new Date(job.applicationDeadline) >= currentDate);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/jobs', { withCredentials: true });
        const jobData = Array.isArray(response.data) ? response.data : response.data.jobs || [];
        const filteredJobs = await checkAndDeleteExpiredJobs(jobData);
        setJobs(filteredJobs);
        setError(null);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to fetch job opportunities. Please refresh the page.');
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
    const intervalId = setInterval(() => {
      if (jobs.length > 0) checkAndDeleteExpiredJobs(jobs);
    }, 3600000);
    return () => clearInterval(intervalId);
  }, []);

  const handleDeleteJob = async (jobId) => {
    try {
      await axios.delete(`/api/jobs/${jobId}`, { withCredentials: true });
      setJobs(jobs.filter((j) => j._id !== jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete job opportunity. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleJobAdded = (updatedOrNewJob) => {
    if (editingJob) {
      setJobs(jobs.map((j) => (j._id === updatedOrNewJob._id ? updatedOrNewJob : j)));
    } else {
      setJobs([...jobs, updatedOrNewJob]);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-primary-bg min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-primary-bg min-h-screen text-text-primary">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Job Opportunities</h2>
        <button
          onClick={() => setShowAddJob(true)}
          className="mt-2 sm:mt-0 bg-accent hover:bg-green-600 text-text-primary px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
        >
          <Plus size={18} /> Add Job
        </button>
      </div>
      {error && (
        <div className="bg-error bg-opacity-20 text-error p-2 mb-4 rounded-lg flex items-center">
          <AlertCircle size={18} className="mr-2" /> {error}
        </div>
      )}
      {deletedExpiredCount > 0 && (
        <div className="bg-accent bg-opacity-20 text-accent p-2 mb-4 rounded-lg flex items-center">
          <Calendar size={18} className="mr-2" />
          {deletedExpiredCount} expired job {deletedExpiredCount === 1 ? 'opportunity' : 'opportunities'} removed
        </div>
      )}
      {jobs.length === 0 ? (
        <div className="text-text-secondary text-center">No job opportunities found. Add a new job to get started.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div key={job._id} className="bg-secondary-bg p-4 rounded-xl shadow-glass flex flex-col transition-all duration-200 hover:bg-gray-700">
              <div className="flex justify-between items-start mb-2">
                <Briefcase size={20} className="text-accent" />
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingJob(job);
                      setShowAddJob(true);
                    }}
                    className="text-highlight hover:text-blue-400"
                  >
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDeleteJob(job._id)} className="text-error hover:text-red-400">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="text-md font-semibold text-text-primary mb-1">{job.title}</h3>
              <p className="text-text-secondary text-sm mb-1">{job.company}</p>
              <p className="text-text-secondary text-sm mb-2 flex-grow line-clamp-3">{job.description}</p>
              <div className="flex justify-between items-center">
                {job.applicationDeadline && (
                  <div
                    className={`flex items-center text-sm ${
                      new Date(job.applicationDeadline) < new Date(new Date().setDate(new Date().getDate() + 7))
                        ? 'text-amber-400'
                        : 'text-text-secondary'
                    }`}
                  >
                    <Calendar size={16} className="mr-1" />
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                    {new Date(job.applicationDeadline) < new Date(new Date().setDate(new Date().getDate() + 7)) && ' (Closing soon)'}
                  </div>
                )}
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-highlight hover:text-blue-400 text-sm flex items-center gap-1 transition-all duration-200"
                >
                  <ExternalLink size={16} /> Apply
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      {showAddJob && (
        <JobOpportunityModal
          onClose={() => {
            setShowAddJob(false);
            setEditingJob(null);
          }}
          onJobAdded={handleJobAdded}
          jobToEdit={editingJob}
        />
      )}
    </div>
  );
};

export default ShareOpportunities;