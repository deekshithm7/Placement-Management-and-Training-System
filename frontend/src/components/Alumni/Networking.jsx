import React from 'react';
import gcek from '../../assets/gcek-transparent.png';
import bgPattern from '../../assets/bg-pattern.jpg';

const Networking = () => {
  const people = [
    { id: 1, name: 'John Doe', role: 'Alumni', major: 'CS', year: 2020, bio: 'Software engineer.' },
    { id: 2, name: 'Jane Smith', role: 'Student', major: 'EE', year: 2024, bio: 'Robotics enthusiast.' },
    { id: 3, name: 'David Lee', role: 'Alumni', major: 'ME', year: 2018, bio: 'Automotive industry.' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-950 text-gray-100">
      <div
        className="lg:w-2/5 hidden lg:flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 relative overflow-hidden"
        style={{
          backgroundImage: `url(${bgPattern})`,
          backgroundSize: 'cover',
          backgroundColor: '#1A1A2E',
        }}
      >
        <img
          src={gcek}
          alt="GCEK Logo"
          className="w-3/4 max-w-xs h-auto mb-4 drop-shadow-md"
        />
        <h2 className="text-xl font-poppins font-bold text-gray-100 text-center">Build Connections</h2>
        <p className="text-sm font-poppins font-light text-gray-400 text-center mt-1">
          Network with GCEK alumni and students.
        </p>
      </div>

      <div className="lg:w-3/5 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
        <div className="bg-gray-950/95 rounded-lg shadow-md border border-gray-800 p-4 sm:p-6 w-full max-w-3xl">
          <h1 className="text-xl font-poppins font-bold text-gray-100 mb-4">Networking</h1>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {people.map((person) => (
              <li
                key={person.id}
                className="p-3 bg-gray-925 rounded-lg border border-gray-800/50 shadow-sm hover:bg-gray-900 transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-300 text-sm font-poppins font-medium">
                      {person.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-sm font-poppins font-semibold text-gray-100">{person.name}</h2>
                    <p className="text-xs font-poppins font-light text-gray-400">
                      {person.role} - {person.major} ({person.year})
                    </p>
                    <p className="text-xs font-poppins font-light text-gray-400 mt-1">{person.bio}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Networking;