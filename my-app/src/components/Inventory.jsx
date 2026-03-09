import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../utils/axiosInstance';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';
import { useAuth } from '../context/AuthContext';

const normalizeExpiryFilter = (value) => {
  if (value === 'soon' || value === 'expired') return value;
  return '';
};

const parseExpiringWithinDays = (value, fallback = 30) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, 1), 365);
};

export default function Inventory() {
  const location = useLocation();
  const initialExpiry = (() => {
    const params = new URLSearchParams(location.search);
    return normalizeExpiryFilter(params.get('expiry'));
  })();
  const initialExpiringWithinDays = (() => {
    if (initialExpiry !== 'soon') return 30;
    const params = new URLSearchParams(location.search);
    return parseExpiringWithinDays(params.get('expiringWithinDays') || params.get('days'), 30);
  })();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    supplier: '',
    locationId: '',
    lowStock: false,
    expiry: initialExpiry,
    expiringWithinDays: initialExpiringWithinDays,
  });
  const [searchInput, setSearchInput] = useState('');
  const [stockModal, setStockModal] = useState({ open: false, item: null, type: 'IN' });
  const [stockForm, setStockForm] = useState({ quantity: '', note: '', locationId: '' });
  const { user } = useAuth();
  const isAdmin = (user?.role || 'storekeeper') === 'admin';

  const formatPrice = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '-';
    return num.toFixed(2);
  };

  const fetchItems = async (queryFilters = filters) => {
    try {
      const params = new URLSearchParams();
      if (queryFilters.search) params.set('search', queryFilters.search);
      if (queryFilters.categoryId) params.set('categoryId', queryFilters.categoryId);
      if (queryFilters.supplier) params.set('supplier', queryFilters.supplier);
      if (queryFilters.locationId) params.set('locationId', queryFilters.locationId);
      if (queryFilters.lowStock) params.set('lowStock', 'true');
      if (queryFilters.expiry === 'soon') {
        params.set('expiry', 'soon');
        params.set('expiringWithinDays', String(queryFilters.expiringWithinDays || 30));
      } else if (queryFilters.expiry === 'expired') {
        params.set('expiry', 'expired');
      }
      const url = params.toString() ? `/items?${params.toString()}` : '/items';
      const res = await api.get(url);
      setItems(res.data);
      toast.success('Inventory loaded!', { toastId: 'inventoryLoaded' });
      setError(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch inventory.', { toastId: 'inventoryError' });
      setError('Failed to fetch inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [categoriesRes, locationsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/locations'),
        ]);
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
        setLocations(Array.isArray(locationsRes.data) ? locationsRes.data : []);
      } catch (err) {
        console.error('Failed to load filters:', err);
      }
    };

    loadFilters();
    fetchItems();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const expiry = normalizeExpiryFilter(params.get('expiry'));
    const expiringWithinDays =
      expiry === 'soon'
        ? parseExpiringWithinDays(params.get('expiringWithinDays') || params.get('days'), 30)
        : 30;
    setFilters((prev) => {
      if (prev.expiry === expiry && prev.expiringWithinDays === expiringWithinDays) {
        return prev;
      }
      return { ...prev, expiry, expiringWithinDays };
    });
  }, [location.search]);

  useEffect(() => {
    fetchItems(filters);
  }, [filters]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/items/${id}`);
      setItems(items.filter((item) => item._id !== id));
      toast.success('Item deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  const openStockModal = (item, type) => {
    setStockModal({ open: true, item, type });
    setStockForm({
      quantity: '',
      note: '',
      locationId: item?.location?._id || item?.location || '',
    });
  };

  const closeStockModal = () => {
    setStockModal({ open: false, item: null, type: 'IN' });
    setStockForm({ quantity: '', note: '', locationId: '' });
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!stockModal.item) return;
    const qty = Number(stockForm.quantity);
    if (!Number.isFinite(qty) || qty < 0 || (stockModal.type !== 'ADJUST' && qty === 0)) {
      toast.error('Enter a valid quantity.');
      return;
    }
    const endpoint =
      stockModal.type === 'IN'
        ? '/stock/in'
        : stockModal.type === 'OUT'
          ? '/stock/out'
          : '/stock/adjust';
    try {
      const { data } = await api.post(endpoint, {
        itemId: stockModal.item._id,
        quantity: qty,
        note: stockForm.note || undefined,
        locationId: stockForm.locationId || undefined,
      });
      if (data?.item?._id) {
        setItems((prev) =>
          prev.map((item) =>
            item._id === data.item._id ? { ...item, quantity: data.item.quantity } : item
          )
        );
      }
      toast.success('Stock updated.');
      closeStockModal();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update stock.');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Inventory">
        <div className="p-6">Loading inventory...</div>
      </AdminLayout>
    );
  }
  if (error) {
    return (
      <AdminLayout title="Inventory">
        <div className="p-6 text-red-600">{error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Inventory">
      <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Inventory</h1>
        {isAdmin && (
          <Link to="/create-item" className="app-btn app-btn-primary text-sm">
            Add New Item
          </Link>
        )}
      </div>

      <div className="app-card p-4 mb-6">
        <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] items-end">
          <div>
            <label className="block text-xs font-semibold uppercase text-[var(--muted)] mb-1">
              Search
            </label>
            <input
              className="app-input"
              placeholder="Search name, batch, barcode"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
                }
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-[var(--muted)] mb-1">
              Category
            </label>
            <select
              className="app-input"
              value={filters.categoryId}
              onChange={(e) => setFilters((prev) => ({ ...prev, categoryId: e.target.value }))}
            >
              <option value="">All</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-[var(--muted)] mb-1">
              Supplier
            </label>
            <input
              className="app-input"
              placeholder="Supplier name"
              value={filters.supplier}
              onChange={(e) => setFilters((prev) => ({ ...prev, supplier: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-[var(--muted)] mb-1">
              Location
            </label>
            <select
              className="app-input"
              value={filters.locationId}
              onChange={(e) => setFilters((prev) => ({ ...prev, locationId: e.target.value }))}
            >
              <option value="">All</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>{loc.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.lowStock}
                onChange={(e) => setFilters((prev) => ({ ...prev, lowStock: e.target.checked }))}
              />
              Low stock only
            </label>
            <button
              type="button"
              className="app-btn app-btn-outline text-sm"
              onClick={() => {
                setSearchInput('');
                setFilters({
                  search: '',
                  categoryId: '',
                  supplier: '',
                  locationId: '',
                  lowStock: false,
                  expiry: '',
                  expiringWithinDays: 30,
                });
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="app-btn app-btn-primary text-sm"
              onClick={() => setFilters((prev) => ({ ...prev, search: searchInput.trim() }))}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="app-card overflow-x-auto">
        <table className="app-table min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)]">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Supplier</th>
              <th className="p-4">Batch No.</th>
              <th className="p-4">Price</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Reorder Lvl</th>
              <th className="p-4">Location</th>
              <th className="p-4">Expiry Date</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)]">
                <td className="p-4">{item.name}</td>
                <td className="p-4 text-[var(--muted)]">{item.category?.name || '-'}</td>
                <td className="p-4 text-[var(--muted)]">{item.supplier || '-'}</td>
                <td className="p-4 text-[var(--muted)]">{item.batchNumber}</td>
                <td className="p-4 text-[var(--muted)]">{formatPrice(item.price)}</td>
                <td className={`p-4 font-medium ${item.quantity <= item.reorderLevel ? 'text-rose-500' : 'text-[var(--text)]'}`}>{item.quantity}</td>
                <td className="p-4 text-[var(--muted)]">{item.reorderLevel}</td>
                <td className="p-4 text-[var(--muted)]">{item.location?.name || item.location || 'Unassigned'}</td>
                <td className="p-4 text-[var(--muted)]">{dayjs(item.expiryDate).format('MMM D, YYYY')}</td>
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    {isAdmin && (
                      <Link to={`/edit-item/${item._id}`} className="font-medium text-[var(--primary)] hover:underline">Edit</Link>
                    )}
                    {isAdmin && (
                      <button onClick={() => handleDelete(item._id)} className="font-medium text-rose-500 hover:underline">Delete</button>
                    )}
                    <button onClick={() => openStockModal(item, 'IN')} className="font-medium text-emerald-600 hover:underline">Stock In</button>
                    <button onClick={() => openStockModal(item, 'OUT')} className="font-medium text-amber-600 hover:underline">Stock Out</button>
                    <button onClick={() => openStockModal(item, 'ADJUST')} className="font-medium text-sky-600 hover:underline">Adjust</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="10" className="p-4 text-center text-[var(--muted)]">No items found.</td></tr>}
          </tbody>
        </table>
      </div>

      {stockModal.open && stockModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="app-card w-full max-w-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold">
                  {stockModal.type === 'IN' ? 'Stock In' : stockModal.type === 'OUT' ? 'Stock Out' : 'Adjust Stock'}
                </h3>
                <p className="text-sm text-[var(--muted)]">{stockModal.item.name}</p>
              </div>
              <button className="text-sm text-[var(--muted)] hover:underline" onClick={closeStockModal}>
                Close
              </button>
            </div>
            <form onSubmit={handleStockSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {stockModal.type === 'ADJUST' ? 'New Quantity' : 'Quantity'}
                </label>
                <input
                  className="app-input"
                  type="number"
                  min={stockModal.type === 'OUT' ? 1 : 0}
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm((prev) => ({ ...prev, quantity: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <select
                  className="app-input"
                  value={stockForm.locationId}
                  onChange={(e) => setStockForm((prev) => ({ ...prev, locationId: e.target.value }))}
                >
                  <option value="">-- Select Location --</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Note</label>
                <textarea
                  className="app-input min-h-[80px]"
                  value={stockForm.note}
                  onChange={(e) => setStockForm((prev) => ({ ...prev, note: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button type="button" className="app-btn app-btn-outline" onClick={closeStockModal}>
                  Cancel
                </button>
                <button type="submit" className="app-btn app-btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}
