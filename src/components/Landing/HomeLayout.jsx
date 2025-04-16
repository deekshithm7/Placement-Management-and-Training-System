import React, { useState, useEffect, lazy, Suspense } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Link, Element } from "react-scroll";
import { Home, Users, Calendar, BookOpen, Mail, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/gcek-transparent.png";

const Home1 = lazy(() => import("./Home"));
const PlacementDataPage = lazy(() => import("./PlacementData"));
const Recruiters = lazy(() => import("./Recruiters"));
const Gallery = lazy(() => import("./Gallery"));
const Procedure = lazy(() => import("./Procedure"));
const Testimonial = lazy(() => import("./Testimonial"));
const ContactUs = lazy(() => import("./Contact"));

const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary-accent)]"></div>
  </div>
);

const NavItem = ({ item, isActive, onClick }) => (
  <motion.div className="relative group" whileHover={{ scale: 1.05 }}>
    <Link
      to={item.href}
      spy={true}
      smooth={true}
      offset={-100}
      duration={800}
      className={`font-medium transition duration-300 flex items-center gap-2 text-sm ${
        isActive ? 'text-[var(--primary-accent)]' : 'text-[var(--primary-text)] opacity-90 hover:opacity-100'
      }`}
      onClick={onClick}
    >
      <item.icon className="w-4 h-4" />
      <span>{item.label}</span>
    </Link>
    <motion.div
      className="absolute bottom-0 left-0 h-0.5 bg-[var(--primary-accent)] rounded-full"
      initial={{ width: 0 }}
      animate={{ width: isActive ? "100%" : 0 }}
      whileHover={{ width: "100%" }}
    />
  </motion.div>
);

const HomeLayout = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { label: "Home", icon: Home, href: "home" },
    { label: "Placement Data", icon: Users, href: "placementdata" },
    { label: "Recruiters", icon: Calendar, href: "recruiters" },
    { label: "Gallery", icon: BookOpen, href: "gallery" },
    { label: "Procedure", icon: BookOpen, href: "procedure" },
    { label: "Testimonials", icon: Users, href: "testimonial" },
    { label: "Contact", icon: Mail, href: "contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : 'unset';
  };

  return (
    <div className="min-h-screen text-[var(--primary-text)] bg-[var(--primary-bg)]">
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-300 backdrop-blur-md ${
          isScrolled ? "bg-[var(--header-bg)]/95 shadow-lg" : "bg-[var(--header-bg)]/70"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div className="flex items-center space-x-3" whileHover={{ scale: 1.05 }}>
              <img src={logo} alt="GCEK Logo" className="h-12 w-12 object-contain rounded-full" />
              <h1 className="text-lg font-semibold text-[var(--primary-text)] hidden sm:block">Placement Cell</h1>
            </motion.div>

            <nav className="hidden lg:flex space-x-8">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  isActive={activeSection === item.href}
                  onClick={() => setActiveSection(item.href)}
                />
              ))}
            </nav>

            <RouterLink to="/login">
              <motion.button
                className="bg-[var(--primary-accent)] text-white px-5 py-2 rounded-full font-medium hover:bg-[var(--secondary-accent)] transition-all duration-300 text-sm"
                whileHover={{ scale: 1.05 }}
              >
                Login
              </motion.button>
            </RouterLink>

            <button
              className="lg:hidden p-2 rounded-md hover:bg-white/10"
              onClick={handleMenuToggle}
            >
              {isMenuOpen ? <X size={24} className="text-[var(--primary-text)]" /> : <Menu size={24} className="text-[var(--primary-text)]" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden bg-[var(--header-bg)]/95 shadow-lg"
            >
              <nav className="px-4 py-4 space-y-4">
                {navItems.map((item) => (
                  <NavItem
                    key={item.href}
                    item={item}
                    isActive={activeSection === item.href}
                    onClick={() => {
                      setActiveSection(item.href);
                      handleMenuToggle();
                    }}
                  />
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="pt-20">
        <Suspense fallback={<LoadingSpinner />}>
          {navItems.map((item) => (
            <Element key={item.href} name={item.href} id={item.href}>
              {item.href === "home" && <Home1 />}
              {item.href === "placementdata" && <PlacementDataPage />}
              {item.href === "recruiters" && <Recruiters />}
              {item.href === "gallery" && <Gallery />}
              {item.href === "procedure" && <Procedure />}
              {item.href === "testimonial" && <Testimonial />}
              {item.href === "contact" && <ContactUs />}
            </Element>
          ))}
        </Suspense>
      </main>
    </div>
  );
};

export default HomeLayout;