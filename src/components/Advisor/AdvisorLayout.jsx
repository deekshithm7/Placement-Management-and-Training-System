// frontend/src/components/AdvisorLayout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import { Home, ClipboardList, Pen, List, Menu, Briefcase } from 'lucide-react'; // Added Briefcase icon

const AdvisorLayout = () => {
  const [activeTab, setActiveTab] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: '', icon: Home, label: 'Home' },
    { id: 'pendingRequests', icon: ClipboardList, label: 'Pending Requests' },
    { id: 'add-students', icon: Pen, label: 'Add Student Details' },
    { id: 'student-list', icon: List, label: 'Student List' },
    { id: 'placement-drives', icon: Briefcase, label: 'Placement Drives' }, // New item
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    navigate(`/Advisor/${id}`);
    setIsSidebarOpen(false);
  };

  const currentRoute = location.pathname.replace('/Advisor/', '');
  const displayRoute = currentRoute === '' ? 'Home' : currentRoute.charAt(0).toUpperCase() + currentRoute.slice(1).replace(/-/g, ' ');

  return (
    <div className="flex flex-col min-h-screen bg-primary-bg">
      <Header currentRoute={`/Advisor/${displayRoute}`} />
      <div className="flex flex-1 pt-16">
        <button
          className="md:hidden fixed top-4 left-4 z-50 p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-highlight"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle Sidebar"
        >
          <Menu size={24} />
        </button>
        <div
          className={`fixed top-16 left-0 z-40 w-64 bg-secondary-bg h-[calc(100vh-4rem)] transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-in-out`}
        >
          <div className="flex flex-col py-4 h-full">
            <div className="flex-1 space-y-2 px-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-accent text-text-primary'
                      : 'text-text-secondary hover:bg-gray-700'
                  }`}
                  aria-label={item.label}
                >
                  <item.icon size={24} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 md:ml-64">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer className="mt-auto bg-secondary-bg py-4 border-t border-gray-700 text-center text-sm text-text-secondary" />
    </div>
  );
};

export default AdvisorLayout;