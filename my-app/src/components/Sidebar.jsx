import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';

const nav = [
  { label: 'Dashboard', to: '/' },
  { label: 'Inventory', to: '/inventory' },
  { label: 'Suppliers', to: '/suppliers' },
  { label: 'Reports', to: '/report' },
  { label: 'Settings', to: '/settings' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="flex items-center justify-between md:hidden bg-white border-b border-gray-200 h-16 px-4">
        <span className="text-primary-600 font-bold text-lg">MedStock</span>
        <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
          {isOpen ? <HiX size={28} /> : <HiMenu size={28} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed z-30 top-0 left-0 h-full w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:flex md:flex-col
        `}
      >
        {/* Logo / Header */}
        <div className="h-16 flex items-center justify-center border-b">
          <span className="text-primary-600 font-bold text-lg">MedStock</span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((n) => (
            <motion.div key={n.label} whileHover={{ x: 4 }}>
              <Link
                to={n.to}
                className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                onClick={() => setIsOpen(false)} // close sidebar after click on mobile
              >
                {n.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 text-xs text-gray-400">v0.2.0</div>
      </aside>
    </>
  );
}
