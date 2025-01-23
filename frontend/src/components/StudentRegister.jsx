import React, { useState } from "react";

//edit the otp verifying parts

const StudentRegister = () => {
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  //to send otp
  const handleSendOtp = (e) => {
    e.preventDefault();
    setOtpSent(true);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000); // Hide popup after 3 seconds
    // Simulate backend OTP sending logic
    console.log("OTP sent to", `${admissionNumber}@gcek.ac.in`);
  };

  //handling otp
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp === "123456") { // Example OTP
      setOtpVerified(true);
      console.log("OTP verified successfully");
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">
          Student Registration
        </h1>
        
        {!otpSent ? (
          <form onSubmit={handleSendOtp}>
            <div className="mb-4">
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                type="text"
                placeholder="Enter Admission Number"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Send OTP
            </button>
          </form>
        ) : !otpVerified ? (
          <>
            <form onSubmit={handleVerifyOtp}>
              <div className="mt-4 mb-4">
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Verify OTP
              </button>
            </form>
            {showPopup && (
              <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white border border-blue-600 shadow-lg rounded px-6 py-4">
                <p className="text-blue-800 font-medium">
                  An OTP has been sent to{" "}
                  <span className="font-bold">
                    {admissionNumber}@gcek.ac.in
                  </span> for registration.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="mt-4 text-center">
            <p className="text-green-600 font-medium">OTP Verified Successfully!</p>
            <button
              onClick={() => alert("Proceed to complete registration")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
            >
              Submit Registration
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRegister;