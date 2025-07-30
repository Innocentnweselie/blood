import { motion } from 'framer-motion'
import { Link } from 'react-router-dom';

const nav = [
  { label: 'Dashboard', to: '/' },
  { label: 'Inventory', to: '/supplier' },
  { label: 'Reports', to: '/report' },
  { label: 'Settings', to: '/settings' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
      <div className="h-16 flex items-center justify-center border-b">
        <span className="text-primary-600 font-bold text-lg">MedStock</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map((n) => (
          <motion.div key={n.label} whileHover={{ x: 4 }}>
            <Link
              to={n.to}
              className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
            >
              {n.label}
            </Link>
          </motion.div>
        ))}
      </nav>
      <div className="p-4 text-xs text-gray-400">v0.2.0</div>
    </aside>
  )
}
