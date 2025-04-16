import React, { useState, useEffect } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Link, Element, scroller } from "react-scroll";
import { Home, Users, Calendar, BookOpen, Mail } from "lucide-react";
import { motion } from "framer-motion";
import logo from "../../assets/gcek-transparent.png";
import Home1 from "./Home";
import PlacementDataPage from "./PlacementData";
import Recruiters from "./Recruiters";
import Gallery from "./Gallery";
import Procedure from "./Procedure";
import Testimonial from "./Testimonial";
import ContactUs from "./Contact";

const HomeLayout = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: "Home", icon: Home, href: "" },
    { label: "Placement Data", icon: Users, href: "placementdata" },
    { label: "Recruiters", icon: Calendar, href: "recruiters" },
    { label: "Gallery", icon: BookOpen, href: "gallery" },
    { label: "Procedure", icon: Mail, href: "procedure" },
    { label: "Testimonials", icon: Mail, href: "testimonial" },
    { label: "Contact", icon: Mail, href: "contact" },
  ];

  useEffect(() => {
    const section = location.hash.replace("#", "");
    if (section) {
      scroller.scrollTo(section, { duration: 800, smooth: "easeInOutQuart" });
      setActiveSection(section);
    }
  }, [location]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActiveSection(entry.target.id)),
      { threshold: 0.5 }
    );
    navItems.forEach((item) => {
      const section = document.getElementById(item.href);
      if (section) observer.observe(section);
    });
    return () => navItems.forEach((item) => document.getElementById(item.href) && observer.unobserve(document.getElementById(item.href)));
  }, [navItems]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((window.scrollY / totalHeight) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen text-gray-100 bg-gray-900 flex flex-col">
      {/* Main content area, no extra padding or margin */}
      <div className="flex-1 flex flex-col">
        {/* Secondary Header - Fixed below the real header and to the right of the sidebar */}
        <header
          className={`fixed top-16 left-64 w-[calc(100%-16rem)] bg-gray-800/95 backdrop-blur-md py-4 shadow-lg transition-all duration-300 z-30 ${
            isScrolled ? "shadow-xl" : "shadow-md"
          } lg:left-64 lg:w-[calc(100%-16rem)]`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <motion.div key={item.label} className="relative group" whileHover={{ scale: 1.05 }}>
                  <Link
                    to={item.href}
                    spy={true}
                    smooth={true}
                    offset={-64} // Matches the header height (approx. 4rem)
                    duration={800}
                    className="font-medium text-gray-300 hover:text-teal-400 transition duration-300 flex items-center"
                    onSetActive={() => setActiveSection(item.href)}
                  >
                    <item.icon className="w-4 h-4 mr-1.5" />
                    {item.label}
                  </Link>
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-teal-400 rounded-full"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              ))}
            </nav>
            <button
              className="md:hidden text-gray-300 focus:outline-none z-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
          <motion.div
            className="h-1 bg-teal-400 absolute bottom-0 left-0"
            style={{ width: `${scrollProgress}%`, transition: "width 0.3s ease" }}
          />
          {isMenuOpen && (
            <motion.div
              className="md:hidden bg-gray-800 shadow-md z-10 absolute top-full left-0 w-full"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    spy={true}
                    smooth={true}
                    offset={-64}
                    duration={800}
                    className="block text-gray-300 font-medium hover:text-teal-400 transition-colors duration-300 py-2"
                    onSetActive={() => {
                      setActiveSection(item.href);
                      setIsMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </header>

        {/* Main content with no padding */}
        <main id="main-content" className="flex-1">
          <Element name="home" id="home"><Home1 /></Element>
          <Element name="placementdata" id="placementdata"><PlacementDataPage /></Element>
          <Element name="recruiters" id="recruiters"><Recruiters /></Element>
          <Element name="gallery" id="gallery"><Gallery /></Element>
          <Element name="procedure" id="procedure"><Procedure /></Element>
          <Element name="testimonial" id="testimonial"><Testimonial /></Element>
          <Element name="contact" id="contact"><ContactUs /></Element>
        </main>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-gray-800 mt-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-100 mb-4">About Us</h3>
              <p className="text-gray-400">Government College of Engineering Kannur - Placement Cell</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-100 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <motion.li key={item.label} whileHover={{ x: 5 }}>
                    <Link
                      to={item.href}
                      smooth={true}
                      offset={-64}
                      duration={800}
                      className="text-gray-400 hover:text-teal-400 transition-colors duration-300"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-100 mb-4">Connect</h3>
              <div className="flex space-x-4">
                <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-teal-400">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.79 1.77-1.73V1.73C24 .77 23.21 0 22.23 0zM7.06 20.46H3.55V9h3.51v11.46zm-1.75-13c-1.16 0-2.1-.94-2.1-2.1 0-1.16.94-2.1 2.1-2.1 1.16 0 2.1.94 2.1 2.1 0 1.16-.94 2.1-2.1 2.1zm13.41 13H14.94V14c0-.81-.02-1.85-1.13-1.85-1.13 0-1.3.88-1.3 1.79v6.52H9.55V9h3.36v1.54c.47-1.12 1.65-1.13 2.06-1.13 2.2 0 2.61 1.45 2.61 3.33v6.72z"/>
                  </svg>
                </motion.a>
                <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-teal-400">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </motion.a>
              </div>
            </div>
          </div>
          <motion.div
            className="mt-8 text-center text-gray-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p>© 2025 Govt. College of Engineering Kannur. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default HomeLayout;