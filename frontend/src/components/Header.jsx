import React, { useState, useEffect, useRef } from 'react';
import { Bell, LogOut, Menu, X } from 'lucide-react';
import gcekLogo from '../assets/gcek-transparent.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfileDropdown = ({ userData, onLogout }) => (
  <div className="absolute right-0 mt-2 w-64 bg-[var(--dashboard-secondary-bg)] rounded-lg shadow-lg border border-gray-600/50 animate-fade-in z-20">
    <div className="p-4 border-b border-gray-600">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center transition-all duration-300 hover:bg-[var(--dashboard-accent)]/30 hover:dashboard-glow">
          <span className="text-[var(--dashboard-text-primary)] text-sm font-medium">
            {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--dashboard-text-primary)] truncate max-w-[150px]">{userData.name}</p>
          <p className="text-xs text-[var(--dashboard-text-secondary)] truncate">{userData.email}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-[var(--dashboard-text-secondary)]">Role: {userData.role}</p>
      <p className="mt-1 text-xs text-[var(--dashboard-text-secondary)]">Batch: {userData.batch} | Branch: {userData.department}</p>
    </div>
    <div className="py-2">
      {[
        { icon: LogOut, label: 'Sign out', onClick: onLogout, className: 'text-[var(--dashboard-error)] hover:text-[var(--dashboard-error)]/80' },
      ].map((item, index) => (
        <button
          key={index}
          onClick={item.onClick}
          className={`w-full text-left px-4 py-2 text-sm text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-gray-600 transition-all duration-300 flex items-center gap-2 ${item.className || ''}`}
          aria-label={item.label}
        >
          <item.icon size={16} /> {item.label}
        </button>
      ))}
    </div>
  </div>
);

const MobileMenu = ({ userData, onLogout, onClose }) => (
  <div className="fixed inset-0 z-20 bg-[var(--dashboard-primary-bg)] md:hidden animate-slide-in">
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-600 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center transition-all duration-300 hover:bg-[var(--dashboard-accent)]/30 hover:dashboard-glow">
            <span className="text-[var(--dashboard-text-primary)] text-sm font-medium">
              {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--dashboard-text-primary)] truncate max-w-[150px]">{userData.name}</p>
            <p className="text-xs text-[var(--dashboard-text-secondary)] truncate">{userData.email}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-600 transition-all duration-300" aria-label="Close menu">
          <X size={20} className="text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-error)]" />
        </button>
      </div>
      <div className="flex-1 p-4 space-y-4">
        <p className="text-xs text-[var(--dashboard-text-secondary)]">Role: {userData.role}</p>
        <p className="text-xs text-[var(--dashboard-text-secondary)]">Batch: {userData.batch} | Branch: {userData.department}</p>
        {[
          { icon: LogOut, label: 'Sign out', onClick: onLogout, className: 'text-[var(--dashboard-error)] hover:text-[var(--dashboard-error)]/80' },
        ].map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={`w-full text-left px-4 py-2 text-sm text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-gray-600 transition-all duration-300 flex items-center gap-2 ${item.className || ''}`}
            aria-label={item.label}
          >
            <item.icon size={16} /> {item.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, role, logout, notifications } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const userData = {
    name: user?.name || user?.email || 'John Doe',
    email: user?.email || 'N/A',
    role: role || 'Guest',
    batch: user?.batch || 'N/A',
    department: user?.branch || 'N/A',
    notifications: unreadCount,
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';
    return () => (document.body.style.overflow = 'auto');
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-[1000] bg-[var(--dashboard-primary-bg)] text-[var(--dashboard-text-primary)] shadow-md border-b border-gray-700 h-16 dashboard-glass">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-4">
            <Link to={`/${userData.role.toLowerCase()}`} className="flex items-center group">
              <img
                src={gcekLogo}
                alt="GCEK Logo"
                className="h-10 w-auto invert brightness-125 transition-all duration-300 group-hover:brightness-150 group-hover:dashboard-glow"
              />
            </Link>
            <div className="hidden sm:flex flex-col">
              <h1 className="text-lg font-bold text-[var(--dashboard-text-primary)] transition-all duration-300 hover:dashboard-text-glow">
                Placement Portal
              </h1>
              <p className="text-xs text-[var(--dashboard-text-secondary)]">Government College of Engineering Kannur</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate(`/${userData.role.toLowerCase()}/notifications`)}
              className="relative p-2 rounded-full bg-[var(--dashboard-secondary-bg)] hover:bg-gray-700 transition-all duration-300 hover:dashboard-glow z-[1010]"
              aria-label={`Notifications (${userData.notifications} unread)`}
            >
              <Bell className="w-5 h-5 text-[var(--dashboard-text-secondary)] transition-colors duration-300 hover:text-[var(--dashboard-accent)]" />
              {userData.notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--dashboard-error)] rounded-full flex items-center justify-center text-xs text-white animate-pulse">
                  {userData.notifications}
                </span>
              )}
            </button>

            <div ref={dropdownRef} className="relative hidden md:block">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-2 rounded-lg bg-[var(--dashboard-secondary-bg)] hover:bg-gray-700 transition-all duration-300 hover:dashboard-glow z-[1010]"
                aria-label="User Profile"
                aria-expanded={isProfileOpen}
              >
                <span className="text-sm font-medium text-[var(--dashboard-text-primary)] truncate max-w-[120px] transition-all duration-300 hover:dashboard-text-glow">
                  {userData.name}
                </span>
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center transition-all duration-300 hover:bg-[var(--dashboard-accent)]/30 hover:dashboard-glow">
                  <span className="text-sm font-medium text-[var(--dashboard-text-primary)]">
                    {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              </button>
              {isProfileOpen && (
                <ProfileDropdown
                  userData={userData}
                  onLogout={handleLogout}
                />
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-[var(--dashboard-secondary-bg)] hover:bg-gray-700 transition-all duration-300 hover:dashboard-glow z-[1010]"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-error)] transition-colors duration-300" />
              ) : (
                <Menu className="w-5 h-5 text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-accent)] transition-colors duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <MobileMenu
          userData={userData}
          onLogout={handleLogout}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;