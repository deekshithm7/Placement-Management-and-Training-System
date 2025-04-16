import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary-bg text-text-primary py-4 sm:py-6 border-t border-gray-700 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <p className="text-xs sm:text-sm text-text-secondary">
            © {currentYear} Placement Management and Training System. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <a
              href="/about"
              className="text-text-secondary hover:text-accent text-xs sm:text-sm font-medium transition-all duration-300 ease-in-out hover:underline"
              aria-label="About page"
            >
              About
            </a>
            <a
              href="/contact"
              className="text-text-secondary hover:text-accent text-xs sm:text-sm font-medium transition-all duration-300 ease-in-out hover:underline"
              aria-label="Contact page"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;