import React from 'react'
import { useState } from 'react';
import {Link} from 'react-router-dom';

export const CoordinatorForm = () => {

   const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
     
    const handleSubmit = (e) => {
      e.preventDefault();
      console.log({ email, password }); // Replace this with backend API integration
    };
  
    return (
      <div className="flex ">
  
      <div className=" flex flex-col justify-center items-center">
        <form className=" bg-white  p-8 rounded" onSubmit={handleSubmit}>
          <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">
            Coordinator Login
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

  
        </form>
      </div>
    </div>
    )
  };