import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, AlertCircle, Calendar, ExternalLink } from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const JobOpportunities = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkExpiredJobs = (jobsToCheck) => {
    const currentDate = new Date();
    return jobsToCheck.filter(job => !job.applicationDeadline || new Date(job.applicationDeadline) >= currentDate);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/jobs`, { withCredentials: true });
        const jobData = Array.isArray(response.data) ? response.data : response.data.jobs || [];
        setJobs(checkExpiredJobs(jobData));
        setError(null);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to fetch job opportunities.');
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (isLoading) return (
    <div className="p-4 sm:p-6 bg-primary-bg min-h-screen flex items-center justify-center font-sans">
      <div className="text-text-secondary animate-pulse">Loading job opportunities...</div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 bg-primary-bg min-h-screen font-sans">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary animate-fade-in">Job Opportunities</h2>
      </div>
      {error && (
        <div className="bg-error/20 text-error p-3 rounded-xl mb-4 flex items-center animate-fade-in">
          <AlertCircle size={20} className="mr-2" /> {error}
        </div>
      )}
      {jobs.length === 0 ? (
        <div className="text-text-secondary text-center py-12">No job opportunities found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-secondary-bg p-4 rounded-xl shadow-glass flex flex-col transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mb-2"><Briefcase size={24} className="text-highlight" /></div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">{job.title}</h3>
              <p className="text-text-secondary text-sm mb-2">{job.company}</p>
              <p className="text-text-secondary text-sm mb-2 flex-grow line-clamp-3">{job.description}</p>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-4">
                {job.applicationDeadline && (
                  <div className={`flex items-center text-sm ${
                    new Date(job.applicationDeadline) < new Date(new Date().setDate(new Date().getDate() + 7)) 
                      ? 'text-yellow-400' 
                      : 'text-text-secondary'
                  }`}>
                    <Calendar size={16} className="mr-2" />
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                    {new Date(job.applicationDeadline) < new Date(new Date().setDate(new Date().getDate() + 7)) && ' (Closing soon)'}
                  </div>
                )}
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-highlight hover:text-highlight/80 text-sm flex items-center gap-2 transition-all duration-300"
                >
                  <ExternalLink size={16} /> Apply
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobOpportunities;