import React from "react";
import { motion } from "framer-motion";
const images = import.meta.glob("/src/assets/gallery/*.jpg", { eager: true });

const Gallery = () => {
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
          Career Guidance and Placement Unit Gallery
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Object.values(images).map((img, index) => (
            <motion.div
              key={index}
              className="relative rounded-xl shadow-md bg-[var(--secondary-bg)] border border-blue-200"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px -15px rgba(30, 64, 175, 0.3)" }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <img
                src={img.default}
                alt={`Gallery Image ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
                loading="lazy"
                style={{ filter: "blur(10px)" }}
                onLoad={(e) => (e.target.style.filter = "blur(0)")}
              />
              <div className="absolute inset-0 bg-[var(--primary-accent)]/10 opacity-0 hover:opacity-50 transition-opacity duration-300 rounded-lg"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default React.memo(Gallery);