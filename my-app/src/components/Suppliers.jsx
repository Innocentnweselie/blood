import React, { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';
import { useAuth } from '../context/AuthContext';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: '', contact: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const isAdmin = (user?.role || 'storekeeper') === 'admin';

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      if (Array.isArray(res.data)) {
        setSuppliers(res.data);
      } else {
        setError('Invalid data received from server.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch suppliers.');
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/suppliers', form);
      setSuppliers([res.data, ...suppliers]);
      setForm({ name: '', contact: '', email: '' });
      toast.success('Supplier added successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Error adding supplier');
    } finally {
      setLoading(false);
    }
  };

  const deleteSupplier = async (id) => {
    try {
      await api.delete(`/suppliers/${id}`);
      setSuppliers(suppliers.filter((s) => s._id !== id));
      toast.success('Supplier deleted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete supplier');
    }
  };

  const handleDelete = (id) => {
    toast(
      ({ closeToast }) => (
        <div className="text-sm text-[var(--text)]">
          <p className="font-semibold">Delete this supplier?</p>
          <p className="mt-1 text-xs text-[var(--muted)]">This action cannot be undone.</p>
          <div className="mt-3 flex gap-2">
            <button
              className="rounded-md bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
              onClick={() => {
                closeToast();
                deleteSupplier(id);
              }}
            >
              Delete
            </button>
            <button
              className="rounded-md border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)]"
              onClick={closeToast}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  return (
    <AdminLayout title="Suppliers">
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {error && <div className="col-span-full app-card p-3 text-rose-600">{error}</div>}

      {/* Form Section */}
      {isAdmin && (
        <div className="md:col-span-1 app-card p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Add Supplier</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              placeholder="Supplier Name" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              required className="app-input" 
            />
            <input 
              placeholder="Contact Number" 
              value={form.contact} 
              onChange={e => setForm({...form, contact: e.target.value})} 
              required className="app-input" 
            />
            <input 
              type="email" 
              placeholder="Email" 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
              required className="app-input" 
            />
            <button disabled={loading} className="app-btn app-btn-primary text-sm w-full disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Supplier'}
            </button>
          </form>
        </div>
      )}

      {/* List Section */}
      <div className={`app-card p-6 ${isAdmin ? 'md:col-span-2' : 'md:col-span-3'}`}>
        <h2 className="text-xl font-semibold mb-4">Supplier List</h2>
        <ul className="divide-y divide-[var(--border)]">
          {suppliers.map((s) => (
            <li key={s._id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-[var(--muted)]">{s.contact} | {s.email}</p>
              </div>
              {isAdmin && (
                <button onClick={() => handleDelete(s._id)} className="text-rose-500 text-sm hover:underline">Delete</button>
              )}
            </li>
          ))}
          {suppliers.length === 0 && <p className="text-[var(--muted)]">No suppliers yet.</p>}
        </ul>
      </div>
      </div>
    </AdminLayout>
  );
}
