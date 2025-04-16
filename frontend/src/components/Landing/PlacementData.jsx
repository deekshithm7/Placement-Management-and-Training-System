import React, { useState } from 'react';

const PlacementDataPage = () => {
  const [activeYear, setActiveYear] = useState('2023-24');
  
  const placementData = {
    '2023-24': [
      { id: 1, name: 'Anaswara K P', qualification: 'B. Tech', specialisation: 'CE', company: 'Aarbee structures', package: 2.5 },
      { id: 2, name: 'Ardra Rajan M', qualification: 'B. Tech', specialisation: 'CE', company: 'Aarbee structures', package: 2.5 },
      { id: 3, name: 'B PRATHEESH', qualification: 'B. Tech', specialisation: 'EEE', company: 'ESAG', package: 12.26 },
      { id: 4, name: 'HARIKRISHNAN V', qualification: 'B. Tech', specialisation: 'ME', company: 'ESAG', package: 12.26 },
      { id: 5, name: 'Rishikesh V K', qualification: 'B. Tech', specialisation: 'CSE', company: 'Impelsys', package: 6 },
      { id: 6, name: 'ASWANTHRAJ E', qualification: 'B. Tech', specialisation: 'ME', company: 'Sobha Developers, Dubai', package: 13.2 },
      { id: 7, name: 'Carolene Joy', qualification: 'B. Tech', specialisation: 'CSE', company: 'Applied Materials', package: 11.4 },
      { id: 8, name: 'Theertha Rajeev', qualification: 'B. Tech', specialisation: 'ECE', company: 'J & J', package: 3.5 },
    ],
    '2021-22': [
      { id: 1, name: 'Amritha C Subhash', qualification: 'B.Tech', specialisation: 'CE', company: 'Aarbee', package: 2.16 },
      { id: 2, name: 'Anagha M', qualification: 'B.Tech', specialisation: 'CE', company: 'Aarbee', package: 2.16 },
      { id: 3, name: 'Prajithraj c', qualification: 'B.Tech', specialisation: 'ME', company: 'Adani (Indian oil)', package: 4.1 },
      { id: 4, name: 'Anju Jose', qualification: 'B.Tech', specialisation: 'EC', company: 'Applied Materials', package: 9.3 },
      { id: 5, name: 'Abhijith Dasan', qualification: 'B.Tech', specialisation: 'ME', company: 'Byjus', package: 10 },
      { id: 6, name: 'Samuel Chittilakkattu Bennett', qualification: 'B.Tech', specialisation: 'EC', company: 'Continental', package: 6 },
    ],
    '2020-21': [
      { id: 1, name: 'Dheemanth Shenoy', qualification: 'B. Tech', specialisation: 'ECE', company: 'Aapveen Technologies', package: 5 },
      { id: 2, name: 'Amgadh madhusoodanan', qualification: 'B. Tech', specialisation: 'CE', company: 'Aarbee Structures', package: 2.16 },
      { id: 3, name: 'Ananya K', qualification: 'B. Tech', specialisation: 'CE', company: 'Aarbee Structures', package: 2.16 },
      { id: 4, name: 'Anureshmi Manoj', qualification: 'B. Tech', specialisation: 'CE', company: 'Aarbee Structures', package: 2.16 },
    ]
  };

  const years = ['2023-24', '2021-22', '2020-21', '2019-20', '2018-19', '2017-18', '2016-17', '2015-16'];

  return (
    <section className="py-20 bg-[var(--primary-bg)]">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-[var(--primary-text)] text-center mb-12 bg-gradient-to-r from-[var(--primary-accent)] to-[var(--secondary-accent)] bg-clip-text text-transparent">
          Placement Data
        </h2>

        <div className="flex flex-wrap justify-center gap-2 mb-8 bg-[var(--secondary-bg)] p-4 rounded-xl shadow-lg">
          {years.map((year) => (
            <button
              key={year}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeYear === year 
                  ? 'bg-[var(--primary-accent)] text-white shadow-md' 
                  : 'text-[var(--secondary-text)] hover:bg-[var(--primary-accent)]/10 hover:text-[var(--primary-accent)]'
              }`}
              onClick={() => setActiveYear(year)}
            >
              {year}
            </button>
          ))}
        </div>

        <div className="bg-[var(--secondary-bg)] rounded-xl shadow-lg overflow-hidden border border-[var(--primary-accent)]/10">
          <div className="p-6 bg-gradient-to-r from-[var(--primary-accent)] to-[var(--secondary-accent)] text-white">
            <h3 className="text-xl font-semibold">
              Placement Records {activeYear}
            </h3>
            <p className="text-sm mt-1">Government College of Engineering Kannur</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--primary-bg)] text-[var(--secondary-text)]">
                <tr>
                  {['Sl. No.', 'Name', 'Qualification', 'Specialisation', 'Company', 'Package (LPA)'].map((header) => (
                    <th key={header} className="px-6 py-4 text-left font-medium uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--primary-bg)]">
                {placementData[activeYear]?.map((student) => (
                  <tr key={student.id} className="hover:bg-[var(--primary-bg)]/5 transition-colors duration-200">
                    <td className="px-6 py-4">{student.id}</td>
                    <td className="px-6 py-4 font-medium text-[var(--primary-text)]">{student.name}</td>
                    <td className="px-6 py-4">{student.qualification}</td>
                    <td className="px-6 py-4">{student.specialisation}</td>
                    <td className="px-6 py-4">{student.company}</td>
                    <td className="px-6 py-4 font-medium text-[var(--success-color)]">{student.package}</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-[var(--muted-text)]">
                      No placement data available for {activeYear}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlacementDataPage;