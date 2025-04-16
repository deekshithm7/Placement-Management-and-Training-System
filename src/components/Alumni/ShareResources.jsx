import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, FileText, Video, Link as LinkIcon, Download, X, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api` 
  : 'http://localhost:8080/api';
  
const getIcon = (type) => {
  switch (type) {
    case 'document':
      return <FileText size={20} className="text-accent" />;
    case 'video':
      return <Video size={20} className="text-accent" />;
    case 'link':
      return <LinkIcon size={20} className="text-highlight" />;
    default:
      return <FileText size={20} />;
  }
};

export const AddResource = ({ onClose, onResourceAdded, resourceToEdit }) => {
  const [resourceData, setResourceData] = useState(
    resourceToEdit
      ? { title: resourceToEdit.title, description: resourceToEdit.description, type: resourceToEdit.type, url: resourceToEdit.url || '', file: null }
      : { title: '', description: '', type: 'document', file: null, url: '' }
  );
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!resourceData.title.trim()) newErrors.title = 'Title is required';
    if (!resourceData.description.trim()) newErrors.description = 'Description is required';
    if (resourceData.type === 'link' && !resourceData.url.trim()) newErrors.url = 'URL is required';
    else if (resourceData.type === 'link' && !/^https?:\/\/.+/.test(resourceData.url)) newErrors.url = 'Enter a valid URL';
    else if (resourceData.type !== 'link' && !resourceData.file && !resourceToEdit) newErrors.file = 'File is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', resourceData.title);
    formData.append('description', resourceData.description);
    formData.append('type', resourceData.type);
    if (resourceData.type === 'link') formData.append('url', resourceData.url);
    else if (resourceData.file) formData.append('file', resourceData.file);

    try {
      const response = resourceToEdit
        ? await axios.put(`${API_BASE_URL}/resources/${resourceToEdit._id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
          })
        : await axios.post(`${API_BASE_URL}/resources`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
          });
      onResourceAdded(response.data.resource || response.data);
      setStatus('Resource saved successfully!');
      setTimeout(() => {
        setStatus('');
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving resource:', error);
      setErrors({ submit: 'Failed to save resource. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setResourceData({ ...resourceData, file });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-secondary-bg rounded-xl shadow-glass w-full max-w-md text-text-primary">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-bold">{resourceToEdit ? 'Edit Resource' : 'Add Resource'}</h3>
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
          <div>
            <label className="block text-text-primary mb-1 text-sm font-medium">Resource Type</label>
            <select
              value={resourceData.type}
              onChange={(e) => setResourceData({ ...resourceData, type: e.target.value, file: null, url: '' })}
              className="w-full bg-[#2c3e50] text-text-primary p-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-highlight transition-all duration-200"
            >
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
            </select>
          </div>
          <div>
            <label className="block text-text-primary mb-1 text-sm font-medium">Title</label>
            <input
              type="text"
              value={resourceData.title}
              onChange={(e) => setResourceData({ ...resourceData, title: e.target.value })}
              className={`w-full bg-[#2c3e50] text-text-primary p-2 rounded-lg border ${
                errors.title ? 'border-error' : 'border-gray-700'
              } focus:outline-none focus:ring-2 focus:ring-highlight transition-all duration-200`}
              placeholder="Enter resource title"
              required
            />
            {errors.title && <p className="text-error text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-text-primary mb-1 text-sm font-medium">Description</label>
            <textarea
              value={resourceData.description}
              onChange={(e) => setResourceData({ ...resourceData, description: e.target.value })}
              className={`w-full bg-[#2c3e50] text-text-primary p-2 rounded-lg border ${
                errors.description ? 'border-error' : 'border-gray-700'
              } focus:outline-none focus:ring-2 focus:ring-highlight transition-all duration-200`}
              placeholder="Enter resource description"
              rows="3"
              required
            />
            {errors.description && <p className="text-error text-xs mt-1">{errors.description}</p>}
          </div>
          {resourceData.type === 'link' && (
            <div>
              <label className="block text-text-primary mb-1 text-sm font-medium">URL</label>
              <input
                type="url"
                value={resourceData.url}
                onChange={(e) => setResourceData({ ...resourceData, url: e.target.value })}
                className={`w-full bg-[#2c3e50] text-text-primary p-2 rounded-lg border ${
                  errors.url ? 'border-error' : 'border-gray-700'
                } focus:outline-none focus:ring-2 focus:ring-highlight transition-all duration-200`}
                placeholder="https://example.com/resource"
                required
              />
              {errors.url && <p className="text-error text-xs mt-1">{errors.url}</p>}
            </div>
          )}
          {resourceData.type !== 'link' && (
            <div>
              <label className="block text-text-primary mb-1 text-sm font-medium">File</label>
              <input
                type="file"
                onChange={handleFileChange}
                className={`w-full bg-[#2c3e50] text-text-primary p-2 rounded-lg border ${
                  errors.file ? 'border-error' : 'border-gray-700'
                } focus:outline-none focus:ring-2 focus:ring-highlight transition-all duration-200`}
                accept={resourceData.type === 'video' ? 'video/*' : '*'}
                required={!resourceToEdit}
              />
              {errors.file && <p className="text-error text-xs mt-1">{errors.file}</p>}
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full p-2 rounded-lg text-text-primary transition-all duration-200 ${
              isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-highlight hover:bg-blue-500 hover:shadow-lg'
            }`}
          >
            {isSubmitting ? 'Saving...' : resourceToEdit ? 'Update Resource' : 'Add Resource'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const ShareResources = () => {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddResource, setShowAddResource] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

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
        setError(err.message || 'Failed to fetch resources');
        setResources([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, []);

  const handleDeleteResource = async (resourceId) => {
    try {
      await axios.delete(`${API_BASE_URL}/resources/${resourceId}`, { withCredentials: true });
      setResources(resources.filter((r) => r._id !== resourceId));
    } catch (error) {
      console.error('Error deleting resource:', error);
      setError('Failed to delete resource');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDownload = async (resource) => {
    try {
      const response = await axios({
        url: `${API_BASE_URL}/resources/download/${resource._id}`,
        method: 'GET',
        responseType: 'blob',
        withCredentials: true,
      });
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = resource.originalFileName || 'download';
      link.click();
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download resource');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleResourceAdded = (updatedOrNewResource) => {
    if (editingResource) {
      setResources(resources.map((r) => (r._id === updatedOrNewResource._id ? updatedOrNewResource : r)));
    } else {
      setResources([...resources, updatedOrNewResource]);
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
        <h2 className="text-xl md:text-2xl font-bold">Resources</h2>
        <button
          onClick={() => setShowAddResource(true)}
          className="mt-2 sm:mt-0 bg-accent hover:bg-green-600 text-text-primary px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
        >
          <Plus size={18} /> Add Resource
        </button>
      </div>
      {error && (
        <div className="bg-error bg-opacity-20 text-error p-2 mb-4 rounded-lg flex items-center">
          <AlertCircle size={18} className="mr-2" /> {error}
        </div>
      )}
      {resources.length === 0 ? (
        <div className="text-text-secondary text-center">No resources found. Add a new resource to get started.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <div
              key={resource._id}
              className="bg-secondary-bg p-4 rounded-xl shadow-glass flex flex-col transition-all duration-200 hover:bg-gray-700"
            >
              <div className="flex justify-between items-start mb-2">
                {getIcon(resource.type)}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingResource(resource);
                      setShowAddResource(true);
                    }}
                    className="text-highlight hover:text-blue-400"
                  >
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDeleteResource(resource._id)} className="text-error hover:text-red-400">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="text-md font-semibold text-text-primary mb-1">{resource.title}</h3>
              <p className="text-text-secondary text-sm mb-2 flex-grow">{resource.description}</p>
              {resource.type === 'link' ? (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-highlight hover:text-blue-400 text-sm transition-all duration-200"
                >
                  Open Link
                </a>
              ) : (
                <button
                  onClick={() => handleDownload(resource)}
                  className="w-full bg-accent hover:bg-green-600 text-text-primary p-2 rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  <Download size={16} className="mr-1" /> Download
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {showAddResource && (
        <AddResource
          onClose={() => {
            setShowAddResource(false);
            setEditingResource(null);
          }}
          onResourceAdded={handleResourceAdded}
          resourceToEdit={editingResource}
        />
      )}
    </div>
  );
};

export default ShareResources;