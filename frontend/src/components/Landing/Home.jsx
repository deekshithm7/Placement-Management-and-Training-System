import React, { memo, useEffect, useState, useCallback, Suspense } from "react";
import { Link } from "react-scroll";
import { Link as RouterLink, useNavigate } from "react-router-dom"; // Added React Router
import { ChevronDown, User, Building, Briefcase, Calendar, Search, Download, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import heroImage from "../../assets/campus-dusk-bg1.jpg";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Enhanced cards with hover effects and smooth transitions
const StatsCard = memo(({ icon: Icon, title, value, subValue, description }) => (
  <motion.div
    className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-opacity-90"
    variants={fadeIn}
    whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
  >
    <div className="flex items-center gap-4">
      <div className="bg-[var(--primary-accent)]/10 p-3 rounded-full">
        <Icon size={28} className="text-[var(--primary-accent)]" />
      </div>
      <div>
        <h3 className="text-sm uppercase text-[var(--secondary-text)] font-semibold tracking-wider">{title}</h3>
        <div className="flex items-center gap-2">
          <p className="text-3xl font-bold text-[var(--primary-text)]">{value}</p>
          {subValue && (
            <p className="text-sm font-medium text-[var(--highlight-color)] bg-[var(--highlight-color)]/10 px-2 py-0.5 rounded-full">
              {subValue}
            </p>
          )}
        </div>
        <p className="text-sm text-[var(--muted-text)] mt-1">{description}</p>
      </div>
    </div>
  </motion.div>
));

// Enhanced event card with more visual appeal and login navigation
const EventCard = memo(({ title, mentor, date, time, venue, participantsRegistered, maxParticipants, status, imageUrl, navigate }) => {
  const registrationPercentage = (participantsRegistered / maxParticipants) * 100;
  const isAlmostFull = registrationPercentage >= 80;
  
  const handleRegister = () => {
    // Navigate to login page
    navigate("/login", { 
      state: { 
        redirectAfterLogin: "/events/register",
        eventData: { title, mentor, date, time, venue } 
      } 
    });
  };
  
  return (
    <motion.div
      className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 w-full max-w-sm"
      variants={fadeIn}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <div className="p-1 bg-gradient-to-r from-[#4A90E2] to-[#1E3A8A]" />
      <div className="p-6">
        <div className="flex flex-col gap-4">
          <div className="text-left">
            <div className="flex justify-between items-center mb-2">
              <span
                className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                  status === "Upcoming" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                }`}
              >
                {status}
              </span>
              {isAlmostFull && (
                <span className="text-xs text-orange-600 font-medium animate-pulse">
                  Almost Full!
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-[#1E3A8A] line-clamp-1" title={title}>
              {title}
            </h3>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium text-gray-700">Mentor:</span> {mentor}
            </p>
            <p className="flex items-center gap-1">
              <span className="font-medium text-gray-700">When:</span>{" "}
              <span>{new Date(date).toLocaleDateString()} at {time}</span>
            </p>
            <p>
              <span className="font-medium text-gray-700">Venue:</span> {venue}
            </p>
            <div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Participants:</span>
                <span>{participantsRegistered}/{maxParticipants}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    registrationPercentage > 80 ? "bg-orange-500" : "bg-green-500"
                  }`}
                  style={{ width: `${registrationPercentage}%` }}
                />
              </div>
            </div>
          </div>
          {status === "Upcoming" && (
            <button 
              onClick={handleRegister}
              className="mt-4 w-full bg-[#4A90E2] text-white py-2 rounded-md hover:bg-[#1E3A8A] transition duration-300 font-semibold flex items-center justify-center gap-2"
            >
              <Calendar size={16} />
              Register for Event
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
});

// Enhanced drive card with login navigation
const DriveCard = memo(({ companyName, role, date, eligibleBranches, minCGPA, status, companyLogo, navigate }) => {
  const daysUntilDrive = () => {
    const today = new Date();
    const driveDate = new Date(date);
    const diffTime = Math.abs(driveDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleRegister = () => {
    // Navigate to login page with redirect info
    navigate("/login", { 
      state: { 
        redirectAfterLogin: "/drives/register",
        driveData: { companyName, role, date, eligibleBranches, minCGPA } 
      } 
    });
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 w-full max-w-sm"
      variants={fadeIn}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <div className="p-1 bg-gradient-to-r from-[#4A90E2] to-[#1E3A8A]" />
      <div className="p-6">
        <div className="flex flex-col gap-4">
          <div className="text-left">
            <div className="flex justify-between items-center">
              <span
                className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-2 ${
                  status === "Upcoming" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                }`}
              >
                {status}
              </span>
              {status === "Upcoming" && daysUntilDrive() <= 3 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {daysUntilDrive() === 0 ? "Today!" : `${daysUntilDrive()} days left!`}
                </span>
              )}
            </div>
            <h3
              className="text-lg font-semibold text-[#1E3A8A] line-clamp-1"
              title={`${companyName} - ${role}`}
            >
              {companyName} - {role}
            </h3>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-center gap-1">
              <span className="font-medium text-gray-700">Date:</span>{" "}
              <span>{new Date(date).toLocaleDateString()}</span>
            </p>
            <p>
              <span className="font-medium text-gray-700">Branches:</span>{" "}
              <span className="inline-flex flex-wrap gap-1">
                {eligibleBranches.map((branch, idx) => (
                  <span key={idx} className="bg-gray-100 text-xs px-2 py-0.5 rounded">
                    {branch}
                  </span>
                ))}
              </span>
            </p>
            <p>
              <span className="font-medium text-gray-700">Min CGPA:</span>{" "}
              <span className="inline-block bg-[var(--primary-accent)]/10 text-[var(--primary-accent)] px-2 py-0.5 rounded font-medium">
                {minCGPA}
              </span>
            </p>
          </div>
          {status === "Upcoming" && (
            <button 
              onClick={handleRegister}
              className="mt-4 w-full bg-[#4A90E2] text-white py-2 rounded-md hover:bg-[#1E3A8A] transition duration-300 font-semibold flex items-center justify-center gap-2"
            >
              <Briefcase size={16} />
              Register for Drive
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
});



// Modified Home component with filtering options and navigation
const Home = () => {
  const navigate = useNavigate(); // React Router's navigation hook
  const [events, setEvents] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    branch: "all",
    eventType: "all",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status
  useEffect(() => {
    // You can replace this with your actual authentication check
    const checkLoginStatus = () => {
      const token = localStorage.getItem('authToken');
      setIsLoggedIn(!!token);
    };
    
    checkLoginStatus();
  }, []);

  // Fetch data with improved error handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsResponse, drivesResponse] = await Promise.all([
          axios.get("/api/events/public"),
          axios.get("/api/placement-drives/public"),
        ]);

        // Add more validation and data processing
        const eventsData = eventsResponse.data;
        const drivesData = drivesResponse.data;

        // Format and normalize the data if needed
        const processedEvents = Array.isArray(eventsData) 
          ? eventsData.map(event => ({
              ...event,
              date: event.date || new Date().toISOString(),
              status: new Date(event.date) > new Date() ? "Upcoming" : "Ongoing",
            }))
          : [];

        const processedDrives = Array.isArray(drivesData)
          ? drivesData.map(drive => ({
              ...drive,
              date: drive.date || new Date().toISOString(),
              status: new Date(drive.date) > new Date() ? "Upcoming" : "Ongoing",
            }))
          : [];

        setEvents(processedEvents);
        setDrives(processedDrives);
      } catch (error) {
        console.error("Error fetching data with axios:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch data";
        setError(errorMessage);
        setEvents([]);
        setDrives([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter events and drives based on search query and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === "" || 
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.mentor?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filters.eventType === "all" || event.status === filters.eventType;
    
    return matchesSearch && matchesType;
  });

  const filteredDrives = drives.filter(drive => {
    const matchesSearch = searchQuery === "" || 
      drive.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.role?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBranch = filters.branch === "all" || 
      (drive.eligibleBranches && drive.eligibleBranches.includes(filters.branch));
    
    const matchesType = filters.eventType === "all" || drive.status === filters.eventType;
    
    return matchesSearch && matchesBranch && matchesType;
  });

  // Memoized filter handler
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  // Stats section with dynamic content
  const statsData = [
    {
      icon: User,
      title: "Placement Rate",
      value: "95%",
      subValue: "2023-24",
      description: "Consistently high success rate"
    },
    {
      icon: Building,
      title: "Industry Partners",
      value: "50+",
      subValue: "Elite Firms",
      description: "Top-tier company collaborations"
    },
    {
      icon: Briefcase,
      title: "Highest Package",
      value: "13.2",
      subValue: "LPA",
      description: "Career-defining opportunities"
    }
  ];

  // Handle resource download with auth check
  const handleResourceDownload = () => {
    if (isLoggedIn) {
      // If logged in, initiate download
      // Replace with your actual download logic
      alert("Download started!");
    } else {
      // If not logged in, redirect to login page
      navigate("/login", { 
        state: { 
          redirectAfterLogin: "/resources/download",
          message: "Please log in to download placement resources" 
        } 
      });
    }
  };

  return (
    <div className="font-[Poppins,sans-serif] bg-[var(--primary-bg)] relative">
      {/* Hero Section with improved animation */}
      <section
        className="relative w-full min-h-[100vh] bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backgroundBlendMode: "overlay",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.7)]"></div>
        <div className="relative z-10 inset-0 flex items-center justify-center px-4 min-h-[100vh]">
          <div className="text-center text-white max-w-4xl">
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight text-white drop-shadow-lg"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              <span className="bg-gradient-to-r from-[var(--highlight-color)] to-white bg-clip-text text-transparent">
                Empowering Futures
              </span>
              <br />at GCEK Placements
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl mb-8 font-light max-w-2xl mx-auto text-white/90 drop-shadow-md"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              Building bridges to success through exceptional career opportunities 
              and industry connections
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <Link
                to="upcoming"
                className="bg-white text-[var(--primary-accent)] px-8 py-3 rounded-full font-semibold hover:bg-[var(--highlight-color)] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
              >
                Discover Opportunities
              </Link>
              {isLoggedIn ? (
                <RouterLink
                  to="/dashboard"
                  className="bg-transparent text-white border-2 border-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-[var(--primary-accent)] transition-all duration-300 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-white/30 focus:outline-none"
                >
                  My Dashboard
                </RouterLink>
              ) : (
                <RouterLink
                  to="/login"
                  className="bg-transparent text-white border-2 border-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-[var(--primary-accent)] transition-all duration-300 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-white/30 focus:outline-none"
                >
                  Sign In / Register
                </RouterLink>
              )}
            </motion.div>
          </div>
        </div>
        <motion.div
          className="absolute bottom-12 left-0 right-0 flex justify-center z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Link to="stats" className="text-white hover:text-[var(--highlight-color)] transition-colors">
            <ChevronDown size={40} className="drop-shadow-lg" />
          </Link>
        </motion.div>
      </section>

      {/* Stats section with improved visual styling */}
      <section id="stats" className="relative z-10 w-full max-w-6xl mx-auto px-4 -mt-20 py-12">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        >
          {statsData.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </motion.div>
      </section>

      {/* Opportunity section with search and filters */}
      <section id="upcoming" className="relative z-10 w-full max-w-6xl mx-auto px-4 py-12">
        <motion.h2
          className="text-3xl font-bold text-center text-[var(--primary-text)] mb-8"
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
        >
          Upcoming & Ongoing Opportunities
        </motion.h2>

        {/* Search and filter bar */}
        <motion.div
          className="mb-8 bg-white p-4 rounded-xl shadow-md"
          variants={slideIn}
          initial="hidden"
          whileInView="visible"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search opportunities..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--primary-accent)] focus:border-[var(--primary-accent)] outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <div className="flex gap-4">
              <select
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--primary-accent)] focus:border-[var(--primary-accent)] outline-none bg-white"
                value={filters.branch}
                onChange={(e) => handleFilterChange("branch", e.target.value)}
              >
                <option value="all">All Branches</option>
                <option value="CSE">Computer Science</option>
                <option value="ECE">Electronics</option>
                <option value="MECH">Mechanical</option>
                <option value="CIVIL">Civil</option>
              </select>
              <select
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--primary-accent)] focus:border-[var(--primary-accent)] outline-none bg-white"
                value={filters.eventType}
                onChange={(e) => handleFilterChange("eventType", e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
              </select>
            </div>
          </div>
        </motion.div>

        

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-accent)]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 bg-red-50 rounded-xl border border-red-100 shadow-sm">
            <p className="text-red-600">Error: {error}</p>
            <button 
              className="mt-4 bg-white text-red-600 border border-red-200 px-4 py-2 rounded-md font-medium hover:bg-red-50"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="mb-12">
              <h3 className="text-2xl font-semibold text-[var(--primary-text)] mb-6 text-center">
                Placement Drives
              </h3>
              {filteredDrives.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-[var(--muted-text)]">No placement drives match your criteria.</p>
                  {searchQuery || filters.branch !== "all" || filters.eventType !== "all" ? (
                    <button
                      className="mt-4 text-[var(--primary-accent)] font-medium hover:underline"
                      onClick={() => {
                        setSearchQuery("");
                        setFilters({ branch: "all", eventType: "all" });
                      }}
                    >
                      Clear Filters
                    </button>
                  ) : null}
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center max-w-5xl mx-auto"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
                >
                  <AnimatePresence>
                    {filteredDrives.map((drive, index) => (
                      <DriveCard key={index} {...drive} navigate={navigate} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            <div className="mb-12">
              <h3 className="text-2xl font-semibold text-[var(--primary-text)] mb-6 text-center">
                Events & Workshops
              </h3>
              {filteredEvents.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-[var(--muted-text)]">No events match your criteria.</p>
                  {searchQuery || filters.eventType !== "all" ? (
                    <button
                      className="mt-4 text-[var(--primary-accent)] font-medium hover:underline"
                      onClick={() => {
                        setSearchQuery("");
                        setFilters(prev => ({ ...prev, eventType: "all" }));
                      }}
                    >
                      Clear Filters
                    </button>
                  ) : null}
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center max-w-5xl mx-auto"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
                >
                  <AnimatePresence>
                    {filteredEvents.map((event, index) => (
                      <EventCard key={index} {...event} navigate={navigate} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

           
          </>
        )}
      </section>
    </div>
  );
};

export default memo(Home);