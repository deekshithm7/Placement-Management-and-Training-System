import React from "react";
import { motion } from "framer-motion";

const ContactUs = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, duration: 0.8 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.section
      className="py-20 bg-gray-900 font-[Poppins,sans-serif]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.h2
          className="text-3xl md:text-4xl font-semibold text-gray-100 mb-12 text-center tracking-tight"
          variants={itemVariants}
        >
          Get in Touch
        </motion.h2>

        <motion.div
          className="bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-700 hover:shadow-xl transition-shadow duration-300"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-xl font-medium text-gray-200 mb-2">Coordinator</h3>
          <p className="text-lg text-gray-300 mb-6">Dr. Nidheesh N</p>

          <div className="space-y-4 text-gray-300">
            <motion.p
              className="flex items-center gap-3"
              whileHover={{ x: 5, color: "#10B981" }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-teal-400 font-medium">Phone:</span>
              <a href="tel:+919400102589" className="hover:text-teal-400 transition-colors duration-300">
                +91 9400102589
              </a>
            </motion.p>
            <motion.p
              className="flex flex-wrap gap-3"
              whileHover={{ x: 5, color: "#10B981" }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-teal-400 font-medium">Email:</span>
              <a href="mailto:placements@gcek.ac.in" className="hover:text-teal-400 transition-colors duration-300">
                placements@gcek.ac.in
              </a>
              <span className="text-gray-500">|</span>
              <a href="mailto:nidheesh.n@gcek.ac.in" className="hover:text-teal-400 transition-colors duration-300">
                nidheesh.n@gcek.ac.in
              </a>
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          className="mt-10 text-gray-400 text-center space-y-3"
          variants={itemVariants}
        >
          <p className="font-medium text-gray-200">Dr. Nidheesh N</p>
          <p>Career Guidance and Placement Unit (CGPU)</p>
          <p>Govt. College of Engineering Kannur</p>
          <p>Dharmasala, Kannur, Kerala 670563</p>
          <a
            href="https://maps.google.com/?q=Government+College+of+Engineering+Kannur"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-teal-400 hover:text-teal-500 transition-colors duration-300"
          >
            View on Map
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default React.memo(ContactUs);