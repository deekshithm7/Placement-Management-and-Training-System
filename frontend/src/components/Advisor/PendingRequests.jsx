import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionInProgress, setActionInProgress] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { user } = useAuth();

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/admin/pending-alumni-requests', { withCredentials: true });
      setRequests(res.data);
    } catch (error) {
      setError('Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    setActionInProgress(id);
    setMessage({ text: '', type: '' });
    try {
      await axios.put(`/api/admin/approve-alumni-request/${id}`, {}, { withCredentials: true });
      setRequests(requests.filter((req) => req._id !== id));
      setMessage({ text: 'Request approved successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Failed to approve', type: 'error' });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (id) => {
    setActionInProgress(id);
    setMessage({ text: '', type: '' });
    try {
      await axios.put(`/api/admin/reject-alumni-request/${id}`, {}, { withCredentials: true });
      setRequests(requests.filter((req) => req._id !== id));
      setMessage({ text: 'Request rejected successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Failed to reject', type: 'error' });
    } finally {
      setActionInProgress(null);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="min-h-screen bg-primary-bg py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-text-primary">Pending Alumni Requests</h1>
          <button
            onClick={fetchRequests}
            className="mt-4 sm:mt-0 bg-highlight hover:bg-blue-500 text-text-primary p-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:shadow-lg focus:ring-2 focus:ring-accent"
            aria-label="Refresh Requests"
          >
            <RefreshCw size={20} /> Refresh
          </button>
        </div>

        {message.text && (
          <div className={`mb-4 p-3 rounded-lg ${message.type === 'error' ? 'bg-error bg-opacity-20 text-error' : 'bg-accent bg-opacity-20 text-accent'}`}>
            {message.text}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            <p className="mt-3 text-text-secondary">Loading requests...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-error bg-opacity-20 text-error p-4 rounded-lg mb-6">{error}</div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="bg-secondary-bg shadow-glass rounded-lg p-12 text-center text-text-secondary">
            No pending registration requests.
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <div className="bg-secondary-bg shadow-glass rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-[#2c3e50]">
                <tr>
                  {['Name', 'Email', 'Batch Year', 'Branch', 'Request Date', 'Actions'].map((header) => (
                    <th
                      key={header}
                      className={`px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider ${header === 'Actions' ? 'text-right' : ''}`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {requests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-700 transition-all duration-200">
                    <td className="px-6 py-4 text-sm text-text-primary">{request.name}</td>
                    <td className="px-6 py-4 text-sm text-text-primary">{request.email}</td>
                    <td className="px-6 py-4 text-sm text-text-primary">{request.batchYear}</td>
                    <td className="px-6 py-4 text-sm text-text-primary">{request.branch}</td>
                    <td className="px-6 py-4 text-sm text-text-primary">{formatDate(request.createdAt)}</td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex justify-end space-x-2 flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleApprove(request._id)}
                          disabled={actionInProgress === request._id}
                          className="bg-accent hover:bg-green-600 text-text-primary p-2 rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50 focus:ring-2 focus:ring-highlight"
                          aria-label="Approve Request"
                        >
                          {actionInProgress === request._id ? (
                            <span className="animate-spin h-4 w-4 border-b-2 border-text-primary rounded-full"></span>
                          ) : (
                            <Check size={16} />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          disabled={actionInProgress === request._id}
                          className="bg-error hover:bg-red-600 text-text-primary p-2 rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50 focus:ring-2 focus:ring-highlight"
                          aria-label="Reject Request"
                        >
                          {actionInProgress === request._id ? (
                            <span className="animate-spin h-4 w-4 border-b-2 border-text-primary rounded-full"></span>
                          ) : (
                            <X size={16} />
                          )}
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingRequests;