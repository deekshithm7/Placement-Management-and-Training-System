import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts';
import { Calendar, Filter, Download, X, CheckSquare, Square } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : 'http://localhost:8080/api';

// Enhanced Branch Targeting Chart with stacked bars and distinct branch colors
const EnhancedBranchTargetingChart = ({ data, branches }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  // Color palette for branches
  const branchColors = [
    '#4299E1', '#38B2AC', '#48BB78', '#ECC94B', '#ED8936',
    '#F56565', '#9F7AEA', '#667EEA', '#ED64A6', '#718096',
    '#81E6D9', '#9AE6B4',
  ];

  const getBranchColor = (index) => branchColors[index % branchColors.length];

  const handleMouseEnter = (_, index) => setActiveIndex(index);
  const handleMouseLeave = () => setActiveIndex(null);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" strokeOpacity={0.7} />
        <XAxis
          dataKey="name"
          stroke="#d1d5db"
          tick={{ fill: '#d1d5db', fontSize: 12 }}
          tickLine={{ stroke: '#4b5563' }}
          axisLine={{ stroke: '#4b5563' }}
        />
        <YAxis
          stroke="#d1d5db"
          tick={{ fill: '#d1d5db', fontSize: 12 }}
          tickLine={{ stroke: '#4b5563' }}
          axisLine={{ stroke: '#4b5563' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #4b5563',
            color: '#d1d5db',
            borderRadius: '6px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          }}
          cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
          formatter={(value, name) => [`${value} students`, name]}
          labelFormatter={(label) => `Company: ${label}`}
        />
        <Legend
          wrapperStyle={{ color: '#d1d5db', paddingTop: '10px' }}
          iconType="circle"
          formatter={(value) => <span style={{ color: '#d1d5db' }}>{value}</span>}
        />
        {branches.map((branch, index) => (
          <Bar
            key={branch}
            dataKey={branch}
            name={branch}
            stackId="a" // Stack bars for each company
            fill={getBranchColor(index)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            animationDuration={1500}
          >
            {data.map((entry, entryIndex) => (
              <Cell
                key={`cell-${entryIndex}`}
                fill={getBranchColor(index)}
                fillOpacity={activeIndex === entryIndex ? 1 : 0.85}
                stroke={activeIndex === entryIndex ? '#fff' : 'none'}
                strokeWidth={1}
              />
            ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

// FilterPill Component
const FilterPill = ({ label, onRemove }) => (
  <div className="bg-teal-500/20 text-teal-300 rounded-full px-3 py-1 text-sm flex items-center gap-1 animate-fadeIn">
    <span>{label}</span>
    <X
      size={14}
      className="cursor-pointer hover:text-white transition-colors"
      onClick={onRemove}
    />
  </div>
);

// MultiSelectFilterMenu Component - Enhanced to better support multiple selections
const MultiSelectFilterMenu = ({ title, items, selectedItems, onItemToggle, onClearAll }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-lg px-4 py-2 text-sm flex items-center justify-between w-full"
      >
        <span>{title}</span>
        <span className="ml-2 bg-teal-500/30 text-teal-400 rounded-full px-2 text-xs">
          {selectedItems.length}
        </span>
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl animate-fadeIn">
          <div className="p-2 border-b border-gray-700 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-300">Select {title}</span>
            <button
              onClick={() => {
                onClearAll();
                // Keep dropdown open after clearing
              }}
              className="text-xs text-teal-400 hover:text-teal-300"
            >
              Clear all
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {items.map((item) => (
              <div
                key={item}
                className="flex items-center space-x-2 p-2 hover:bg-gray-700/50 rounded cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent dropdown from closing
                  onItemToggle(item);
                }}
              >
                {selectedItems.includes(item) ? (
                  <CheckSquare size={16} className="text-teal-500" />
                ) : (
                  <Square size={16} className="text-gray-400" />
                )}
                <span className="text-sm text-gray-200">{item}</span>
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-gray-700 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-teal-400 hover:text-teal-300 px-3 py-1 bg-gray-700 rounded"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    endDate: new Date(),
  });
  
  // Available filter options
  const [filterOptions, setFilterOptions] = useState({
    companies: [],
    roles: [],
    branches: [],
    testTypes: [],
  });
  
  // Currently selected filters
  const [activeFilters, setActiveFilters] = useState({
    companies: [],
    roles: [],
    branches: [],
    testTypes: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/analytics/dashboard`,
          {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            filters: activeFilters,
          },
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          setDashboardData(response.data);
          
          // Update available filter options based on data
          setFilterOptions({
            companies: [...new Set(response.data.placementDrives.map((drive) => drive.companyName))],
            roles: [...new Set(response.data.placementDrives.map((drive) => drive.role))],
            branches: [...new Set(response.data.placementDrives.flatMap((drive) => drive.eligibleBranches))],
            testTypes: [...new Set(response.data.aptitudeTests.map((test) => test.title.split(' ')[0]))],
          });
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [dateRange, activeFilters]);

  const exportData = (format) => {
    console.log(`Exporting data in ${format} format`);
    // You could implement actual CSV export functionality here
  };

  // Toggle a specific filter item (add or remove)
  const handleItemToggle = (filterType, item) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(item)
        ? prev[filterType].filter((i) => i !== item)
        : [...prev[filterType], item],
    }));
  };

  // Remove a specific filter pill
  const removeFilterItem = (filterType, item) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].filter((i) => i !== item),
    }));
  };

  // Clear all filters of a specific type
  const clearFilterType = (filterType) => {
    setActiveFilters((prev) => ({ ...prev, [filterType]: [] }));
  };

  // Clear all filters across all types
  const clearAllFilters = () => {
    setActiveFilters({ companies: [], roles: [], branches: [], testTypes: [] });
  };

  // Count total active filters
  const getTotalActiveFilterCount = () =>
    Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center text-white">
          <div className="w-12 h-12 border-t-4 border-teal-500 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="bg-gray-800/90 backdrop-blur-md p-6 rounded-lg shadow-xl border border-gray-700 text-center max-w-md">
          <h2 className="text-2xl font-extrabold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            No Data Available
          </h2>
          <p className="text-gray-400 mt-2">Try adjusting your filters or date range</p>
        </div>
      </div>
    );
  }

  const companyStatsArray = Object.values(
    dashboardData.placementDrives.reduce((acc, drive) => {
      acc[drive.companyName] = acc[drive.companyName] || {
        name: drive.companyName,
        drives: 0,
        applications: 0,
        selected: 0,
      };
      acc[drive.companyName].drives += 1;
      acc[drive.companyName].applications += drive.applicationCount;
      acc[drive.companyName].selected += drive.selectedCount;
      return acc;
    }, {})
  );

  const phaseProgressionData = [
    { name: 'Applied', count: dashboardData.phaseProgression.applied || 0 },
    { name: 'Resume', count: dashboardData.phaseProgression.resumeScreening || 0 },
    { name: 'Written', count: dashboardData.phaseProgression.writtenTest || 0 },
    { name: 'Aptitude', count: dashboardData.phaseProgression.aptitudeTest || 0 },
    { name: 'Coding', count: dashboardData.phaseProgression.codingTest || 0 },
    { name: 'HR', count: dashboardData.phaseProgression.interviewHR || 0 },
    { name: 'Technical', count: dashboardData.phaseProgression.interviewTechnical || 0 },
    { name: 'Selected', count: dashboardData.phaseProgression.selected || 0 },
  ];

  // Prepare data for Branch Targeting Chart
  const barChartData = dashboardData.branchTargeting?.companies.map((company, index) => {
    const companyData = { name: company };
    dashboardData.branchTargeting?.branches.forEach((branch, branchIndex) => {
      companyData[branch] = dashboardData.branchTargeting?.data[index][branchIndex];
    });
    return companyData;
  }) || [];

  // Filter out aptitude test entries from the timeline
  const filteredTimeline = dashboardData.timeline?.filter(item => item.type !== 'Aptitude Test') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="bg-gray-800/90 backdrop-blur-md shadow-xl rounded-lg border border-gray-700 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <h1 className="text-2xl font-extrabold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Placement Analytics Dashboard
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-gray-400" size={20} />
              <div className="flex items-center gap-2">
                <DatePicker
                  selected={dateRange.startDate}
                  onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
                  className="bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  dateFormat="MMM yyyy"
                  showMonthYearPicker
                />
                <span className="text-gray-400">to</span>
                <DatePicker
                  selected={dateRange.endDate}
                  onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
                  className="bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  dateFormat="MMM yyyy"
                  showMonthYearPicker
                />
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-teal-500/20 rounded-lg p-4">
            <p className="text-sm text-teal-400">Total Placement Drives</p>
            <h2 className="text-3xl font-bold text-white">{dashboardData.summary.totalDrives}</h2>
          </div>
          <div className="bg-green-500/20 rounded-lg p-4">
            <p className="text-sm text-green-400">Conversion Rate</p>
            <h2 className="text-3xl font-bold text-white">{dashboardData.summary.conversionRate}%</h2>
          </div>
          <div className="bg-amber-500/20 rounded-lg p-4">
            <p className="text-sm text-amber-400">Students Placed</p>
            <h2 className="text-3xl font-bold text-white">{dashboardData.summary.totalPlacements}</h2>
          </div>
        </div>

        {/* Enhanced Multi-Select Filters */}
        <div className="bg-gray-800/80 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Filter className="text-gray-400 mr-2" size={20} />
              <h2 className="text-lg font-semibold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                Filters
              </h2>
              {getTotalActiveFilterCount() > 0 && (
                <span className="ml-2 bg-teal-500/30 text-teal-400 rounded-full px-2 py-0.5 text-xs">
                  {getTotalActiveFilterCount()} active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {getTotalActiveFilterCount() > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm text-teal-400 hover:text-teal-300 transition-colors flex items-center"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>
          
          {/* Active filter pills */}
          {getTotalActiveFilterCount() > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(activeFilters).flatMap(([filterType, items]) =>
                items.map((item) => (
                  <FilterPill
                    key={`${filterType}-${item}`}
                    label={item}
                    onRemove={() => removeFilterItem(filterType, item)}
                  />
                ))
              )}
            </div>
          )}
          
          {/* Filter selection menus */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 animate-fadeIn">
              {[
                { key: 'companies', title: 'Companies' },
                { key: 'roles', title: 'Roles' },
                { key: 'branches', title: 'Branches' },
                { key: 'testTypes', title: 'Test Types' },
              ].map((filter) => (
                <MultiSelectFilterMenu
                  key={filter.key}
                  title={filter.title}
                  items={filterOptions[filter.key]}
                  selectedItems={activeFilters[filter.key]}
                  onItemToggle={(item) => handleItemToggle(filter.key, item)}
                  onClearAll={() => clearFilterType(filter.key)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800/80 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-4">
              Company-wise Statistics
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={companyStatsArray}>
                <CartesianGrid stroke="#4b5563" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#d1d5db" />
                <YAxis stroke="#d1d5db" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', color: '#d1d5db' }} />
                <Legend wrapperStyle={{ color: '#d1d5db' }} />
                <Bar dataKey="drives" fill="#60a5fa" name="Drives" />
                <Bar dataKey="applications" fill="#81c995" name="Applications" />
                <Bar dataKey="selected" fill="#fbbf24" name="Selected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-gray-800/80 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-4">
              Student Phase Progression
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={phaseProgressionData}>
                <CartesianGrid stroke="#4b5563" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#d1d5db" />
                <YAxis stroke="#d1d5db" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', color: '#d1d5db' }} />
                <Legend wrapperStyle={{ color: '#d1d5db' }} />
                <Line type="monotone" dataKey="count" stroke="#60a5fa" name="Student Count" strokeWidth={2} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch Targeting Chart */}
        <div className="bg-gray-800/80 rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Branch Targeting Analysis
          </h2>
          <div className="w-full overflow-x-auto">
            <div style={{ minWidth: '800px', width: '100%' }}>
              <EnhancedBranchTargetingChart
                data={barChartData}
                branches={dashboardData.branchTargeting?.branches || []}
              />
            </div>
          </div>
        </div>

        {/* Aptitude Test Analytics */}
        <div className="bg-gray-800/80 rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Aptitude Test Analytics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-teal-500/20 rounded-lg p-4">
              <p className="text-sm text-teal-400">Total Tests</p>
              <h2 className="text-3xl font-bold text-white">{dashboardData.aptitudeSummary.totalTests}</h2>
            </div>
            <div className="bg-green-500/20 rounded-lg p-4">
              <p className="text-sm text-green-400">Pass Rate</p>
              <h2 className="text-3xl font-bold text-white">{dashboardData.aptitudeSummary.passRate}%</h2>
            </div>
            <div className="bg-purple-500/20 rounded-lg p-4">
              <p className="text-sm text-purple-400">Avg. Aptitude Score</p>
              <h2 className="text-3xl font-bold text-white">{dashboardData.summary.avgAptitudeScore}%</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-semibold text-gray-300 mb-3">Test Performance Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.aptitudePerformanceTrend}>
                  <CartesianGrid stroke="#4b5563" strokeDasharray="3 3" />
                  <XAxis dataKey="testName" stroke="#d1d5db" />
                  <YAxis stroke="#d1d5db" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', color: '#d1d5db' }} />
                  <Legend wrapperStyle={{ color: '#d1d5db' }} />
                  <Line type="monotone" dataKey="avgScore" stroke="#60a5fa" name="Avg Score" strokeWidth={2} />
                  <Line type="monotone" dataKey="passRate" stroke="#81c995" name="Pass Rate %" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Timeline - Modified to exclude aptitude test entries */}
        <div className="bg-gray-800/80 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Placement Activity Timeline
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-700/50">
                  <th className="py-2 px-4 text-left text-gray-300 text-sm">Date</th>
                  <th className="py-2 px-4 text-left text-gray-300 text-sm">Activity</th>
                  <th className="py-2 px-4 text-left text-gray-300 text-sm">Company/Test</th>
                  <th className="py-2 px-4 text-left text-gray-300 text-sm">Details</th>
                  <th className="py-2 px-4 text-left text-gray-300 text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTimeline.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-800/30'}>
                    <td className="py-2 px-4 text-gray-200 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="py-2 px-4 text-gray-200 text-sm">{item.type}</td>
                    <td className="py-2 px-4 text-gray-200 text-sm">{item.title}</td>
                    <td className="py-2 px-4 text-gray-200 text-sm">{item.details}</td>
                    <td className="py-2 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          item.status === 'Completed'
                            ? 'bg-green-500/20 text-green-400'
                            : item.status === 'In Progress'
                            ? 'bg-teal-500/20 text-teal-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;