import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header';
import Sidebar from '../Alumni/Sidebar';

const AlumniLayout = () => {
  const location = useLocation();
  const initialTab = location.pathname.startsWith('/alumni')
    ? location.pathname.replace('/alumni/', '').replace('/alumni', '')
    : '';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const currentTab = location.pathname.startsWith('/alumni')
      ? location.pathname.replace('/alumni/', '').replace('/alumni', '')
      : '';
    setActiveTab(currentTab);
  }, [location.pathname]);

  const currentRoute = location.pathname.startsWith('/alumni')
    ? `/Alumni/${activeTab || 'Dashboard'}`
    : '/Alumni';

  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-text-primary">
      <Header currentRoute={currentRoute} />

      <div className="flex flex-1 pt-16">
        <aside className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-secondary-bg border-r border-gray-700 shadow-glass z-10 transition-all duration-300">
          <Sidebar unreadCount={0} setActiveTab={setActiveTab} activeTab={activeTab} />
        </aside>

        <main className="flex-1 ml-64 p-2 bg-primary-bg"> {/* Reduced padding from p-4 to p-2 */}
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AlumniLayout;