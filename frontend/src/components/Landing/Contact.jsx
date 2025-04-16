import React from "react";
import { motion } from "framer-motion";

const ContactUs = () => {
  return (
    <section className="py-20 bg-[var(--primary-bg)]">
      <div className="max-w-2xl mx-auto px-4">
        <motion.h2
          className="text-4xl font-bold text-[var(--primary-text)] text-center mb-12 bg-gradient-to-r from-[var(--primary-accent)] to-[var(--secondary-accent)] bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          Contact Our Placement Cell
        </motion.h2>
        <motion.div
          className="bg-[var(--secondary-bg)] p-8 rounded-xl shadow-lg border border-[var(--primary-accent)]/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-2xl font-semibold text-[var(--primary-text)] mb-4">Coordinator</h3>
              <p className="text-lg font-medium text-[var(--primary-accent)] mb-4">Dr. Nidheesh N</p>
              <div className="space-y-3 text-[var(--secondary-text)]">
                <p>
                  <strong>Phone:</strong>{" "}
                  <motion.a
                    href="tel:+919400102589"
                    className="text-[var(--link-text)] hover:text-[var(--secondary-accent)] transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    +91 9400102589
                  </motion.a>
                </p>
                <p><strong>Email:</strong></p>
                <div className="space-y-2">
                  <motion.a
                    href="mailto:placements@gcek.ac.in"
                    className="text-[var(--link-text)] hover:text-[var(--secondary-accent)] transition-colors block"
                    whileHover={{ scale: 1.05 }}
                  >
                    placements@gcek.ac.in
                  </motion.a>
                  <motion.a
                    href="mailto:nidheesh.n@gcek.ac.in"
                    className="text-[var(--link-text)] hover:text-[var(--secondary-accent)] transition-colors block"
                    whileHover={{ scale: 1.05 }}
                  >
                    nidheesh.n@gcek.ac.in
                  </motion.a>
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-0 text-[var(--secondary-text)] space-y-2">
              <p className="font-semibold text-lg">Mailing Address</p>
              <p>Dr. Nidheesh N</p>
              <p>Coordinator, Career Guidance and Placement Unit</p>
              <p>Govt. College of Engineering Kannur</p>
              <p>Dharmasala 670563</p>
              <p>Kannur, Kerala</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactUs;