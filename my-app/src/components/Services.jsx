import React from "react";
import { motion } from "framer-motion";

// Props: title, description, services (array of {img, alt, text})
const Services = ({
  title = "Our Services",
  description =
    "We provide personalized medication reminders, and tracking to help you stay on top of your treatment plan. With features like customizable reminders, medication database, and secure data storage, MedTracker empowers you to take control of your health and achieve better outcomes.",
  services = [
    {
      img: "/analysis.webp",
      alt: "Reporting and Analytics",
      text:
        "Reporting and Analytics provides valuable insights into medication adherence and patient outcomes, enabling healthcare professionals to optimize treatment plans and improve care.",
    },
    {
      img: "/data sec.jpg",
      alt: "Data Security",
      text:
        "Ensures data security and integrity through robust encryption, authentication, and automated backup systems.",
    },
    {
      img: "/expiry.png",
      alt: "Expiry Tracker",
      text:
        "MedTracker's expiry tracker ensures you stay on top of medication expiration dates, sending timely reminders to refill or replace medications, and helping you maintain an uninterrupted plan.",
    },
  ],
}) => {
  return (
    <section className="bg-blue-100 py-12 sm:py-16 px-4 sm:px-8 md:px-20">
      {/* Title */}
      <motion.h2
        className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-blue-700"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {title}
      </motion.h2>

      {/* Description */}
      <motion.p
        className="text-center text-gray-700 text-sm sm:text-base max-w-2xl mx-auto mb-10 sm:mb-12 px-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {description}
      </motion.p>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {services.map((service, idx) => (
          <motion.div
            key={idx}
            className="flex flex-col items-center text-center bg-white rounded-xl shadow-md p-6 transition duration-300"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: idx * 0.2 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.15), 0px 0px 20px rgba(59, 130, 246, 0.3)", // blue glow + soft shadow
            }}
          >
            <img
              src={service.img}
              alt={service.alt}
              className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 object-contain mb-4"
            />
            <p className="text-sm sm:text-base text-gray-700">{service.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Services;

