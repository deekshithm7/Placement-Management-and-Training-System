import React from 'react';
import { X } from 'lucide-react';

const RegisterEvent = ({ event, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 font-sans">
      <div className="bg-secondary-bg rounded-xl p-6 w-full max-w-md relative shadow-glass animate-fade-in">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-all duration-300"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-text-primary">{event.title}</h2>
        <p className="text-text-secondary mb-4">{event.description}</p>
        <div className="mb-4 text-text-secondary">
          <p>Date: {event.date}</p>
          <p>Time: {event.time}</p>
        </div>
        <form className="space-y-4">
          <input 
            type="text" 
            required
            placeholder="Your Name" 
            className="w-full p-3 bg-primary-bg border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-highlight"
          />
          <input 
            type="email" 
            required
            placeholder="Your Email" 
            className="w-full p-3 bg-primary-bg border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-highlight"
          />
          <input 
            type="number" 
            required
            placeholder="Admission No" 
            className="w-full p-3 bg-primary-bg border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-highlight"
          />
          <select className="w-full p-3 bg-primary-bg border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-highlight">
            <option value="" className="text-text-secondary">Branch</option>
            <option value="1">CSE</option>
            <option value="2">CE</option>
            <option value="3">ME</option>
            <option value="4">EC</option>
          </select>
          <select className="w-full p-3 bg-primary-bg border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-highlight">
            <option value="" className="text-text-secondary">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-highlight to-accent hover:from-accent hover:to-highlight text-text-primary py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
          >
            Confirm Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterEvent;