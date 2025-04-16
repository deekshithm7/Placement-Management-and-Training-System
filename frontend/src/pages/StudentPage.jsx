import React, { useState } from 'react';
import { 
  Home, 
  GraduationCap, 
  BookOpen, 
  BarChart3, 
  Calendar, 
  Briefcase, 
  BrainCircuit 
} from 'lucide-react';
import Exam from '../components/Student/ExamCorner';
import ResourceAdd from '../components/Student/ResourceAdd';
import EventAdd from '../components/Student/EventAdd';
import JobOpportunities from '../components/Student/JobOpportunities';
import  Analytics  from '../components/Student/Analytics';
import PlacementDrive from '../components/Student/PlacementDrive';
import HomePage from './HomePage';

const StudentPage = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [tooltipItem, setTooltipItem] = useState(null);

  const navItems = [
    {
      id: 'Home',
      icon: Home,
      label: 'Home',
      color: 'text-emerald-500',
      labelColor: 'text-emerald-400'
    },
    {
      id: 'placement',
      icon: GraduationCap,
      label: 'Placement Drive',
      color: 'text-blue-500',
      labelColor: 'text-blue-400'
    },
    {
      id: 'resources',
      icon: BookOpen,
      label: 'Resources',
      color: 'text-purple-500',
      labelColor: 'text-purple-400'
    },
    {
      id: 'analytics',
      icon: BarChart3,
      label: 'Analytics',
      color: 'text-yellow-500',
      labelColor: 'text-yellow-400'
    },
    {
      id: 'events',
      icon: Calendar,
      label: 'Events',
      color: 'text-pink-500',
      labelColor: 'text-pink-400'
    },
    {
      id: 'jobs',
      icon: Briefcase,
      label: 'Job Opportunities',
      color: 'text-orange-500',
      labelColor: 'text-orange-400'
    },
    {
      id: 'exam',
      icon: BrainCircuit,
      label: 'Exam Corner',
      color: 'text-red-500',
      labelColor: 'text-red-400'
    }
  ];

  return (
    <div className="flex  h-screen w-screen bg-[#0f1218]">
      {/* Sidebar with Navigation Icons */}
      <div className="w-16 bg-[#1a1f2c] h-screen py-4 flex flex-col items-center space-y-4">
        {navItems.map((item) => (
          <div 
            key={item.id} 
            className="relative group"
          >
            <button
              onClick={() => setActiveTab(item.id)}
              onMouseEnter={() => setTooltipItem(item.id)}
              onMouseLeave={() => setTooltipItem(null)}
              className={`p-3 rounded-lg transition-all duration-200 relative ${
                activeTab === item.id
                  ? 'bg-gray-700 scale-110'
                  : 'hover:bg-gray-700/50 hover:scale-105'
              }`}
            >
              {/* Icon with dynamic color and stroke width */}
              <item.icon
                size={24}
                className={`${item.color} transition-all duration-200 ${
                  activeTab === item.id ? 'stroke-2' : 'stroke-1'
                }`}
              />
            </button>
            
            {/* Tooltip positioned inline with icon */}
            {tooltipItem === item.id && (
              <div 
                className={`
                  absolute top-1/2 -translate-y-1/2 left-full ml-4 
                  px-3 py-1.5 bg-gray-800 rounded-md 
                  whitespace-nowrap z-50 font-medium 
                  ${item.labelColor}
                `}
              >
                {item.label}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      
        <div className="flex-1 overflow-auto px-6">
        {activeTab === 'Home' && <HomePage />}
          {activeTab === 'exam' && <Exam />}
          {activeTab === 'placement' && <PlacementDrive />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'events' && <EventAdd />}
          {activeTab === 'resources' && <ResourceAdd />}
          {activeTab === 'jobs' && <JobOpportunities />}
        </div>
      
    </div>
  );
};

export default StudentPage;