import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, FileText, Video, Link as LinkIcon, Download, X, Search, Filter, AlertTriangle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api` 
  : 'http://localhost:8080/api';
  
const getIcon = (type) => {
  switch (type) {
    case 'document':
      return <FileText size={20} className="text-teal-400" />;
    case 'video':
      return <Video size={20} className="text-green-400" />;
    case 'link':
      return <LinkIcon size={20} className="text-purple-400" />;
    default:
      return <FileText size={20} className="text-gray-400" />;
  }
};

// Error message component
const ErrorMessage = ({ message, onDismiss }) => {
  return (
    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 text-red-200 flex items-center justify-between">
      <div className="flex items-center">
        <AlertTriangle size={18} className="mr-2 text-red-400" />
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss} 
          className="text-red-300 hover:text-white transition-colors duration-200"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export const AddResource = ({ onClose, onResourceAdded, resourceToEdit }) => {
  const [resourceData, setResourceData] = useState(
    resourceToEdit 
      ? { ...resourceToEdit, file: null }
      : { title: '', description: '', type: 'document', file: null, url: '' }
  );
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('AddResource rendered with:', { resourceToEdit, resourceData });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    
    const formData = new FormData();
    formData.append('title', resourceData.title);
    formData.append('description', resourceData.description);
    formData.append('type', resourceData.type);
    if (resourceData.type === 'link') {
      formData.append('url', resourceData.url);
    } else if (resourceData.file) {
      formData.append('file', resourceData.file);
    } else if (!resourceToEdit && resourceData.type !== 'link') {
      setFormError('Please select a file to upload');
      setIsSubmitting(false);
      return;
    }

    try {
      let response;
      if (resourceToEdit) {
        response = await axios.put(`${API_BASE_URL}/resources/${resourceToEdit._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
        onResourceAdded(response.data);
      } else {
        response = await axios.post(`${API_BASE_URL}/resources`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
        onResourceAdded(response.data.resource);
      }
      onClose();
    } catch (error) {
      console.error('Error saving resource:', error);
      setFormError(
        error.response?.data?.message || 
        error.message || 
        'Failed to save resource. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResourceData({ ...resourceData, file });
      console.log('File selected:', file.name);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-start justify-center z-[100] pt-12">
      <div className="bg-gray-800/90 backdrop-blur-md rounded-lg border border-gray-700 p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-extrabold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            {resourceToEdit ? 'Edit Resource' : 'Add Resource'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>
        
        {formError && (
          <ErrorMessage 
            message={formError} 
            onDismiss={() => setFormError(null)} 
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1 text-sm font-medium">Resource Type</label>
            <select
              value={resourceData.type}
              onChange={(e) => setResourceData({ ...resourceData, type: e.target.value, file: null, url: '' })}
              className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={isSubmitting}
            >
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 mb-1 text-sm font-medium">Title</label>
            <input
              type="text"
              value={resourceData.title}
              onChange={(e) => setResourceData({ ...resourceData, title: e.target.value })}
              className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter resource title"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1 text-sm font-medium">Description</label>
            <textarea
              value={resourceData.description}
              onChange={(e) => setResourceData({ ...resourceData, description: e.target.value })}
              className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              placeholder="Enter resource description"
              rows="2"
              disabled={isSubmitting}
            />
          </div>

          {resourceData.type === 'link' && (
            <div>
              <label className="block text-gray-400 mb-1 text-sm font-medium">URL</label>
              <input
                type="url"
                value={resourceData.url}
                onChange={(e) => setResourceData({ ...resourceData, url: e.target.value })}
                className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter resource URL"
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          {resourceData.type !== 'link' && (
            <div>
              <label className="block text-gray-400 mb-1 text-sm font-medium">File</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-gray-200 text-sm file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-teal-500 file:text-white file:text-sm file:hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                accept={resourceData.type === 'video' ? 'video/*' : '*'}
                required={!resourceToEdit}
                disabled={isSubmitting}
              />
            </div>
          )}

          <button
            type="submit"
            className={`w-full ${
              isSubmitting 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
            } text-white px-4 py-1.5 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 font-medium text-sm flex justify-center items-center`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                {resourceToEdit ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>{resourceToEdit ? 'Update Resource' : 'Add Resource'}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export const Resources = () => {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddResource, setShowAddResource] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [operationError, setOperationError] = useState(null);
  const [operationStatus, setOperationStatus] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/resources`, { withCredentials: true });
        const resourceData = Array.isArray(response.data) ? response.data : response.data.resources || [];
        setResources(resourceData);
        setError(null);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch resources');
        setResources([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, []);

  // Auto-dismiss operation messages after 5 seconds
  useEffect(() => {
    if (operationError || operationStatus) {
      const timer = setTimeout(() => {
        setOperationError(null);
        setOperationStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [operationError, operationStatus]);

  const handleDeleteResource = async (resourceId) => {
    try {
      setOperationError(null);
      setOperationStatus("Deleting resource...");
      await axios.delete(`${API_BASE_URL}/resources/${resourceId}`, { withCredentials: true });
      setResources(resources.filter(r => r._id !== resourceId));
      setOperationStatus("Resource deleted successfully!");
    } catch (error) {
      console.error('Error deleting resource:', error);
      setOperationError(error.response?.data?.message || error.message || 'Failed to delete resource');
    }
  };

  const handleDownload = async (resource) => {
    try {
      setOperationError(null);
      setOperationStatus("Preparing download...");
      const response = await axios({
        url: `${API_BASE_URL}/resources/download/${resource._id}`,
        method: 'GET',
        responseType: 'blob',
        withCredentials: true
      });
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = resource.originalFileName || 'download';
      link.click();
      setOperationStatus("Download started!");
    } catch (error) {
      console.error('Download error:', error);
      setOperationError(error.response?.data?.message || error.message || 'Failed to download resource');
    }
  };

  const handleResourceAdded = (updatedOrNewResource) => {
    if (editingResource) {
      setResources(resources.map(r => r._id === updatedOrNewResource._id ? updatedOrNewResource : r));
      setOperationStatus("Resource updated successfully!");
    } else {
      setResources([...resources, updatedOrNewResource]);
      setOperationStatus("Resource added successfully!");
    }
  };

  const filteredResources = () => {
    if (!searchTerm.trim()) return resources;
    return resources.filter(resource => 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Status message component
  const StatusMessage = ({ status }) => {
    return (
      <div className="bg-teal-500/20 border border-teal-500/50 rounded-lg p-3 mb-4 text-teal-200 flex items-center justify-between">
        <span>{status}</span>
        <button 
          onClick={() => setOperationStatus(null)} 
          className="text-teal-300 hover:text-white transition-colors duration-200"
        >
          <X size={16} />
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center text-white">
          <div className="w-12 h-12 border-t-4 border-teal-500 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading resources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="bg-gray-800/90 backdrop-blur-md p-4 rounded-lg shadow-lg border border-red-500/50 max-w-md">
          <h3 className="text-lg font-bold text-red-400 mb-2">Error</h3>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg shadow-md transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="bg-gray-800/90 backdrop-blur-md shadow-xl rounded-lg border border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Resources
            </h2>
            <p className="text-gray-400 text-sm mt-1">{filteredResources().length} resources found</p>
          </div>
          <button
            onClick={() => {
              console.log('Add Resource clicked, setting showAddResource to true');
              setShowAddResource(true);
            }}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-3 py-1.5 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 flex items-center text-sm mt-2 sm:mt-0"
          >
            <Plus size={16} className="mr-1" /> Add Resource
          </button>
        </div>

        {operationError && (
          <ErrorMessage 
            message={operationError} 
            onDismiss={() => setOperationError(null)} 
          />
        )}

        {operationStatus && (
          <StatusMessage status={operationStatus} />
        )}

        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
          />
        </div>

        {filteredResources().length === 0 ? (
          <div className="bg-gray-800/80 backdrop-blur-md p-4 rounded-lg border border-gray-700 text-center">
            <Filter size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-lg text-gray-300 mb-1">No resources found</p>
            <p className="text-gray-500 text-sm">
              {searchTerm ? `No resources match "${searchTerm}"` : 'Add a new resource to get started'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded-lg shadow-md transition-all duration-300 text-sm"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources().map((resource) => (
              <div key={resource._id} className="bg-gray-800/80 backdrop-blur-md p-4 rounded-lg border border-gray-700 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start gap-3">
                  <div className="bg-teal-500/20 p-2 rounded-lg">
                    {getIcon(resource.type)}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-white line-clamp-2">{resource.title}</h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-3">{resource.description}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => { 
                      console.log('Editing resource:', resource);
                      setEditingResource(resource); 
                      setShowAddResource(true); 
                    }}
                    className="flex-1 px-3 py-1 bg-gray-700 text-gray-300 rounded-lg shadow-md hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 text-sm"
                  >
                    <Edit size={14} className="inline mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteResource(resource._id)}
                    className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 text-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                  {resource.type === 'link' ? (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 text-sm text-center"
                    >
                      Open
                    </a>
                  ) : (
                    <button
                      onClick={() => handleDownload(resource)}
                      className="flex-1 px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 text-sm"
                    >
                      <Download size={14} className="inline mr-1" /> Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddResource && (
          <AddResource 
            onClose={() => { 
              console.log('Closing AddResource modal');
              setShowAddResource(false); 
              setEditingResource(null); 
            }}
            onResourceAdded={handleResourceAdded}
            resourceToEdit={editingResource}
          />
        )}
      </div>
    </div>
  );
};

export default Resources;