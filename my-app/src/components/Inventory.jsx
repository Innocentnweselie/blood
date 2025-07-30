import React, { useState } from 'react';
import { useStock } from '../context/StockContext.jsx';
import Badge from './Badge.jsx';

function Inventory() {

  const stock = useStock();
  const [items, setItems] = useState(stock?.items || []);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    batchNumber: '',
    quantity: '',
    reorderLevel: '',
    expiryDate: '',
  });

  const getStatus = (item) => {
    if (item.quantity === 0) return { text: 'Out of Stock', color: 'red' };
    if (item.quantity < item.reorderLevel) return { text: 'Low Stock', color: 'yellow' };
    return { text: 'In Stock', color: 'green' };
  };

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Inventory</h1>
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

      {items.length === 0 ? (
        <p>No inventory items available.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Batch Number</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Reorder Level</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Expiry Date</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const status = getStatus(item);
              return (
                <tr key={item.id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">{item.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{item.batchNumber}</td>
                  <td className="border border-gray-300 px-4 py-2">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2">{item.reorderLevel}</td>
                  <td className="border border-gray-300 px-4 py-2">{item.expiryDate}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <Badge color={status.color}>{status.text}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Inventory;
