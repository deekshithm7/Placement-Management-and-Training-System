import React, { useState } from "react";

const AlumniRegister = () => {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [email, setEmail] = useState("");
  const [showPopup, setShowPopup] = useState(false);

   //backend change here
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 4000); // Popup auto-hide after 4 seconds
    console.log("Alumni data sent:", { name, year, branch, email });
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">
          Alumni Registration
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              type="text"
              placeholder="Enter Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              type="text"
              placeholder="Enter Branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit
          </button>
        </form>
        {showPopup && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white border border-blue-600 shadow-lg rounded px-6 py-4">
            <p className="text-blue-800 font-medium">
              Your information has been sent to the admin for verification.
              An email will be sent to <span className="font-bold">{email}</span>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniRegister;