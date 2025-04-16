import React from "react";
import { Link } from "react-scroll";
import { ChevronDown, User, Building, Briefcase, Mail } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "../../assets/campus-dusk-bg1.jpg";
import { useAuth } from "../../context/AuthContext"; // Import AuthContext

const upcomingEvents = [
  { id: 1, category: "Tech", title: "Microsoft Campus Recruitment", date: "20 Mar", description: "Microsoft will be conducting on-campus placement drives." },
  { id: 2, category: "Engineering", title: "TCS CodeVita Challenge", date: "25 Mar", description: "Participate in TCS's annual coding competition." },
];

// Define role-based headers
const roleHeaders = {
  Coordinator: {
    title: "Manage Campus Placements Efficiently",
    description: "Oversee placement activities and guide students toward successful careers."
  },
  Advisor: {
    title: "Shape Young Minds for Career Success",
    description: "Support and mentor students as they navigate their career opportunities."
  },
  Student: {
    title: "Kickstart Your Career with GCEK Placements",
    description: "Stay ahead! Explore upcoming placements and prepare for your dream job."
  },
  Alumni: {
    title: "Stay Connected, Inspire, and Grow",
    description: "Connect with opportunities and contribute to the success of future graduates."
  },
  default: {
    title: "Shape Your Future with GCEK Placements",
    description: "Connecting talented students with industry leaders for exceptional career opportunities at Government College of Engineering Kannur."
  }
};

const Home = () => {
  const { user, role, loading } = useAuth(); // Fetch user and role from AuthContext

  // Debug the values from useAuth
  console.log("Auth Context Values:", { user, role, loading });

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const StatsCard = ({ icon: Icon, title, value, subValue, description }) => (
    <motion.div
      className="bg-[var(--dashboard-secondary-bg)] dashboard-glass rounded-xl shadow-glass p-6 border border-gray-700 hover:shadow-2xl transition-all duration-300"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
      whileHover={{ y: -5 }}
    >
      <div className="flex items-start">
        <div className="bg-[var(--dashboard-accent)]/20 p-3 rounded-lg">
          <Icon size={24} className="text-[var(--dashboard-accent)]" />
        </div>
        <div className="ml-4">
          <h3 className="text-sm uppercase text-[var(--dashboard-text-secondary)] font-medium tracking-wide">{title}</h3>
          <div className="flex items-end">
            <p className="text-3xl font-bold text-[var(--dashboard-text-primary)]">{value}</p>
            {subValue && <p className="ml-2 text-sm text-[var(--dashboard-highlight)]">{subValue}</p>}
          </div>
          <p className="text-sm text-[var(--dashboard-text-secondary)] mt-1">{description}</p>
        </div>
      </div>
    </motion.div>
  );

  const QuickLinkCard = ({ to, icon: Icon, title, description }) => (
    <Link
      to={to}
      spy={true}
      smooth={true}
      offset={-120}
      duration={800}
      className="group bg-[var(--dashboard-secondary-bg)] dashboard-glass rounded-xl shadow-glass border border-gray-700 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <motion.div
        className="bg-gradient-to-r from-[var(--dashboard-accent)] to-[var(--dashboard-highlight)] h-2 w-full group-hover:h-4 transition-all duration-300"
        initial={{ height: 8 }}
        whileHover={{ height: 16 }}
      />
      <div className="p-6">
        <div className="w-12 h-12 bg-[var(--dashboard-accent)]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--dashboard-accent)]/30 transition duration-300">
          <Icon size={24} className="text-[var(--dashboard-accent)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--dashboard-text-primary)] group-hover:text-[var(--dashboard-highlight)] transition duration-300 text-center">
          {title}
        </h3>
        <p className="text-[var(--dashboard-text-secondary)] mt-2 text-center">{description}</p>
      </div>
    </Link>
  );

  const EventCard = ({ category, title, date, description }) => (
    <motion.div
      className="bg-[var(--dashboard-secondary-bg)] dashboard-glass rounded-xl shadow-glass border border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      <div className="p-1 bg-gradient-to-r from-[var(--dashboard-accent)] to-[var(--dashboard-highlight)]"></div>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-medium bg-[var(--dashboard-accent)]/20 text-[var(--dashboard-accent)] rounded-full mb-2">
              {category}
            </span>
            <h3 className="text-lg font-semibold text-[var(--dashboard-text-primary)]">{title}</h3>
          </div>
          <div className="bg-[var(--dashboard-accent)]/20 px-3 py-2 rounded-lg text-center">
            <span className="block text-lg font-bold text-[var(--dashboard-text-primary)]">{date.split(" ")[0]}</span>
            <span className="text-xs text-[var(--dashboard-text-secondary)]">{date.split(" ")[1]}</span>
          </div>
        </div>
        <p className="text-[var(--dashboard-text-secondary)] mt-3">{description}</p>
        <button className="mt-4 w-full bg-gradient-to-r from-[var(--dashboard-accent)] to-[var(--dashboard-highlight)] text-[var(--dashboard-text-primary)] py-2 rounded-md hover:from-[var(--dashboard-accent)]/80 hover:to-[var(--dashboard-highlight)]/80 transition duration-300 transform hover:scale-105">
          Register Now
        </button>
      </div>
    </motion.div>
  );

  // Function to get role-based header content
  const getRoleHeader = () => {
    if (loading) {
      return { title: "Loading...", description: "Please wait while we fetch your details." };
    }
    // Check if role exists and is a valid key in roleHeaders
    if (role && roleHeaders[role]) {
      return roleHeaders[role];
    }
    // Fallback to default if no role or invalid role
    return roleHeaders.default;
  };

  const { title, description } = getRoleHeader();

  return (
    <div className="flex flex-col items-center font-sans" style={{ backgroundColor: 'var(--dashboard-primary-bg)', color: 'var(--dashboard-text-primary)' }}>
      {/* Hero Section */}
      <motion.section
        className="relative w-full h-screen dashboard-full-bg brightness-90"
        style={{ backgroundImage: `url(${heroImage})` }}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--dashboard-primary-bg)]/95 via-[var(--dashboard-accent)]/10 to-[var(--dashboard-secondary-bg)]/70 dashboard-glass-light flex items-center justify-center">
          <div className="text-center max-w-4xl px-4 sm:px-6 lg:px-8 dashboard-text-bg">
            {/* Role-based Welcome Message */}
            <motion.p
              className="text-base sm:text-lg md:text-xl mb-4 font-medium text-[var(--dashboard-text-primary)] animate-fade-in drop-shadow-lg"
              variants={fadeIn}
            >
              {loading ? "Loading..." : user ? `Welcome, ${user.name || user.email}` : "Welcome to GCEK Placements"}
            </motion.p>
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-xl dashboard-text-glow"
              variants={fadeIn}
            >
              <span className="bg-gradient-to-r from-[var(--dashboard-accent)] to-[var(--dashboard-highlight)] bg-clip-text text-transparent">{title}</span>
            </motion.h1>
            <motion.p
              className="text-base sm:text-lg md:text-xl mb-8 font-light drop-shadow-lg max-w-2xl mx-auto text-[var(--dashboard-text-primary)]"
              variants={fadeIn}
            >
              {description}
            </motion.p>
            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={fadeIn}>
              <Link
                to="placementdata"
                spy={true}
                smooth={true}
                offset={-120}
                duration={800}
                className="relative bg-gradient-to-r from-[var(--dashboard-accent)] to-[var(--dashboard-highlight)] text-[var(--dashboard-text-primary)] px-6 py-3 rounded-md hover:from-[var(--dashboard-accent)]/80 hover:to-[var(--dashboard-highlight)]/80 transition duration-300 cursor-pointer shadow-glass hover:dashboard-glow transform hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10">Explore Placements</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--dashboard-accent)] to-[var(--dashboard-highlight)] opacity-0 hover:opacity-30 transition-opacity duration-300"></div>
              </Link>
              <Link
                to="contact"
                spy={true}
                smooth={true}
                offset={-120}
                duration={800}
                className="relative bg-transparent text-[var(--dashboard-text-primary)] border-2 border-[var(--dashboard-highlight)] px-6 py-3 rounded-md hover:bg-[var(--dashboard-highlight)]/20 transition duration-300 cursor-pointer shadow-glass hover:dashboard-glow transform hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10">Contact Us</span>
                <div className="absolute inset-0 bg-[var(--dashboard-highlight)] opacity-0 hover:opacity-30 transition-opacity duration-300"></div>
              </Link>
            </motion.div>
          </div>
        </div>
        <motion.div
          className="absolute bottom-8 left-0 right-0 flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Link to="quicklinks" spy={true} smooth={true} offset={-120} duration={800} className="text-[var(--dashboard-text-primary)] cursor-pointer">
            <ChevronDown size={36} className="drop-shadow-md" />
          </Link>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-4 -mt-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            icon={User}
            title="Placements"
            value="95%"
            subValue="↑ 5%"
            description="Placement rate for 2023-24"
          />
          <StatsCard
            icon={Building}
            title="Recruiters"
            value="50+"
            subValue="↑ 15%"
            description="Top companies visiting our campus"
          />
          <StatsCard
            icon={Briefcase}
            title="Highest Package"
            value="13.2"
            subValue="LPA"
            description="Sobha Developers, Dubai (2023-24)"
          />
        </div>
      </section>

      {/* Upcoming Placement Events Section */}
      <section className="py-16 w-full">
        <div className="max-w-5xl mx-auto px-4">
          <motion.h2
            className="text-3xl font-extrabold text-[var(--dashboard-text-primary)] bg-gradient-to-r from-[var(--dashboard-accent)] to-[var(--dashboard-highlight)] bg-clip-text text-transparent text-center mb-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            Upcoming Placement Events
          </motion.h2>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-[var(--dashboard-accent)] to-[var(--dashboard-highlight)] mx-auto mb-8"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                category={event.category}
                title={event.title}
                date={event.date}
                description={event.description}
              />
            ))}
            {upcomingEvents.length === 0 && (
              <p className="text-center text-[var(--dashboard-text-secondary)] col-span-full">
                No upcoming events scheduled. Check back later!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section id="quicklinks" className="py-20 text-center w-full">
        <motion.h2
          className="text-3xl font-extrabold text-[var(--dashboard-text-primary)] bg-gradient-to-r from-[var(--dashboard-accent)] to-[var(--dashboard-highlight)] bg-clip-text text-transparent mb-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          Discover More
        </motion.h2>
        <motion.div
          className="w-24 h-1 bg-gradient-to-r from-[var(--dashboard-accent)] to-[var(--dashboard-highlight)] mx-auto mb-8"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
          <QuickLinkCard
            to="recruiters"
            icon={Building}
            title="Our Recruiters"
            description="Meet the industry leaders that trust GCEK talent."
          />
          <QuickLinkCard
            to="placementdata"
            icon={Briefcase}
            title="Placement Data"
            description="Explore detailed placement statistics and success stories."
          />
          <QuickLinkCard
            to="contact"
            icon={Mail}
            title="Contact Us"
            description="Reach out to our placement cell for inquiries."
          />
        </div>
      </section>
    </div>
  );
};

export default Home;