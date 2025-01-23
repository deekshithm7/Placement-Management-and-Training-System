
import React from 'react'
import  { useState } from 'react';
import StudentForm from '../components/StudentForm'
import { CoordinatorForm} from '../components/CoordinatorForm'
import Nabar from '../components/TabNavigator'
import gcek from '../assets/gcek.png'
import {AlumniForm } from '../components/AlumniForm'
import { AdvisorForm } from '../components/AdvisorForm';


const LoginPage = () => {
  
  const [activeRole, setActiveRole] = useState('Student');

  return (
    <div className="flex h-screen">
      <div className="w-2/4 h-auto flex justify-center items-center">
          <img className="w-2/5 h-auto flex justify-center items-center" src={gcek} alt='gcek'/>
      </div>

    <div className="w-3/4 flex flex-col justify-center items-center">
      <div >
        <div className='w-full'>
          <h1 className="text-3xl font-bold text-center mb-4 text-blue-800">
            Sign In To GCEK Placement Portal
          </h1>
        </div>
       <div>
        
 
        <div >
            <Nabar  activeRole={activeRole} setActiveRole={setActiveRole}/>
        </div>
        
        <div className='underline'>
          
        </div>

      </div> 


      </div>
      <div className='p-8 m-4'>
        {activeRole === "Student" && <StudentForm />}
        {activeRole === "Coordinator" && <CoordinatorForm />}
        {activeRole === "Advisor" && <AdvisorForm/>}
        {activeRole === "Alumni" && <AlumniForm/>}
      </div>
    </div>
    </div>
  )
};

export default LoginPage;
