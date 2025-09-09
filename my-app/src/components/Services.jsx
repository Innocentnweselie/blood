import React from "react";

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
    <section className="bg-blue-100 py-16 px-6 md:px-20">
      <h2 className="text-center text-3xl md:text-4xl font-bold mb-6 text-blue-700">
        {title}
      </h2>
      <p className="text-center max-w-2xl mx-auto mb-12 text-gray-700">
        {description}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center text-center bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <img
              src={service.img}
              alt={service.alt}
              className="h-28 w-28 object-contain mb-4"
            />
            <p className="text-sm text-gray-700">{service.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
