import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-white p-4">
      {/* Text Section */}
      <div className="md:w-1/2 w-full bg-white rounded-2xl shadow-md p-6 mb-6 md:mb-0 md:mr-4">
        <h1 className="text-3xl font-bold text-blue-700 mb-4 text-center md:text-left">
          About MedTracker
        </h1>
        <p className="text-lg text-black mb-4 text-justify">
          MedTracker is a modern medical stock management platform designed to help
          healthcare facilities efficiently monitor and manage their medical inventory.
        </p>
        <ul className="list-disc pl-6 text-black mb-4">
          <li>Real-time inventory monitoring</li>
          <li>Expiry date tracking and notifications</li>
          <li>Low-stock alerts</li>
          <li>Comprehensive reporting tools</li>
          <li>Secure and user-friendly interface</li>
        </ul>
        <p className="text-md text-black text-justify">
          Our mission is to streamline healthcare supply management, reduce waste, and
          improve patient care by providing reliable and easy-to-use inventory solutions.
        </p>
      </div>

      {/* Image Section */}
      <div className="md:w-1/2 w-full flex justify-center">
        <img
          src="/about pic.jpg"
          alt="nurse on duty/about picture"
          className="w-full h-auto max-w-md rounded-2xl object-cover"
        />
      </div>
    </div>
  );
}

