import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // For making API calls

export default function Contact() {
  // State to hold form values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null); // To hold success or error status

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Prepare the data to be sent
    const formData = {
      name,
      email,
      message
    };

    try {
      // Send POST request to backend using a relative path so Vite dev proxy works
        const response = await axios.post('/api/contact', formData);

      // Show success message
      setStatus('Message sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      // Handle error
      setStatus('Failed to send message. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-blue-100 p-4">
      {/* Go Back Home Button */}
      <div className="w-full flex justify-start mb-3">
        <Link
          to="/"
          className="px-2 py-1 bg-blue-700 text-white text-sm rounded-lg shadow-md hover:bg-blue-800 transition"
        >
          ⬅ Home
        </Link>
      </div>

      <div className="flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">Contact Us</h1>

          <p className="text-lg text-black mb-4">
            Have questions or need support? Reach out to the MedTracker team!
          </p>

          {status && (
            <p className="text-lg mb-4 text-center text-green-600">{status}</p>
          )}

          {/* Contact Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-lg font-medium text-black">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Your Name"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-lg font-medium text-black">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Your Email"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-lg font-medium text-black">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Your Message"
                rows="5"
                required
              />
            </div>

            <div className="mb-4 text-center">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


