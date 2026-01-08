import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // added
import { useStock } from '../context/StockContext.jsx';
import Badge from './Badge.jsx';
import api from '../utils/axiosInstance.js';
import { toast } from 'react-toastify';

function Inventory() {
  const navigate = useNavigate(); // added
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
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // use the configured api instance - it already prefixes with `/api`
  // endpoint for items on backend is `/items`
  const fetchItems = async () => {
    try {
      const res = await api.get('/items');
      setItems(res.data || []);
      toast.success('Inventory loaded successfully!');
    } catch (error) {
      console.error('❌ Error fetching inventory:', error);
      toast.error('Failed to load inventory.');
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ✅ Get status label
  const getStatus = (item) => {
    if (item.quantity === 0) return { text: 'Out of Stock', color: 'red' };
    if (item.quantity < item.reorderLevel) return { text: 'Low Stock', color: 'yellow' };
    return { text: 'In Stock', color: 'green' };
  };

  // ✅ Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Reset form
  const resetForm = () => {
    setForm({ name: '', batchNumber: '', quantity: '', reorderLevel: '', expiryDate: '' });
    setIsEditing(false);
    setEditId(null);
    setShowModal(false);
  };

  // ✅ Create or Update item
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      batchNumber: form.batchNumber.trim(),
      quantity: Number(form.quantity),
      reorderLevel: Number(form.reorderLevel),
      expiryDate: form.expiryDate,
    };

    if (!payload.name || !payload.batchNumber) {
      toast.warn('Please fill all required fields.');
      return;
    }

    try {
      if (isEditing) {
        const res = await api.put(`/items/${editId}`, payload);
        setItems((prev) => prev.map((item) => (item._id === editId ? res.data : item)));
        toast.success('Item updated successfully!');
      } else {
        const res = await api.post('/items', payload);
        setItems((prev) => [res.data, ...prev]);
        toast.success('Item added successfully!');
      }
      resetForm();
    } catch (error) {
      console.error('❌ Error saving item:', error);
      toast.error('Failed to save item.');
    }
  };

  // ✅ Edit item
  const handleEdit = (item) => {
    setForm({
      name: item.name,
      batchNumber: item.batchNumber,
      quantity: item.quantity,
      reorderLevel: item.reorderLevel,
      expiryDate: item.expiryDate.split('T')[0],
    });
    setIsEditing(true);
    setEditId(item._id);
    setShowModal(true);
  };

  // ✅ Delete item
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.delete(`/items/${id}`);
      setItems((prev) => prev.filter((item) => item._id !== id));
      toast.info('Item deleted successfully.');
    } catch (error) {
      console.error('❌ Error deleting item:', error);
      toast.error('Failed to delete item.');
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('/dashboard')}
            aria-label="Go back to dashboard"
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-3 rounded shadow"
          >
            ← Go Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold">Inventory</h1>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow w-full sm:w-auto"
            onClick={() => setShowModal(true)}
          >
            + Add Item
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg">
            <h3 className="text-lg font-bold mb-4">{isEditing ? 'Edit Item' : 'Add New Item'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
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
                value={form.expiryDate}
                onChange={handleInputChange}
                required
              />

              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 w-full sm:w-auto"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto"
                >
                  {isEditing ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {items.length === 0 ? (
        <p className="text-gray-600">No inventory items available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full border border-gray-300 rounded-lg text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">#</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Batch</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Qty</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Reorder</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Expiry</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Status</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const status = getStatus(item);
                return (
                  <tr key={item._id || index} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">{index + 1}</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">{item.name}</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">{item.batchNumber}</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">{item.quantity}</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">{item.reorderLevel}</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">{item.expiryDate?.split('T')[0]}</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      <Badge color={status.color}>{status.text}</Badge>
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Inventory;
