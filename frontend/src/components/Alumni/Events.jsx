import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Users, Edit } from 'lucide-react';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';


const Events = () => {
  const [events, setEvents] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/events', { withCredentials: true });
      const eventsWithSafeData = res.data.map((event) => ({
        ...event,
        registeredStudents: event.registeredStudents || [],
      }));
      setEvents(eventsWithSafeData);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (newEvent) => {
    try {
      const eventToAdd = { ...newEvent, registeredStudents: [] };
      await axios.post('/api/events', eventToAdd, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
      fetchEvents();
      setShowAddEvent(false);
    } catch (error) {
      console.error('Error adding event:', error.response?.data || error.message);
    }
  };

  const handleEditEvent = async (updatedEvent) => {
    try {
      await axios.put(`/api/events/${updatedEvent._id}`, updatedEvent, {
        withCredentials: true,
      });
      fetchEvents();
      setShowEditEvent(false);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await axios.delete(`/api/events/${id}`, { withCredentials: true });
      fetchEvents();
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

  if (loading) {
    return (
      <div className="bg-primary-bg min-h-screen text-text-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="bg-primary-bg min-h-screen text-text-primary">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Admin Events</h2>
        <button
          onClick={() => setShowAddEvent(true)}
          className="mt-2 sm:mt-0 bg-accent hover:bg-green-600 text-text-primary px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
        >
          <Plus size={18} /> Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <div key={event._id} className="bg-secondary-bg p-4 rounded-xl shadow-glass transition-all duration-200 hover:bg-gray-700">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-text-primary">{event.title}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => editEvent(event)}
                  className="text-highlight hover:text-blue-400 transition-all duration-200"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDeleteEvent(event._id)}
                  className="text-error hover:text-red-400 transition-all duration-200"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p className="mt-1 text-text-secondary text-sm">{event.description}</p>
            <div className="mt-2 space-y-1 text-sm text-text-secondary">
              <p><span className="text-gray-400">Mentor:</span> {event.mentor}</p>
              <p><span className="text-gray-400">Time:</span> {event.time}</p>
              <p><span className="text-gray-400">Date:</span> {new Date(event.date).toLocaleDateString()}</p>
              <p><span className="text-gray-400">Venue:</span> {event.venue}</p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">
                <span className="text-gray-400">Registered:</span> {(event.registeredStudents || []).length}
              </p>
              <button
                onClick={() => viewRegistrations(event)}
                className="flex items-center gap-1 text-highlight hover:text-blue-400 transition-all duration-200"
              >
                <Users size={16} /> View
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddEvent && (
        <EventFormModal onClose={() => setShowAddEvent(false)} onSubmit={handleAddEvent} title="Add New Event" buttonText="Add Event" />
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
        <RegistrationsModal eventId={selectedEvent._id} eventTitle={selectedEvent.title} onClose={() => setShowRegistrations(false)} />
      )}
    </div>
  );
};

const EventFormModal = ({ onClose, onSubmit, title, buttonText, eventData = null }) => {
  const [formData, setFormData] = useState(
    eventData || { title: '', description: '', mentor: '', time: '', date: '', venue: '', registeredStudents: [] }
  );

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = () => onSubmit(formData);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-secondary-bg rounded-xl shadow-glass w-full max-w-md text-text-primary">
        <h3 className="text-lg font-bold p-4 border-b border-gray-700">{title}</h3>
        <div className="space-y-3 p-4">
          {[
            { name: 'title', label: 'Event Title', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'mentor', label: 'Mentor', type: 'text' },
            { name: 'time', label: 'Time', type: 'time' },
            { name: 'date', label: 'Date', type: 'date' },
            { name: 'venue', label: 'Venue', type: 'text' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block mb-1 text-text-primary text-sm">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  className="w-full bg-[#2c3e50] text-text-primary p-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-highlight transition-all duration-200"
                  value={formData[field.name]}
                  onChange={handleChange}
                  rows="3"
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  className="w-full bg-[#2c3e50] text-text-primary p-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-highlight transition-all duration-200"
                  value={formData[field.name]}
                  onChange={handleChange}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 p-4 border-t border-gray-700">
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary px-3 py-1 transition-all duration-200">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-highlight hover:bg-blue-500 text-text-primary px-3 py-1 rounded-lg transition-all duration-200"
          >
            {buttonText}
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
  }, [eventId]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/events/${eventId}/registrations`, { withCredentials: true });
      setRegistrations(res.data.students || []);
      setEventDetails(res.data.event || {});
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async (studentId) => {
    try {
      await axios.delete(`/api/events/${eventId}/registrations/${studentId}`, { withCredentials: true });
      fetchRegistrations();
    } catch (error) {
      console.error('Error unregistering student:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-secondary-bg rounded-xl shadow-glass w-full max-w-4xl text-text-primary max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-bold">Registrations: {eventTitle}</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-error transition-all duration-200">✕</button>
        </div>
        <div className="p-4 bg-[#2c3e50] rounded-b-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-text-secondary">
            <div><span className="text-gray-400">Date:</span> {new Date(eventDetails.date).toLocaleDateString() || 'N/A'}</div>
            <div><span className="text-gray-400">Time:</span> {eventDetails.time || 'N/A'}</div>
            <div><span className="text-gray-400">Venue:</span> {eventDetails.venue || 'N/A'}</div>
            <div><span className="text-gray-400">Mentor:</span> {eventDetails.mentor || 'N/A'}</div>
            <div><span className="text-gray-400">Registered:</span> {registrations.length} students</div>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : registrations.length > 0 ? (
          <div className="overflow-x-auto p-4">
            <table className="w-full text-text-primary">
              <thead className="bg-[#2c3e50]">
                <tr>
                  {['Name', 'Reg No.', 'Department', 'Batch', 'Email', 'Phone', 'Actions'].map((header) => (
                    <th key={header} className="p-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {registrations.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-700 transition-all duration-200">
                    <td className="p-2">{student.name || 'N/A'}</td>
                    <td className="p-2">{student.registrationNumber || 'N/A'}</td>
                    <td className="p-2">{student.branch || 'N/A'}</td>
                    <td className="p-2">{student.batch || 'N/A'}</td>
                    <td className="p-2">{student.email || 'N/A'}</td>
                    <td className="p-2">{student.phoneNumber || '-'}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleUnregister(student._id)}
                        className="text-error hover:text-red-400 transition-all duration-200"
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
          <div className="text-center py-4 text-text-secondary">No students registered for this event yet.</div>
        )}
      </div>
    </div>
  );
};

export default Events;