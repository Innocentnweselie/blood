import React, { useEffect, useState } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import api from '../utils/axiosInstance';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';

export default function SalesTeam() {
  const [salesUsers, setSalesUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const loadSalesUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/storekeepers');
      setSalesUsers(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load storekeepers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await api.post('/users/storekeepers', form);
      setSalesUsers((prev) => [data, ...prev]);
      setForm({ name: '', email: '', password: '' });
      toast.success('Storekeeper account created.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create storekeeper account.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Storekeepers">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Storekeepers</h2>
          <p className="text-[var(--muted)] mt-1">
            Create storekeeper accounts and share the temporary password with the staff member.
          </p>
        </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="app-card p-5">
          <h3 className="text-lg font-semibold mb-4">Add Storekeeper Account</h3>
          {error && <div className="mb-3 text-rose-500 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                className="app-input"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                className="app-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Temporary Password</label>
              <div className="relative">
                <input
                  className="app-input pr-10"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-[var(--muted)] hover:text-[var(--text)]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                </button>
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">
                The storekeeper will be prompted to change this on first login.
              </p>
            </div>
            <button
              type="submit"
              className="app-btn app-btn-primary w-full"
              disabled={saving}
            >
              {saving ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>

        <div className="app-card p-5">
          <h3 className="text-lg font-semibold mb-4">Current Storekeepers</h3>
          {loading && <div className="text-sm text-[var(--muted)]">Loading storekeepers...</div>}
          {!loading && salesUsers.length === 0 && (
            <div className="text-sm text-[var(--muted)]">No storekeepers yet.</div>
          )}
          {!loading && salesUsers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="app-table min-w-full text-left text-sm">
                <thead className="border-b border-[var(--border)]">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {salesUsers.map((user) => (
                    <tr key={user._id} className="border-b border-[var(--border)]">
                      <td className="p-3">{user.name}</td>
                      <td className="p-3 text-[var(--muted)]">{user.email}</td>
                      <td className="p-3 text-[var(--muted)]">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </div>
    </AdminLayout>
  );
}
