import React from 'react';
import { Link } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  // Summary card data
  const cards = [
    { title: 'Total Stock', count: 450, color: 'bg-blue-600' },
    { title: 'Low Stock', count: 200, color: 'bg-yellow-400' },
    { title: 'Out of Stock', count: 300, color: 'bg-red-600' },
    { title: 'Expiring Soon', count: 150, color: 'bg-orange-500' },
  ];

  const inventory = [
    { name: 'Paracetamol', quantity: 40, expirationDate: '2024-01-01', supplier: 'HealthCop' },
    { name: 'Syringes', quantity: 20, expirationDate: '2026-04-10', supplier: 'MediSupply' },
    { name: 'Gloves', quantity: 10, expirationDate: '2026-01-04', supplier: 'SaveTouch' },
  ];

  const alerts = [
    '300 items are out of stock',
    '150 items will expire in less than 12 days',
    '4 items are below minimum quality',
  ];

  // Bar Chart
  const barData = {
    labels: inventory.map(item => item.name),
    datasets: [
      {
        label: 'Quantity',
        data: inventory.map(item => item.quantity),
        backgroundColor: 'rgba(59, 130, 246, 0.7)', // Tailwind blue-500
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Inventory Quantity Overview' },
    },
  };

  // Pie Chart uses the card values for consistency
  const pieData = {
    labels: cards.map(card => card.title),
    datasets: [
      {
        label: 'Stock Breakdown',
        data: cards.map(card => card.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',    // blue for Total Stock
          'rgba(234, 179, 8, 0.8)',     // yellow for Low Stock
          'rgba(239, 68, 68, 0.8)',     // red for Out of Stock
          'rgba(249, 115, 22, 0.8)',    // orange for Expiring Soon
        ],
        borderColor: 'white',
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#374151', font: { size: 14 } } },
      title: { display: true, text: 'Stock Breakdown', color: '#1e293b', font: { size: 18 } },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white p-6 shadow-md">
        <h1 className="text-2xl font-bold text-blue-700 mb-8">MedTracker</h1>
        <ul className="space-y-4 text-gray-700 font-semibold">
          <li className="text-blue-700 bg-blue-100 rounded px-3 py-2">Dashboard</li>
          <li className="hover:bg-gray-200 rounded px-3 py-2 cursor-pointer">
            <Link to="/inventory">Inventory</Link>
          </li>
          <li className="hover:bg-gray-200 rounded px-3 py-2 cursor-pointer">
            <Link to="/supplier">Suppliers</Link>
          </li>
          <li className="hover:bg-gray-200 rounded px-3 py-2 cursor-pointer">
            <Link to="/report">Reports</Link>
          </li>
          <li className="hover:bg-gray-200 rounded px-3 py-2 cursor-pointer">
            <Link to="/settings">Settings</Link>
          </li>
          <li className="hover:bg-gray-200 rounded px-3 py-2 cursor-pointer">
            <Link to="/logout">Logout</Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Topbar */}
        <div className="bg-white px-4 py-3 shadow-md flex justify-between items-center">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <div className="text-sm text-gray-600">Admin</div>
        </div>

        <div className="p-4 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, idx) => (
              <div key={idx} className={`p-4 rounded-xl shadow-md text-white ${card.color}`}>
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p className="text-3xl font-bold">{card.count}</p>
              </div>
            ))}
          </div>

          {/* Alerts */}
          <div className="bg-red-100 text-red-800 p-4 rounded-xl shadow-md">
            <h2 className="font-bold mb-2">Alerts</h2>
            <ul className="list-disc ml-6">
              {alerts.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>

          {/* Inventory Table */}
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-2 text-gray-800">Current Inventory</h2>
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-gray-700 text-left">
                  <th className="p-2">Item</th>
                  <th className="p-2">Quantity</th>
                  <th className="p-2">Expiry Date</th>
                  <th className="p-2">Supplier</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="p-2 text-gray-900">{item.name}</td>
                    <td className={`p-2 font-bold ${
                      item.quantity === 0 ? 'text-red-600' :
                      item.quantity < 10 ? 'text-yellow-600' :
                      'text-green-700'
                    }`}>
                      {item.quantity}
                    </td>
                    <td className="p-2 text-gray-700">{item.expirationDate}</td>
                    <td className="p-2 text-gray-700">{item.supplier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-white p-4 rounded-xl shadow-md flex flex-col justify-between">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Inventory Analysis</h2>
              <div className="h-64">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white p-4 rounded-xl shadow-md flex flex-col justify-between">
              <h2 className="text-xl font-bold mb-4 text-gray-800"></h2>
              <div className="h-64">
                <Pie data={pieData} options={pieOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



