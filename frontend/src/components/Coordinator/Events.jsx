import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Users, Edit, X, Calendar, Clock, MapPin, User, Download } from 'lucide-react';
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEditEvent, setShowEditEvent] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/events', {
        withCredentials: true,
      });
      const eventsWithSafeData = res.data.map((event) => ({
        ...event,
        registeredStudents: event.registeredStudents || [],
      }));
      setEvents(eventsWithSafeData);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleAddEvent = async (newEvent) => {
    try {
      console.log('Event to be sent:', newEvent);
      const eventToAdd = { ...newEvent, registeredStudents: [] };
      const response = await axios.post('/api/events', eventToAdd, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Event added successfully:', response.data);
      await fetchEvents();
      setShowAddEvent(false);
      return { success: true };
    } catch (error) {
      console.error('Error adding event:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create event'
      };
    }
  };

  const handleEditEvent = async (updatedEvent) => {
    try {
      await axios.put(`/api/events/${updatedEvent._id}`, updatedEvent, {
        withCredentials: true,
      });
      await fetchEvents();
      setShowEditEvent(false);
      return { success: true };
    } catch (error) {
      console.error('Error updating event:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update event'
      };
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await axios.delete(`/api/events/${id}`, {
        withCredentials: true,
      });
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const viewRegistrations = (event) => {
    setSelectedEvent(event);
    setShowRegistrations(true);
  };

  const editEvent = (event) => {
    setSelectedEvent(event);
    setShowEditEvent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="bg-gray-800/90 backdrop-blur-md shadow-xl rounded-lg border border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <h2 className="text-2xl font-extrabold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Admin Events
          </h2>
          <button
            onClick={() => setShowAddEvent(true)}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-3 py-1.5 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 flex items-center"
          >
            <Plus size={16} className="mr-1" /> Add Event
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-gray-800/80 backdrop-blur-md p-4 rounded-lg border border-gray-700 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-white">{event.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => editEvent(event)}
                    className="text-yellow-500 hover:text-yellow-600 p-1 rounded-full hover:bg-gray-700 transition-colors duration-200"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-gray-700 transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-gray-400 text-sm">{event.description}</p>
              <div className="mt-3 space-y-1 text-sm text-gray-300">
                <p><span className="text-gray-500">Mentor:</span> {event.mentor}</p>
                <p><span className="text-gray-500">Time:</span> {event.time}</p>
                <p><span className="text-gray-500">Date:</span> {new Date(event.date).toLocaleDateString()}</p>
                <p><span className="text-gray-500">Venue:</span> {event.venue}</p>
                <p><span className="text-gray-500">Max Participants:</span> {event.maxParticipants || 'Unlimited'}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-300">
                  <span className="text-gray-500">Registered:</span> {(event.registeredStudents || []).length}
                  {event.maxParticipants && <span className="text-gray-500"> / {event.maxParticipants}</span>}
                </p>
                <button
                  onClick={() => viewRegistrations(event)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                >
                  <Users size={14} /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Modal Portals - moved outside the main container */}
      {showAddEvent && (
        <EventFormModal
          onClose={() => setShowAddEvent(false)}
          onSubmit={handleAddEvent}
          title="Add New Event"
          buttonText="Add Event"
        />
      )}
      {showEditEvent && (
        <EventFormModal
          onClose={() => setShowEditEvent(false)}
          onSubmit={handleEditEvent}
          title="Edit Event"
          buttonText="Update Event"
          eventData={selectedEvent}
        />
      )}
      {showRegistrations && (
        <RegistrationsModal
          eventId={selectedEvent._id}
          eventTitle={selectedEvent.title}
          onClose={() => setShowRegistrations(false)}
        />
      )}
    </div>
  );
};

const EventFormModal = ({ onClose, onSubmit, title, buttonText, eventData = null }) => {
  const [formData, setFormData] = useState(() => {
    if (eventData) {
      // Format the date properly for the date input
      const formattedDate = eventData.date ? new Date(eventData.date).toISOString().split('T')[0] : '';
      return {
        ...eventData,
        date: formattedDate
      };
    }
    return {
      title: '',
      description: '',
      mentor: '',
      time: '',
      date: '',
      venue: '',
      maxParticipants: 100,
      registeredStudents: [],
    };
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const value =
      e.target.name === 'maxParticipants' ? parseInt(e.target.value) || '' : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    
    // Clear error when user makes changes
    if (error) setError('');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    
    const result = await onSubmit(formData);
    
    setIsSubmitting(false);
    
    if (!result.success) {
      setError(result.error);
    }
  };

  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-xl p-3 w-full max-w-md shadow-2xl border border-gray-800">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-extrabold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors duration-200"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Error message display */}
        {error && (
          <div className="mb-3 p-2 bg-red-900/60 border border-red-700 rounded-lg text-red-200 text-sm">
            <p className="flex items-center">
              <X size={14} className="mr-1.5" />
              {error}
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <div>
            <label className="block text-gray-300 font-medium text-xs mb-1">Event Title</label>
            <input
              type="text"
              name="title"
              className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
            />
          </div>
          <div>
            <label className="block text-gray-300 font-medium text-xs mb-1">Description</label>
            <textarea
              name="description"
              className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 resize-none h-16"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter event description"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-300 font-medium text-xs mb-1">Mentor</label>
              <div className="relative">
                <User size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="mentor"
                  className="w-full pl-8 pr-2 py-1 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                  value={formData.mentor}
                  onChange={handleChange}
                  placeholder="Mentor name"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 font-medium text-xs mb-1">Max Participants</label>
              <input
                type="number"
                name="maxParticipants"
                className="w-full px-2 py-1 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                value={formData.maxParticipants}
                onChange={handleChange}
                placeholder="100"
                min="1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-300 font-medium text-xs mb-1">Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="date"
                  className="w-full pl-8 pr-2 py-1 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 font-medium text-xs mb-1">Time</label>
              <div className="relative">
                <Clock size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="time"
                  name="time"
                  className="w-full pl-8 pr-2 py-1 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                  value={formData.time}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-gray-300 font-medium text-xs mb-1">Venue</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="venue"
                className="w-full pl-8 pr-2 py-1 bg-gray-800/80 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                value={formData.venue}
                onChange={handleChange}
                placeholder="Enter venue"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg shadow-md hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 text-sm flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </>
            ) : buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

const RegistrationsModal = ({ eventId, eventTitle, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [eventDetails, setEventDetails] = useState({});

  useEffect(() => {
    fetchRegistrations();
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [eventId]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/events/${eventId}/registrations`, {
        withCredentials: true,
      });
      console.log("API Response:", res.data);
      setRegistrations(res.data.students || []);
      setEventDetails(res.data.event || {});
      setLoading(false);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setLoading(false);
    }
  };

  const handleUnregister = async (studentId) => {
    try {
      await axios.delete(`/api/events/${eventId}/registrations/${studentId}`, {
        withCredentials: true,
      });
      await fetchRegistrations();
    } catch (error) {
      console.error('Error unregistering student:', error);
    }
  };

  // Function to convert registrations data to CSV format
  const convertToCSV = () => {
    if (registrations.length === 0) return '';
    // Define CSV headers based on student data structure
    const headers = ['Name', 'Registration No.', 'Department', 'Batch', 'Email', 'Phone'];
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    // Add data rows
    registrations.forEach(student => {
      const row = [
        student.name || 'N/A',
        student.registrationNumber || 'N/A',
        student.branch || 'N/A',
        student.batch || 'N/A',
        student.email || 'N/A',
        student.phoneNumber || '-'
      ].map(value => `"${value}"`).join(',');
      csvContent += row + '\n';
    });
    return csvContent;
  };

  // Function to handle the download
  const handleDownloadCSV = () => {
    const csvContent = convertToCSV();
    if (!csvContent) {
      alert('No data to download');
      return;
    }
    // Create a blob from the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    // Create a download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    // Set link properties
    link.setAttribute('href', url);
    link.setAttribute('download', `${eventTitle.replace(/\s+/g, '_')}_registrations.csv`);
    link.style.visibility = 'hidden';
    // Append to document, trigger download and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 mt-16">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-xl p-4 w-full max-w-4xl shadow-2xl border border-gray-800 max-h-[90vh] flex flex-col">
        {/* Fixed section: Title and Event Details */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-extrabold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Registrations: {eventTitle}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors duration-200"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mb-4 bg-gray-800/80 p-3 rounded-lg border border-gray-700 text-sm text-gray-300">
          <div className="grid grid-cols-2 gap-2">
            <p><span className="text-gray-500">Date:</span> {new Date(eventDetails.date).toLocaleDateString() || 'N/A'}</p>
            <p><span className="text-gray-500">Time:</span> {eventDetails.time || 'N/A'}</p>
            <p><span className="text-gray-500">Venue:</span> {eventDetails.venue || 'N/A'}</p>
            <p><span className="text-gray-500">Mentor:</span> {eventDetails.mentor || 'N/A'}</p>
            <p><span className="text-gray-500">Registered:</span> {registrations.length} students</p>
            <p><span className="text-gray-500">Max Participants:</span> {eventDetails.maxParticipants || 'Unlimited'}</p>
          </div>
        </div>
        {/* Action buttons - Added Download button */}
        <div className="mb-3 flex justify-end">
          <button
            onClick={handleDownloadCSV}
            disabled={registrations.length === 0 || loading}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 text-sm
              ${registrations.length === 0 || loading
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'}`}
          >
            <Download size={14} /> Download CSV
          </button>
        </div>
        {/* Scrollable section: Table or messages */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-6 text-gray-400 animate-pulse">Loading...</div>
          ) : registrations.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="w-full text-left">
                <thead className="bg-gradient-to-r from-gray-700 to-gray-600 text-white sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-sm font-semibold">Name</th>
                    <th className="p-3 text-sm font-semibold">Registration No.</th>
                    <th className="p-3 text-sm font-semibold">Department</th>
                    <th className="p-3 text-sm font-semibold">Batch</th>
                    <th className="p-3 text-sm font-semibold">Email</th>
                    <th className="p-3 text-sm font-semibold">Phone</th>
                    <th className="p-3 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {registrations.map((student, index) => (
                    <tr
                      key={student._id}
                      className={`${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'} hover:bg-gray-700 transition-colors duration-150`}
                    >
                      <td className="p-3 text-gray-200 text-sm">{student.name || 'N/A'}</td>
                      <td className="p-3 text-gray-200 text-sm">{student.registrationNumber || 'N/A'}</td>
                      <td className="p-3 text-gray-200 text-sm">{student.branch || 'N/A'}</td>
                      <td className="p-3 text-gray-200 text-sm">{student.batch || 'N/A'}</td>
                      <td className="p-3 text-gray-200 text-sm">{student.email || 'N/A'}</td>
                      <td className="p-3 text-gray-200 text-sm">{student.phoneNumber || '-'}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleUnregister(student._id)}
                          className="text-red-400 hover:text-red-300 text-sm transition-colors duration-200"
                        >
                          Unregister
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              No students registered for this event yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;