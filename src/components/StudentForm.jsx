import React from 'react'
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

 const StudentForm = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate()
   
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password }); // Replace this with backend API integration
    navigate("/Student")
  };

  return (
    <div className="flex ">

    <div className=" flex flex-col justify-center items-center">
      <form className=" bg-white  p-8 rounded" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">
          Student  Login
        </h1>
        <div className="mb-4">
   
          <input
            className="w-full px-4 py-2  focus:outline-none focus:ring-2 focus:ring-blue-600 "
            type="email"
            id="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="border-b border-gray-300 mb-6"></div>
        </div>
        <div className="mb-6">
          <input
            className="w-full px-4 py-2  focus:outline-none focus:ring-2 focus:ring-blue-600"
            type="password"
            id="password"
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="border-b border-gray-300 mb-6"></div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Login
        </button>
        <div className='text-blue-600 hover:text-blue-800 text-sm  mt-4 flex justify-center'>
         <Link className='text-blue-600 hover:text-blue-800 text-sm  mt-4 flex justify-center'
              to='/ForgotPassword'
              >Forgot password?
          </Link>
        </div>
        <div className='mt-8 flex justify-center items-center'>
        <p className='font-medium text-base'>Don't have an account?</p>
            <Link
              to="/StudentRegister"
              className='ml-2 font-medium text-base text-blue-800'>
             Register Now
            </Link>
        </div>

      </form>
    </div>
  </div>
  )
};


export default StudentForm;









