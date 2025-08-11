import React from 'react';

export default function Contact() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Contact Us</h1>
        <p className="text-lg text-black mb-4">
          Have questions or need support? Reach out to the MedTracker team!
        </p>
        <ul className="list-disc pl-6 text-black mb-4">
          <li>Email: <a href="mailto:support@medtracker.com" className="text-blue-600 underline">support@medtracker.com</a></li>
          <li>Phone: <span className="text-blue-600">(+237) 670661722</span></li>
          <li>Address: 123 Health St, Wellness City, Cameroon</li>
        </ul>
        <p className="text-md text-black">
          We aim to respond to all inquiries within 24 hours.
        </p>
      </div>
    </div>
  );
}
