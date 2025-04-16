import React from 'react';
import { Home, Briefcase, Book, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ unreadCount, setActiveTab, activeTab }) => {
  const navigate = useNavigate();
  const navItems = [
    { id: '', icon: Home, label: 'Dashboard' },
    { id: 'shareResources', icon: Book, label: 'Resources' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'shareOpportunities', icon: Briefcase, label: 'Jobs' },
  ];

  return (
    <div className="h-full flex flex-col py-6 space-y-6 bg-secondary-bg">
      {navItems.map((item) => (
        <div key={item.id} className="relative group w-full px-4">
          <button
            onClick={() => {
              const route = item.id === '' ? '/alumni' : `/alumni/${item.id}`;
              setActiveTab(item.id);
              navigate(route);
            }}
            className={`w-full p-3 rounded-lg flex items-center justify-start gap-3 transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-accent text-text-primary'
                : 'text-text-secondary hover:bg-gray-700 hover:text-text-primary'
            }`}
            aria-label={`Navigate to ${item.label}`}
          >
            <item.icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;