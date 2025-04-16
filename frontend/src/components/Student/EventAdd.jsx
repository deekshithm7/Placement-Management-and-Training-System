import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, MapPin, User, UserCheck, Info } from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const EventAdd = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState({});

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/auth/me`, { withCredentials: true });
        if (res.data?.user) setCurrentUser(res.data.user);
        else console.error('No user data returned from API:', res.data);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) fetchEvents();
  }, [currentUser]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/events`, { withCredentials: true });
      const eventsWithSafeData = res.data.map(event => ({ ...event, registeredStudents: event.registeredStudents || [] }));
      setEvents(eventsWithSafeData);
      const status = {};
      eventsWithSafeData.forEach(event => {
        status[event._id] = event.registeredStudents.some(studentId => studentId.toString() === currentUser._id.toString());
      });
      setRegistrationStatus(status);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    if (!currentUser || !currentUser._id || registrationStatus[eventId]) return;
    try {
      setLoading(true);
      const res = await axios.put(
        `${API_BASE_URL}/api/events/register/${eventId}`,
        { studentId: currentUser._id },
        { withCredentials: true }
      );
      setRegistrationStatus(prev => ({ ...prev, [eventId]: true }));
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event._id === eventId ? { ...event, registeredStudents: res.data.event.registeredStudents } : event
        )
      );
      setLoading(false);
    } catch (error) {
      console.error('Error registering for event:', error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  const viewEventDetails = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const isRegistered = (event) => registrationStatus[event._id] || false;

  if (loading && events.length === 0) return (
    <div className="min-h-screen bg-primary-bg p-4 sm:p-6 text-text-primary flex items-center justify-center font-sans">
      <div className="text-xl animate-pulse">Loading events...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary-bg p-4 sm:p-6 text-text-primary font-sans">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 animate-fade-in">Upcoming Events</h1>

      {events.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-xl">No upcoming events available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <div
              key={event._id}
              className="bg-secondary-bg rounded-xl p-6 shadow-glass border border-white/10 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-highlight" />
                  <h3 className="text-xl font-semibold">{event.title}</h3>
                </div>
                <button onClick={() => viewEventDetails(event)} className="text-text-secondary hover:text-text-primary">
                  <Info size={18} />
                </button>
              </div>
              <p className="text-text-secondary text-sm mb-6 line-clamp-2">{event.description}</p>
              <div className="space-y-2 mb-6 text-sm text-text-secondary">
                <div className="flex items-center gap-2"><User className="w-4 h-4" /> Mentor: {event.mentor}</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {event.time}</div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(event.date).toLocaleDateString()}</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.venue}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-text-secondary">
                  <UserCheck className="w-4 h-4 text-accent" />
                  <span>{event.registeredStudents.length} registered</span>
                </div>
                <button
                  onClick={() => handleRegister(event._id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isRegistered(event)
                      ? 'bg-accent/20 text-accent cursor-not-allowed'
                      : 'bg-gradient-to-r from-highlight to-accent hover:from-accent hover:to-highlight text-text-primary hover:scale-105'
                  }`}
                  disabled={isRegistered(event)}
                >
                  {isRegistered(event) ? 'Registered' : 'Register'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEventDetails && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          isRegistered={isRegistered(selectedEvent)}
          onRegister={() => handleRegister(selectedEvent._id)}
          onClose={() => setShowEventDetails(false)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

const EventDetailsModal = ({ event, isRegistered, onRegister, onClose, currentUser }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans mt-16">
      <div className="bg-secondary-bg p-6 rounded-xl w-full max-w-lg text-text-primary max-h-[90vh] overflow-y-auto shadow-glass animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">{event.title}</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">✕</button>
        </div>
        <div className="space-y-4 mb-6">
          <div className="bg-primary-bg p-4 rounded-lg">
            <h4 className="text-sm text-text-secondary mb-2">Description</h4>
            <p>{event.description}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { Icon: User, label: 'Mentor', value: event.mentor },
              { Icon: Clock, label: 'Time', value: event.time },
              { Icon: Calendar, label: 'Date', value: new Date(event.date).toLocaleDateString() },
              { Icon: MapPin, label: 'Venue', value: event.venue }
            ].map(({ Icon, label, value }, idx) => (
              <div key={idx} className="bg-primary-bg p-4 rounded-lg">
                <h4 className="text-sm text-text-secondary mb-2">{label}</h4>
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-highlight" />
                  <span>{value}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-primary-bg p-4 rounded-lg">
            <h4 className="text-sm text-text-secondary mb-2">Registered Students</h4>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-accent" />
              <span>{event.registeredStudents.length} students registered</span>
            </div>
          </div>
          {isRegistered && currentUser && (
            <div className="bg-primary-bg p-4 rounded-lg">
              <h4 className="text-sm text-text-secondary mb-2">Your Registration Details</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-text-secondary">Name:</span> {currentUser.name}</p>
                <p><span className="text-text-secondary">Email:</span> {currentUser.email}</p>
                <p><span className="text-text-secondary">Registration Number:</span> {currentUser.regNumber || currentUser.registrationNumber || 'Not available'}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onRegister}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              isRegistered
                ? 'bg-accent/20 text-accent cursor-not-allowed'
                : 'bg-gradient-to-r from-highlight to-accent hover:from-accent hover:to-highlight text-text-primary hover:scale-105'
            }`}
            disabled={isRegistered}
          >
            {isRegistered ? 'Already Registered' : 'Register for Event'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventAdd;