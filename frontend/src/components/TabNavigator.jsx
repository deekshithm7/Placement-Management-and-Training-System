import React from 'react';

const TabNavigator = ({ activeRole, setActiveRole, roles = ['Student', 'Coordinator', 'Advisor', 'Alumni'] }) => {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex justify-center border-b border-gray-200 pb-2 min-w-max">
        <div className="flex space-x-2 md:space-x-6 lg:space-x-8">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`px-2 py-1 text-sm md:text-base font-medium transition-colors duration-200 ${
                activeRole === role
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
              }`}
              aria-label={`Switch to ${role} login`}
              aria-current={activeRole === role ? 'page' : undefined}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabNavigator;