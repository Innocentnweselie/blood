import React, { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';
import { useAuth } from '../context/AuthContext';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const isAdmin = (user?.role || 'storekeeper') === 'admin';

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch categories.');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: String(form.name || '').trim(),
        description: String(form.description || '').trim() || undefined,
      };
      if (!payload.name) {
        setError('Category name is required.');
        setLoading(false);
        return;
      }
      const { data } = await api.post('/categories', payload);
      setCategories((prev) => [data, ...prev]);
      setForm({ name: '', description: '' });
      toast.success('Category added.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add category.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this category? Items will keep their data but lose the category.');
    if (!confirmed) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      toast.success('Category deleted.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete category.');
    }
  };

  return (
    <AdminLayout title="Categories">
      <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6">
        {isAdmin && (
          <div className="app-card p-5 h-fit">
            <h2 className="text-xl font-semibold mb-4">Add Category</h2>
            {error && <div className="mb-3 text-rose-500 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  className="app-input"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="app-input min-h-[90px]"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <button type="submit" className="app-btn app-btn-primary w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Save Category'}
              </button>
            </form>
          </div>
        )}

        <div className={`app-card p-5 ${isAdmin ? '' : 'lg:col-span-2'}`}>
          <h2 className="text-xl font-semibold mb-4">Category List</h2>
          {categories.length === 0 && (
            <p className="text-sm text-[var(--muted)]">No categories yet.</p>
          )}
          {categories.length > 0 && (
            <ul className="divide-y divide-[var(--border)]">
              {categories.map((cat) => (
                <li key={cat._id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{cat.name}</p>
                    {cat.description && (
                      <p className="text-sm text-[var(--muted)]">{cat.description}</p>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      className="text-rose-500 text-sm hover:underline"
                      onClick={() => handleDelete(cat._id)}
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
