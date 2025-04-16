import React, { useState } from 'react';
import TabNavigator from '../components/TabNavigator';
import gcek from '../assets/gcek-transparent.png';
import bgPattern from '../assets/bg-pattern.jpg';
import { StudentForm } from '../components/StudentForm';
import { AlumniForm } from '../components/AlumniForm';
import { CoordinatorForm } from '../components/CoordinatorForm';
import { AdvisorForm } from '../components/AdvisorForm';

// Object mapping for forms to avoid conditional rendering in JSX
const ROLE_FORMS = {
  Student: StudentForm,
  Alumni: AlumniForm,
  Coordinator: CoordinatorForm,
  Advisor: AdvisorForm,
};

const ROLES = Object.keys(ROLE_FORMS);

const LoginPage = () => {
  const [activeRole, setActiveRole] = useState('Student');
  const [error, setError] = useState('');

  const handleGoogleLogin = () => {
    console.log('[FRONTEND] Initiating Google login');
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    window.location.href = `${apiBaseUrl}/auth/google`;
  };

  // Dynamically render the active form component
  const ActiveForm = ROLE_FORMS[activeRole];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Brand/Logo Area */}
      <div
        className="lg:w-1/3 md:w-2/5 flex flex-col justify-center items-center p-4 md:p-8 bg-blue-900 text-white relative"
        style={{ 
          backgroundImage: `url(${bgPattern})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundColor: '#1E3A8A' 
        }}
      >
        <img
          className="w-3/4 max-w-xs h-auto mb-6 drop-shadow-md invert"
          src={gcek}
          alt="GCEK Logo"
        />
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">
          One stop portal for students to simplify placements.
        </h2>
        <p className="text-xs md:text-sm text-center">Login using your institute email ID.</p>
      </div>
      
      {/* Right Section - Login Form */}
      <div className="lg:w-2/3 md:w-3/5 flex flex-col justify-center items-center p-4 md:p-8 bg-white">
        <h1 className="text-lg md:text-xl font-semibold text-blue-600 mb-4 md:mb-6 text-center">
          Sign In to GCEK Placement Portal
        </h1>
        
        <TabNavigator 
          activeRole={activeRole} 
          setActiveRole={setActiveRole} 
          roles={ROLES} 
        />
        
        {error && (
          <div className="w-full max-w-md mt-4 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-500 text-center text-sm">{error}</p>
          </div>
        )}
        
        <div className="w-full max-w-md mt-4 md:mt-6">
          <ActiveForm onGoogleLogin={handleGoogleLogin} setError={setError} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;