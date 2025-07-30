import React, { useState } from 'react'
import { useStock } from '../context/StockContext.jsx';
import Badge from '../components/Badge.jsx';

// Temporary fallback test data in case context is empty
const fallbackItems = [
  {
    id: 1,
    name: 'Paracetamol',
    batchNumber: 'A123',
    quantity: 10,
    reorderLevel: 15,
    expiryDate: '2025-08-05',
  },
  {
    id: 2,
    name: 'Amoxicillin',
    batchNumber: 'B456',
    quantity: 0,
    reorderLevel: 10,
    expiryDate: '2024-12-01',
  },
  {
    id: 3,
    name: 'Ibuprofen',
    batchNumber: 'C789',
    quantity: 50,
    reorderLevel: 20,
    expiryDate: '2025-08-20',
  },
];

function Report() {

  const stock = useStock();
  const [items, setItems] = useState(stock?.items?.length ? stock.items : fallbackItems);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    batchNumber: '',
    quantity: '',
    reorderLevel: '',
    expiryDate: '',
  });
  const today = new Date();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    setItems((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        name: form.name,
        batchNumber: form.batchNumber,
        quantity: Number(form.quantity),
        reorderLevel: Number(form.reorderLevel),
        expiryDate: form.expiryDate,
      },
    ]);
    setForm({ name: '', batchNumber: '', quantity: '', reorderLevel: '', expiryDate: '' });
    setShowModal(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Stock Report</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow"
          onClick={() => setShowModal(true)}
        >
          + Add Item
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add New Item</h3>
            <form onSubmit={handleAddItem} className="space-y-3">
              <input
                className="w-full border px-3 py-2 rounded"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleInputChange}
                required
              />
              <input
                className="w-full border px-3 py-2 rounded"
                name="batchNumber"
                placeholder="Batch Number"
                value={form.batchNumber}
                onChange={handleInputChange}
                required
              />
              <input
                className="w-full border px-3 py-2 rounded"
                name="quantity"
                type="number"
                min="0"
                placeholder="Quantity"
                value={form.quantity}
                onChange={handleInputChange}
                required
              />
              <input
                className="w-full border px-3 py-2 rounded"
                name="reorderLevel"
                type="number"
                min="0"
                placeholder="Reorder Level"
                value={form.reorderLevel}
                onChange={handleInputChange}
                required
              />
              <input
                className="w-full border px-3 py-2 rounded"
                name="expiryDate"
                type="date"
                placeholder="Expiry Date"
                value={form.expiryDate}
                onChange={handleInputChange}
                required
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Batch #</th>
              <th className="py-2 px-4 border-b">Quantity</th>
              <th className="py-2 px-4 border-b">Reorder Level</th>
              <th className="py-2 px-4 border-b">Expiry Date</th>
              <th className="py-2 px-4 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isLowStock = item.quantity <= item.reorderLevel;
              const isExpired = new Date(item.expiryDate) < today;
              return (
                <tr key={item.id} className="text-center hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{item.name}</td>
                  <td className="py-2 px-4 border-b">{item.batchNumber}</td>
                  <td className="py-2 px-4 border-b">{item.quantity}</td>
                  <td className="py-2 px-4 border-b">{item.reorderLevel}</td>
                  <td className="py-2 px-4 border-b">{item.expiryDate}</td>
                  <td className="py-2 px-4 border-b">
                    {isExpired && <Badge color="red">Expired</Badge>}
                    {!isExpired && isLowStock && <Badge color="yellow">Low Stock</Badge>}
                    {!isExpired && !isLowStock && <Badge color="green">OK</Badge>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Report
