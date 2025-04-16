import React from 'react';
import PropTypes from 'prop-types';
import { Briefcase } from 'lucide-react';

const Dashboard = ({ title, value, icon: Icon = Briefcase }) => {
  return (
    <div className="bg-secondary-bg text-text-primary rounded-xl shadow-glass p-4 transition-all duration-300 hover:bg-gray-700 hover:shadow-lg hover:scale-105">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-accent rounded-full transform hover:rotate-12 transition-transform duration-300">
          <Icon className="w-6 h-6 text-text-primary" />
        </div>
        <div>
          <h3 className="text-md font-semibold text-text-primary">{title}</h3>
          <p className="text-2xl font-bold text-highlight">{value}</p>
        </div>
      </div>
    </div>
  );
};

Dashboard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType,
};

export default Dashboard;