import React, { useState } from 'react';

const CreateStudentAccount = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [reEnterPassword, setReEnterPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== reEnterPassword) {
      alert("Passwords do not match!");
    } else {
      console.log({ name, password });
      // Replace with backend integration
    }
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center">
      <form className="bg-white p-8 rounded shadow-md " onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">
          Create Student Account
        </h2>

        {/* Name Field */}
        <div className="mb-6">
          <input
            className="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="border-b border-gray-300 mb-6"></div>
        </div>

        {/* Password Field */}
        <div className="mb-6">
          <input
            className="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="border-b border-gray-300 mb-6"></div>
        </div>

        {/* Re-enter Password Field */}
        <div className="mb-6">
          <input
            className="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            type="password"
            placeholder="Re-enter your password"
            value={reEnterPassword}
            onChange={(e) => setReEnterPassword(e.target.value)}
          />
          <div className="border-b border-gray-300 mb-6"></div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CreateStudentAccount;