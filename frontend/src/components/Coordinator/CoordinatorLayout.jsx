import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../Header';
import Footer from '../Footer';
import { Home, Calendar, BarChart3, BarChart, Users, FileText, Briefcase } from 'lucide-react';

const CoordinatorLayout = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: '', icon: Home, label: 'Dashboard' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'viewAnalysis', icon: BarChart, label: 'Analysis' },
    { id: 'results', icon: FileText, label: 'Results' },
    { id: 'placement-drives', icon: Briefcase, label: 'Drives' },
    { id: 'aptitude-tests', icon: BarChart3, label: 'Tests' },
    { id: 'resources', icon: Users, label: 'Resources' },
    { id: 'advisorManagement', icon: FileText, label: 'Advisors' },
  ];

  const currentPath = location.pathname.split('/').pop() || '';
  const displayRoute = currentPath === '' ? 'Dashboard' : currentPath.charAt(0).toUpperCase() + currentPath.slice(1).replace(/-/g, ' ');

  return (
    <div className="min-h-screen bg-primary-bg text-text-primary flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar - Fixed on lg screens, scrollable on smaller screens */}
        <aside className="w-full lg:w-64 lg:fixed lg:top-[4rem] lg:left-0 lg:h-[calc(100vh-4rem)] bg-secondary-bg shadow-lg z-40 lg:overflow-y-auto">
          <nav className="p-4 flex flex-col min-h-[calc(100vh-4rem)]">
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/Coordinator/${item.id}`)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPath === item.id
                      ? 'bg-accent/20 text-accent border-l-4 border-accent'
                      : 'text-text-secondary hover:bg-gray-700 hover:text-highlight'
                  }`}
                  aria-label={item.label}
                >
                  <item.icon
                    size={20}
                    className={currentPath === item.id ? 'text-accent' : 'text-text-secondary'}
                  />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64">
          <div className="max-w-7xl mx-auto">
           
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      
    </div>
  );
};

export default CoordinatorLayout;