import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from '../Header';
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  GraduationCap, 
  BookOpen, 
  BarChart3, 
  Calendar, 
  Briefcase, 
  BrainCircuit,
  Bell,
  Menu,
  User
} from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: '', icon: Home, label: 'Home', color: 'text-accent', hoverColor: 'hover:text-accent' },
    { id: 'placement', icon: GraduationCap, label: 'Placement Drive', color: 'text-highlight', hoverColor: 'hover:text-highlight' },
    { id: 'resources', icon: BookOpen, label: 'Resources', color: 'text-purple-400', hoverColor: 'hover:text-purple-400' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', color: 'text-yellow-400', hoverColor: 'hover:text-yellow-400' },
    { id: 'events', icon: Calendar, label: 'Events', color: 'text-pink-400', hoverColor: 'hover:text-pink-400' },
    { id: 'jobs', icon: Briefcase, label: 'Job Opportunities', color: 'text-orange-400', hoverColor: 'hover:text-orange-400' },
    { id: 'aptitude-tests', icon: BrainCircuit, label: 'Exam Corner', color: 'text-red-400', hoverColor: 'hover:text-red-400' },
    { id: 'notifications', icon: Bell, label: 'Notifications', color: 'text-teal-400', hoverColor: 'hover:text-teal-400' },
    { id: 'profile', icon: User, label: 'Profile', color: 'text-indigo-400', hoverColor: 'hover:text-indigo-400' },
  ];

  const currentPath = location.pathname.split('/').pop() || '';

  useEffect(() => {
    const path = location.pathname.split('/').pop() || '';
    setActiveTab(path);
  }, [location]);

  const handleNavigation = (path) => {
    try {
      setActiveTab(path);
      navigate(`/student/${path}`);
      setIsSidebarOpen(false);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-primary-bg font-sans">
      <Header currentRoute={`/student/${currentPath}`} />

      <div className="flex flex-1">
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-secondary-bg rounded-lg text-text-primary"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu size={24} />
        </button>

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-secondary-bg transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:top-[4rem] lg:h-[calc(100vh-4rem)] lg:overflow-y-auto transition-all duration-300 ease-in-out flex flex-col shadow-glass`}
        >
          <nav className="p-4 flex flex-col min-h-[calc(100vh-4rem)]">
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    currentPath === item.id
                      ? 'bg-accent/20 text-white border-l-4 border-accent'
                      : 'text-gray-300 hover:bg-highlight/10 hover:scale-105 hover:text-white'
                  }`}
                >
                  <item.icon
                    size={20}
                    className={`${currentPath === item.id ? 'text-accent' : item.color} transition-all duration-200 ${
                      currentPath === item.id ? 'stroke-2' : 'stroke-1'
                    }`}
                  />
                  <span className="text-ellipsis overflow-hidden whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 lg:hidden z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main
          className="flex-1 p-4 sm:p-4 lg:p-6 lg:pl-0 lg:ml-64 h-screen overflow-y-auto bg-primary-bg transition-all duration-300"
        >
          <div className="max-w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;