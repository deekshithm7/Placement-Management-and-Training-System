import React, { useState } from "react";

const Nabar = ({ activeRole, setActiveRole  }) => {
  

  const tabs = [
    { name: "Student" },
    { name: "Coordinator" },
    { name: "Advisor"},
    { name: "Alumni"},
  ];

  return (
    <div className="relative">
      <div className="flex space-x-4 border-b-2">
        {tabs.map((tab) => (
          <button
          onClick={(e) => {
            e.preventDefault(); 
            setActiveRole(tab.name);
           }}
          className={`px-4 py-2 ${activeRole === tab.name ? "text-blue-600 border-blue-600 border-b-2" : "text-gray-500"}`}
           >
          {tab.name}
          </button>  
        ))}
      </div>
    </div>
  );
};

export default Nabar;