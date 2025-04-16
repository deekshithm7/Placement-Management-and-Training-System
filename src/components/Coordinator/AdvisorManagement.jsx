import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash, Search } from 'lucide-react';
import AddAdvisorForm from './AddAdvisorForm';
import EditAdvisorForm from './EditAdvisorForm';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const AdvisorManagement = () => {
  const { user } = useAuth();
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAdvisors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/advisors`, {
        withCredentials: true,
      });
      console.log('Fetched advisors:', response.data); // Debug
      setAdvisors(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch advisors');
      console.error('Error fetching advisors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const handleAddAdvisor = async (newAdvisorData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/advisors/add`,
        newAdvisorData,
        { withCredentials: true }
      );
      console.log('New advisor added:', response.data.advisor); // Debug
      await fetchAdvisors(); // Refresh list
      setShowAddForm(false);
      return { success: true, message: 'Advisor added successfully' };
    } catch (err) {
      console.error('Error adding advisor:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to add advisor',
      };
    }
  };

  const handleEditAdvisor = async (id, updatedData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/advisors/${id}`,
        updatedData,
        { withCredentials: true }
      );
      setAdvisors(advisors.map((advisor) =>
        advisor._id === id ? response.data.advisor : advisor
      ));
      setShowEditForm(false);
      setSelectedAdvisor(null);
      return { success: true, message: 'Advisor updated successfully' };
    } catch (err) {
      console.error('Error updating advisor:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update advisor',
      };
    }
  };

  const handleDeleteAdvisor = async (id) => {
    if (!id || typeof id !== 'string' || id === 'undefined') {
      setError('Invalid advisor ID');
      console.error('Attempted to delete with invalid ID:', id);
      return;
    }
    if (!window.confirm('Are you sure you want to delete this advisor?')) {
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/api/advisors/${id}`, {
        withCredentials: true,
      });
      setAdvisors(advisors.filter((advisor) => advisor._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete advisor');
      console.error('Error deleting advisor:', err);
    }
  };

  const handleEditClick = (advisor) => {
    setSelectedAdvisor(advisor);
    setShowEditForm(true);
  };

  const filteredAdvisors = advisors.filter((advisor) => {
    if (!advisor) return false;
    const name = (advisor.name || '').toLowerCase();
    const email = (advisor.email || '').toLowerCase();
    const branch = (advisor.branch || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search) || branch.includes(search);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="bg-gray-800/90 backdrop-blur-md shadow-xl rounded-lg border border-gray-700 p-4 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h1 className="text-2xl font-extrabold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Advisor Management
          </h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-3 py-1.5 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 flex items-center"
          >
            <Plus size={16} className="mr-1" /> Add Advisor
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-3 rounded-lg border border-red-500/50 animate-pulse">
            {error}
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            placeholder="Search advisors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 bg-gray-900/80 border border-gray-600 rounded-full text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
          />
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-6 animate-pulse">Loading advisors...</div>
        ) : filteredAdvisors.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-600 text-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 font-semibold text-sm">Name</th>
                  <th className="px-4 py-2 font-semibold text-sm">Email</th>
                  <th className="px-4 py-2 font-semibold text-sm">Branch</th>
                  <th className="px-4 py-2 font-semibold text-sm">Phone</th>
                  <th className="px-4 py-2 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredAdvisors.map((advisor, index) => (
                  <tr
                    key={advisor._id || index}
                    className={`${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'} hover:bg-gray-700 transition-colors duration-150`}
                  >
                    <td className="px-4 py-2 text-white font-medium text-sm">{advisor.name || 'N/A'}</td>
                    <td className="px-4 py-2 text-gray-300 text-sm">{advisor.email || 'N/A'}</td>
                    <td className="px-4 py-2 text-gray-300 text-sm">{advisor.branch || 'N/A'}</td>
                    <td className="px-4 py-2 text-gray-300 text-sm">{advisor.phoneNumber || 'N/A'}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(advisor)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white p-1.5 rounded-full shadow-md transform hover:scale-105 transition-all duration-200"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => advisor._id ? handleDeleteAdvisor(advisor._id) : console.error('No valid ID for advisor:', advisor)}
                          className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-md transform hover:scale-105 transition-all duration-200"
                          title="Delete"
                          disabled={!advisor._id}
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-6">
            {searchTerm ? 'No advisors matching your search' : 'No advisors found'}
          </div>
        )}

        {showAddForm && (
          <AddAdvisorForm
            onSubmit={handleAddAdvisor}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {showEditForm && selectedAdvisor && (
          <EditAdvisorForm
            advisor={selectedAdvisor}
            onSubmit={(data) => handleEditAdvisor(selectedAdvisor._id, data)}
            onCancel={() => {
              setShowEditForm(false);
              setSelectedAdvisor(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdvisorManagement;