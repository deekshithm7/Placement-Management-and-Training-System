import React from "react";
import { motion } from "framer-motion";
import placeproc from "../../assets/placeproc.png";

const Procedure = () => {
  return (
    <section className="py-20 bg-[var(--primary-bg)]">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
        <motion.h1
          className="text-4xl font-bold text-[var(--primary-text)] text-center mb-12 bg-gradient-to-r from-[var(--primary-accent)] to-[var(--secondary-accent)] bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          Placement Procedure
        </motion.h1>
        <motion.div
          className="bg-[var(--secondary-bg)] rounded-xl shadow-lg shadow-blue-100/20 border border-[var(--primary-accent)]/10 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(30, 64, 175, 0.2)" }}
        >
          <img 
            src={placeproc} 
            alt="Placement Procedure" 
            className="w-full object-contain" 
            loading="lazy" 
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Procedure;