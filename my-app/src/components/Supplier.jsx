import React, { useState, useEffect } from "react";
import axios from "axios";

const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", contact: "", email: "" });
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000/api/suppliers";

  // Load suppliers from backend
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(API_URL);
      setSuppliers(res.data);
    } catch (err) {
      console.error("❌ Error loading suppliers:", err);
      setError("Failed to load suppliers");
    }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API_URL, formData);
      setSuppliers([res.data, ...suppliers]);
      setFormData({ name: "", contact: "", email: "" });
      setIsModalOpen(false);
    } catch (err) {
      console.error("❌ Error adding supplier:", err);
      setError("Failed to add supplier");
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Supplier Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full md:w-auto"
        >
          + Add Supplier
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {suppliers.length === 0 ? (
        <p className="text-gray-500">No suppliers found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <div key={supplier._id} className="p-4 bg-white shadow rounded-xl">
              <p className="font-semibold text-lg">{supplier.name}</p>
              <p className="text-gray-600 text-sm">{supplier.contact}</p>
              <p className="text-gray-600 text-sm">{supplier.email}</p>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add Supplier</h2>
            <form onSubmit={handleAddSupplier}>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Contact</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


export default SupplierPage;

