import React from "react";

const Reviews = () => (
  <section className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
    <h2 className="text-center text-3xl sm:text-4xl font-bold mb-4 text-blue-700">
      What Our Users Say
    </h2>
    <p className="text-center font-serif mb-10 max-w-3xl mx-auto text-sm sm:text-base">
      Hear from our satisfied users who have experienced the benefits of
      MedTracker in managing their medical inventory and improving patient care.
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      <div className="bg-blue-100 p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <p className="mb-4 text-sm sm:text-base">
          "MedTracker has revolutionized the way we manage our medical supplies. The real-time tracking and low-stock alerts have significantly reduced shortages and improved patient care."
        </p>
        <h3 className="font-bold text-sm sm:text-base">- Dr. Mundi Sarah.</h3>
      </div>

      <div className="bg-blue-100 p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <p className="mb-4 text-sm sm:text-base">
          "The expiry date tracking feature is a game-changer. It has helped us minimize waste and ensure that our patients always receive safe and effective medications."
        </p>
        <h3 className="font-bold text-sm sm:text-base">
          - Ngwa Blaise. Pharmacist
        </h3>
      </div>

      <div className="bg-blue-100 p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <p className="mb-4 text-sm sm:text-base">
          "As a healthcare administrator, MedTracker's reporting tools have provided invaluable insights into our inventory management practices, allowing us to make data-driven decisions."
        </p>
        <h3 className="font-bold text-sm sm:text-base">- Che Desmond.</h3>
      </div>
    </div>
  </section>
);

export default Reviews;
