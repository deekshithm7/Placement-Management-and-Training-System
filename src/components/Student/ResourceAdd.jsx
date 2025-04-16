import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Video, Link as LinkIcon, Download, Play } from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const getIcon = (type) => {
  switch (type) {
    case 'document': return <FileText className="w-6 h-6 text-highlight" />;
    case 'video': return <Play className="w-6 h-6 text-accent" />;
    case 'link': return <LinkIcon className="w-6 h-6 text-purple-400" />;
    default: return <FileText className="w-6 h-6 text-text-secondary" />;
  }
};

const ResourceAdd = () => {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/resources`, { withCredentials: true });
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

  const handleResourceAction = async (resource) => {
    try {
      if (resource.type === 'link') {
        window.open(resource.url, '_blank', 'noopener,noreferrer');
      } else {
        const response = await axios({
          url: `${API_BASE_URL}/api/resources/download/${resource._id}`,
          method: 'GET',
          responseType: 'blob',
          withCredentials: true
        })
        const blob = new Blob([response.data]);
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = resource.originalFileName || 'download';
        link.click();
      }
    } catch (error) {
      console.error('Resource action error:', error);
      alert('Failed to process resource');
    }
  };

  if (isLoading) return (
    <div className="p-4 sm:p-6 min-h-screen bg-primary-bg flex items-center justify-center font-sans">
      <div className="text-text-secondary animate-pulse">Loading resources...</div>
    </div>
  );

  if (error) return (
    <div className="p-4 sm:p-6 min-h-screen bg-primary-bg flex items-center justify-center font-sans">
      <div className="text-error">{error}</div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-primary-bg font-sans">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6 animate-fade-in">Learning Resources</h1>
      {resources.length === 0 ? (
        <div className="text-center text-text-secondary py-12">No resources available at the moment.</div>
      ) : (
        <div className="max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <div 
              key={resource._id} 
              className="bg-secondary-bg rounded-xl p-6 flex flex-col transition-all duration-300 shadow-glass hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-2">
                {getIcon(resource.type)}
                <h3 className="text-lg font-semibold text-text-primary">{resource.title}</h3>
              </div>
              <p className="text-text-secondary text-sm mb-4 flex-grow line-clamp-2">{resource.description}</p>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-xs text-text-secondary">
                  {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                </span>
                <button 
                  onClick={() => handleResourceAction(resource)}
                  className="bg-gradient-to-r from-highlight to-accent hover:from-accent hover:to-highlight text-text-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-300 hover:scale-105"
                >
                  {resource.type === 'link' ? (
                    <> <LinkIcon className="w-4 h-4" /> Open </>
                  ) : (
                    <> <Download className="w-4 h-4" /> Download </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceAdd;