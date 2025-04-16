import React from "react";
import { motion } from "framer-motion";
const images = import.meta.glob("/src/assets/recruiters/*.{png,jpg,jpeg}", { eager: true });

const Recruiters = () => {
  return (
    <motion.section
      className="py-16 bg-[var(--primary-bg)] font-[Inter,Poppins,sans-serif]"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-4xl font-bold text-[var(--primary-text)] text-center mb-12 tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Our Recruiters
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Object.values(images).map((img, index) => (
            <motion.div
              key={index}
              className="bg-[var(--secondary-bg)] rounded-xl p-4 border border-blue-200"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px -15px rgba(30, 64, 175, 0.3)" }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <img
                src={img.default}
                alt={`Recruiter ${index + 1}`}
                className="w-full h-24 object-contain rounded-lg"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default React.memo(Recruiters);