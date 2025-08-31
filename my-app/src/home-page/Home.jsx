

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  // Simulate authentication state (replace with real auth logic)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const navigate = useNavigate();

  // Handler for protected navigation
  const handleProtectedNav = (e, path) => {
    if (!isLoggedIn) {
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-wwhite flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="text-xl font-bold">MedTracker</div>
        <div className="flex gap-6 items-center relative">
          <Link to="/" className="hover:text-black">Home</Link>
          {/* Login/Sign-up Dropdown replaced with navigation links */}
          <div className="relative group">
            <button className="hover:text-black focus:outline-none">Login / Sign Up</button>
            <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg p-2 z-10 hidden group-hover:block group-focus:block">
              <Link to="/login" className="block px-4 py-2 hover:bg-blue-100 rounded">Login</Link>
              <Link to="/sign-up" className="block px-4 py-2 hover:bg-blue-100 rounded">Sign Up</Link>
            </div>
          </div>
          <Link to="/about" className="hover:text-black">About</Link>
          <Link to="/contact" className="hover:text-black">Contact</Link>
        </div>
      </nav>


<div className=' mt-50 ml-13 absolute '>
  <h2 className='font-bold text-5xl leading-12'>Medication<span className='text-blue-700'> Management,</span> <br></br>Simplified. <br></br><span className='text-blue-700'>Reminding </span>You To <span className='text-blue-700'>Care</span></h2>
  <p className='text-1xl font-sans font-semibold mt-5'>Easily manage your medical inventory, track stock levels in real-time,<br></br> monitor expiry dates, receive low-stock alerts, and generate <br></br>comprehensive reports for efficient healthcare supply management.</p>

  <div className='bg-blue-700 text-white px-10 py-4 rounded-2xl w-35 mt-6 hover:bg-black'>
    <Link href="/sign-up" onClick={(e) => handleProtectedNav(e, '/sign-up')}>
    <button>Register</button>
    </Link>
  </div>
</div>

      <div>
        <img src="/Hero pic.jpg" alt="a picture of a doctor planning a patient's treatment "  className='ml-130 h-140 mb-4'/>
      </div>

{/* about section */}

<section className='bg-blue-100'>
    <main className="flex-1 flex flex-col items-center justify-center">
        {/* Animated Heartbeat (EKG) Line with Medical Cross  */}
        <div className="mb-8 mt-15 flex flex-col items-center">
          <svg width="320" height="90" viewBox="0 0 320 90" fill="none" xmlns="http://www.w3.org/2000/svg">
             EKG Line 
            <polyline
              id="ekg-line"
              points="0,45 40,45 55,65 70,25 90,70 110,45 140,45 160,30 175,60 190,45 320,45"
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeLinejoin="round"
              strokeLinecap="round"
            >
              <animate attributeName="stroke-dasharray" values="0,1000;400,1000" dur="2s" repeatCount="indefinite" />
              <animate attributeName="stroke-dashoffset" values="400;0" dur="2s" repeatCount="indefinite" />
            </polyline>
             Medical Cross 
            <g>
              <rect x="270" y="25" width="30" height="30" rx="6" fill="#fff" stroke="#2563eb" strokeWidth="3" />
              <rect x="282" y="33" width="6" height="18" rx="2" fill="#2563eb" />
              <rect x="276" y="39" width="18" height="6" rx="2" fill="#2563eb" />
            </g>
          </svg>
          <span className="text-blue-700 font-semibold mt-2">Real-time Medical Stock Monitoring</span>
        </div>
        <h1 className="text-4xl font-bold text-blue-700 mb-3 ">Welcome to MedTracker</h1>
        <p className="text-lg text-black mb-10 text-center">Easily manage your medical inventory, track stock levels in real-time,<br></br> monitor expiry dates, receive low-stock alerts, and generate <br></br>comprehensive reports for efficient healthcare supply management.</p>
         {/* Main Content restored to original  */}
      </main>    
</section>

       <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-xl w-100 bg-white rounded-l-2xl shadow-md p-6">
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

      <div>
        <img src="/about pic.jpg" alt="nurse on duty/about picture" className='h-115 w-90 rounded-r-2xl mr-1' />
      </div>
    </div>

      {/* Main Content 
      <main className="flex-1 flex flex-col items-center justify-center">
        {/* Animated Heartbeat (EKG) Line with Medical Cross 
        <div className="mb-8 mt-10 flex flex-col items-center">
          <svg width="320" height="90" viewBox="0 0 320 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* EKG Line 
            <polyline
              id="ekg-line"
              points="0,45 40,45 55,65 70,25 90,70 110,45 140,45 160,30 175,60 190,45 320,45"
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeLinejoin="round"
              strokeLinecap="round"
            >
              <animate attributeName="stroke-dasharray" values="0,1000;400,1000" dur="2s" repeatCount="indefinite" />
              <animate attributeName="stroke-dashoffset" values="400;0" dur="2s" repeatCount="indefinite" />
            </polyline>
            {/* Medical Cross 
            <g>
              <rect x="270" y="25" width="30" height="30" rx="6" fill="#fff" stroke="#2563eb" strokeWidth="3" />
              <rect x="282" y="33" width="6" height="18" rx="2" fill="#2563eb" />
              <rect x="276" y="39" width="18" height="6" rx="2" fill="#2563eb" />
            </g>
          </svg>
          <span className="text-blue-700 font-semibold mt-2">Real-time Medical Stock Monitoring</span>
        </div>*
        <h1 className="text-4xl font-bold text-blue-800 mb-4 mt-2">Welcome to MedTracker</h1>
        <p className="text-lg text-black mb-8">Easily manage your medical inventory, track stock levels in real-time,<br></br> monitor expiry dates, receive low-stock alerts, and generate <br></br>comprehensive reports for efficient healthcare supply management.</p>
        {/* Main Content restored to original 
      </main>*/}


      {/* service section */}
      <section className='bg-blue-100'>
        <h2 className='text-center text-4xl font-bold mb-4 text-blue-700 '>Our Services</h2>
        <p className='text-center font-serif '>We provides pesonalized medication reminders, and tracking to help you stay on top of your <br></br>treatment plan. With features likes customizable reminders, medication database, and secure<br></br> data storage, MedTracker empowers you to take controle of your <br></br>health and achieve better outcome.</p>
         <div className='grid grid-cols-3 gap-2 p-10'>
        <div>
          <img src="/analysis.webp" alt="" className=" h-30 max-w-xl ml-39" />
          <p className='w-60 ml-24'>Reporting and Analytics provides valuable insights into medication adherence and patient outcomes, enabling healthcare professionals to optimize treatment plans and improve care.</p>
        </div>

        <div>
          <img src="/data sec.jpg" alt="" className=" h-30 max-w-40 ml-20" />
          <p className='w-70 ml-10'>Ensures data security and integrity through robust encryption, authentication, and automated backup systems</p>
        </div>

        <div>
          <img src="/expiry.png" alt="" className=" h-30 max-w-xl ml-20" />
          <p className='w-80 ml-5'>MedTracker's expiry tracker ensures you stay on top of medication expiration dates, sending timely reminders to refill or replace medications, and helping you maintain an uninterrupted plan.</p>
        </div>
        </div>
      </section>

      <section>
        <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-xl w-full bg-blue-100 rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Contact Us</h1>
        <p className="text-lg text-black mb-4">
          Get in touch with us! Our team is here to answer your questions and provide support, and help you get the most out of MedTracker. Send us a message and we'll respond promptly  
        </p>
        <ul className="list-disc pl-6 text-black mb-4">
          <li>Email: <a href="mailto:support@medtracker.com" className="text-blue-600 underline">ngwainnocentnweselie3@gmail.com</a></li>
          <li>Phone: <span className="text-blue-600">(+237) 670661722</span></li>
          <li>Address: 123 Health St, Wellness City, Cameroon</li>
        </ul>
        <p className="text-md text-black">
          We aim to respond to all inquiries within 24 hours.
        </p>
      </div>
    </div>
      </section>
{/* footer */}
  <footer className="w-full bg-blue-700 text-white py-5 mt-12">
   <div className="mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-8">
        {/* Brand Info */}
        <div>
          <h2 className="text-2xl font-bold text-white">MedTracker</h2>
          <p className="mt-3 text-sm text-white">
            Easily manage your medical inventory, track stock, and generate reports
            with smart alerts to avoid shortages or expired items.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/services" className="hover:text-white">Services</a></li>
            <li><a href="/reports" className="hover:text-white">Reports</a></li>
            <li><a href="/contact" className="hover:text-white">Contact</a></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Our Services</h3>
          <ul className="space-y-2 text-sm">
            <li>Inventory Management</li>
            <li>Expiry & Stock Alerts</li>
            <li>Reports & Analytics</li>
            <li>Supplier Management</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Contact Us</h3>
          <p className="text-sm">Email: ngwainnocentnweselie3@gmail.com</p>
          <p className="text-sm">Phone: +237 670-661-722</p>
        </div>
      </div>
  </footer>
  <div className='text-black text-center p-3 bg-blue-900'>
    &copy; 2024 MedTracker. All rights reserved.
  </div>
</div>
  )

}

