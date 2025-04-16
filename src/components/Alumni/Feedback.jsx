import React, { useState } from 'react';

const Feedback = () => {
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Feedback:', feedback);
    setStatus('Feedback submitted successfully!');
    setFeedback('');
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="p-4 bg-primary-bg min-h-screen text-text-primary">
      <div className="max-w-xl mx-auto bg-secondary-bg rounded-xl shadow-glass">
        <h1 className="text-xl font-semibold p-4 border-b border-gray-700">Feedback</h1>
        {status && <div className="text-accent bg-accent bg-opacity-20 p-3 rounded-lg m-4">{status}</div>}
        <form onSubmit={handleSubmit} className="space-y-3 p-4">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Your thoughts..."
            className="w-full p-2 bg-[#2c3e50] text-text-primary rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-highlight transition-all duration-200"
            rows="4"
            required
          />
          <button
            type="submit"
            className="w-full bg-highlight hover:bg-blue-500 text-text-primary p-2 rounded-lg transition-all duration-200 hover:shadow-lg"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;