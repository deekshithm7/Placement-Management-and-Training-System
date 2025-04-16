import React from "react";
import { motion } from "framer-motion";
import placeproc from "../../assets/placeproc.png";

const Procedure = () => {
  return (
    <motion.section
      className="py-16 bg-[var(--primary-bg)] font-[Inter,Poppins,sans-serif]"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="container mx-auto px-4 flex flex-col items-center justify-center">
        <motion.h1
          className="text-4xl font-bold text-[var(--primary-text)] text-center mb-12 tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Procedure
        </motion.h1>
        <motion.img
          src={placeproc}
          alt="placement procedure"
          className="max-w-full h-auto rounded-xl shadow-md border border-blue-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -15px rgba(30, 64, 175, 0.3)" }}
          transition={{ duration: 0.4 }}
          loading="lazy"
        />
      </div>
    </motion.section>
  );
};

export default React.memo(Procedure);