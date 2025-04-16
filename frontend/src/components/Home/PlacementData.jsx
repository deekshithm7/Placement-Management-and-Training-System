import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PlacementDataPage = () => {
  const [activeYear, setActiveYear] = useState("2023-24");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const placementData = {
    "2023-24": [
      { id: 1, name: "Anaswara K P", qualification: "B. Tech", specialisation: "CE", company: "Aarbee Structures", package: 2.5 },
      { id: 2, name: "Ardra Rajan M", qualification: "B. Tech", specialisation: "CE", company: "Aarbee Structures", package: 2.5 },
      { id: 3, name: "B PRATHEESH", qualification: "B. Tech", specialisation: "EEE", company: "ESAG", package: 12.26 },
      { id: 4, name: "HARIKRISHNAN V", qualification: "B. Tech", specialisation: "ME", company: "ESAG", package: 12.26 },
      { id: 5, name: "Rishikesh V K", qualification: "B. Tech", specialisation: "CSE", company: "Impelsys", package: 6 },
      { id: 6, name: "ASWANTHRAJ E", qualification: "B. Tech", specialisation: "ME", company: "Sobha Developers, Dubai", package: 13.2 },
      { id: 7, name: "Carolene Joy", qualification: "B. Tech", specialisation: "CSE", company: "Applied Materials", package: 11.4 },
      { id: 8, name: "Theertha Rajeev", qualification: "B. Tech", specialisation: "ECE", company: "J & J", package: 3.5 },
    ],
    "2021-22": [
      { id: 1, name: "Amritha C Subhash", qualification: "B.Tech", specialisation: "CE", company: "Aarbee", package: 2.16 },
      { id: 2, name: "Anagha M", qualification: "B.Tech", specialisation: "CE", company: "Aarbee", package: 2.16 },
      { id: 3, name: "Prajithraj C", qualification: "B.Tech", specialisation: "ME", company: "Adani (Indian Oil)", package: 4.1 },
      { id: 4, name: "Anju Jose", qualification: "B.Tech", specialisation: "EC", company: "Applied Materials", package: 9.3 },
      { id: 5, name: "Abhijith Dasan", qualification: "B.Tech", specialisation: "ME", company: "Byjus", package: 10 },
      { id: 6, name: "Samuel Chittilakkattu Bennett", qualification: "B.Tech", specialisation: "EC", company: "Continental", package: 6 },
    ],
    "2020-21": [
      { id: 1, name: "Dheemanth Shenoy", qualification: "B. Tech", specialisation: "ECE", company: "Aapveen Technologies", package: 5 },
      { id: 2, name: "Amgadh Madhusoodanan", qualification: "B. Tech", specialisation: "CE", company: "Aarbee Structures", package: 2.16 },
      { id: 3, name: "Ananya K", qualification: "B. Tech", specialisation: "CE", company: "Aarbee Structures", package: 2.16 },
      { id: 4, name: "Anureshmi Manoj", qualification: "B. Tech", specialisation: "CE", company: "Aarbee Structures", package: 2.16 },
    ],
  };

  const years = ["2023-24", "2021-22", "2020-21", "2019-20", "2018-19", "2017-18", "2016-17", "2015-16"];

  const getPackageColor = (packageValue) => {
    if (packageValue >= 10) return "text-green-400";
    if (packageValue >= 5) return "text-teal-400";
    return "text-gray-400";
  };

  const filteredData = useMemo(() => {
    let data = placementData[activeYear] || [];
    if (searchQuery) {
      data = data.filter(
        (student) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.specialisation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortConfig.key) {
      data = [...data].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [activeYear, searchQuery, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <motion.section
      className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 font-[Inter,Poppins,sans-serif]"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-4xl font-extrabold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent text-center mb-8 tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Placement Data
        </motion.h2>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            {years.map((year) => (
              <motion.button
                key={year}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeYear === year
                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md"
                    : "bg-gray-800/80 text-gray-400 border border-gray-700 hover:bg-gray-700/50"
                }`}
                onClick={() => setActiveYear(year)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Select year ${year}`}
              >
                {year}
              </motion.button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by name, company, or specialisation..."
            className="w-full md:w-64 p-2 rounded-lg bg-gray-800/80 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search placement data"
          />
        </div>

        <motion.div
          className="bg-gray-800/80 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="p-6 text-white font-semibold text-center">
            List of students placed in {activeYear}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700/50">
                <tr>
                  {["id", "name", "qualification", "specialisation", "company", "package"].map((key) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-teal-400 transition-colors duration-300"
                      onClick={() => handleSort(key)}
                      aria-label={`${key === "id" ? "Sl. No." : key.charAt(0).toUpperCase() + key.slice(1)} sortable column`}
                    >
                      <div className="flex items-center">
                        {key === "id" ? "Sl. No." : key.charAt(0).toUpperCase() + key.slice(1)}
                        {sortConfig.key === key && (
                          <motion.span
                            initial={{ rotate: 0 }}
                            animate={{ rotate: sortConfig.direction === "asc" ? 0 : 180 }}
                            transition={{ duration: 0.3 }}
                          >
                            <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M5 15l5-5 5 5H5z" />
                            </svg>
                          </motion.span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <AnimatePresence>
                  {filteredData.length > 0 ? (
                    filteredData.map((student, index) => (
                      <motion.tr
                        key={student.id}
                        className={`hover:bg-gray-700/50 transition duration-300 ${index % 2 === 0 ? "bg-gray-800/50" : "bg-gray-800/30"}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{student.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{student.qualification}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{student.specialisation}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{student.company}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getPackageColor(student.package)}`}>
                          {student.package}
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-center">
                        No placement data available for {activeYear}
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default React.memo(PlacementDataPage);