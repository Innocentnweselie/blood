import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";

const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form + selected supplier
  const [formData, setFormData] = useState({ name: "", contact: "", email: "" });
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // use `api` instance which prefixes with `/api` and attaches token header

  // Logged-in user (role-based access)
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  /* ---------------- FETCH SUPPLIERS ---------------- */
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ADD SUPPLIER ---------------- */
  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/suppliers', formData);

      setSuppliers([res.data, ...suppliers]);
      toast.success("Supplier added successfully");
      setFormData({ name: "", contact: "", email: "" });
      setIsAddModalOpen(false);
    } catch (err) {
      toast.error("Failed to add supplier");
    }
  };

  /* ---------------- EDIT SUPPLIER ---------------- */
  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSupplier = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/suppliers/${selectedSupplier._id}`, formData);

      setSuppliers((prev) =>
        prev.map((s) => (s._id === selectedSupplier._id ? res.data : s))
      );

      toast.success("Supplier updated successfully");
      setIsEditModalOpen(false);
      setSelectedSupplier(null);
    } catch (err) {
      toast.error("Failed to update supplier");
    }
  };

  /* ---------------- DELETE SUPPLIER ---------------- */
  const openDeleteModal = (supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSupplier = async () => {
    try {
      await api.delete(`/suppliers/${selectedSupplier._id}`);

      setSuppliers((prev) =>
        prev.filter((s) => s._id !== selectedSupplier._id)
      );

      toast.success("Supplier deleted");
      setIsDeleteModalOpen(false);
      setSelectedSupplier(null);
    } catch (err) {
      toast.error("Failed to delete supplier");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Supplier Management</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Supplier
        </button>
      </div>

      {loading ? (
        <p>Loading suppliers...</p>
      ) : suppliers.length === 0 ? (
        <p className="text-gray-500">No suppliers found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <div
              key={supplier._id}
              className="bg-white p-4 rounded-xl shadow"
            >
              <p className="font-semibold text-lg">{supplier.name}</p>
              <p className="text-sm text-gray-600">{supplier.contact}</p>
              <p className="text-sm text-gray-600">{supplier.email}</p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openEditModal(supplier)}
                  className="px-3 py-1 text-sm bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>

                {isAdmin && (
                  <button
                    onClick={() => openDeleteModal(supplier)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                )}
              </div>

              {!isAdmin && (
                <p className="text-xs text-gray-400 mt-2">
                  Only admins can delete suppliers
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL (reused) */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {isEditModalOpen ? "Edit Supplier" : "Add Supplier"}
            </h2>

            <form onSubmit={isEditModalOpen ? handleUpdateSupplier : handleAddSupplier}>
              {["name", "contact", "email"].map((field) => (
                <div key={field} className="mb-3">
                  <label className="block mb-1 capitalize">{field}</label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    value={formData[field]}
                    onChange={(e) =>
                      setFormData({ ...formData, [field]: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              ))}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-3 text-red-600">
              Confirm Delete
            </h2>
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedSupplier?.name}</strong>?
            </p>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSupplier}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierPage;
