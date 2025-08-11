
import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">About MedTracker</h1>
        <p className="text-lg text-black mb-4">
          MedTracker is a modern medical stock management platform designed to help healthcare facilities efficiently monitor and manage their medical inventory.
        </p>
        <ul className="list-disc pl-6 text-black mb-4">
          <li>Real-time inventory monitoring</li>
          <li>Expiry date tracking and notifications</li>
          <li>Low-stock alerts</li>
          <li>Comprehensive reporting tools</li>
          <li>Secure and user-friendly interface</li>
        </ul>
        <p className="text-md text-black">
          Our mission is to streamline healthcare supply management, reduce waste, and improve patient care by providing reliable and easy-to-use inventory solutions.
        </p>
      </div>
    </div>
  );
}
