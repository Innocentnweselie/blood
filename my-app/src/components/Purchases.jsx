import React, { useEffect, useMemo, useState } from 'react';
import api from '../utils/axiosInstance';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';

const emptyLine = () => ({ itemId: '', quantity: '', unitPrice: '' });

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    supplierId: '',
    supplierName: '',
    locationId: '',
    note: '',
    purchasedAt: '',
    items: [emptyLine()],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [purchasesRes, itemsRes, suppliersRes, locationsRes] = await Promise.all([
        api.get('/purchases?limit=50'),
        api.get('/items'),
        api.get('/suppliers'),
        api.get('/locations'),
      ]);
      setPurchases(Array.isArray(purchasesRes.data) ? purchasesRes.data : []);
      setItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
      setSuppliers(Array.isArray(suppliersRes.data) ? suppliersRes.data : []);
      setLocations(Array.isArray(locationsRes.data) ? locationsRes.data : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load purchases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLineChange = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.items];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, items: next };
    });
  };

  const addLine = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyLine()] }));
  };

  const removeLine = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((_, i) => i !== index) : prev.items,
    }));
  };

  const totals = useMemo(() => {
    let totalQty = 0;
    let totalCost = 0;
    form.items.forEach((line) => {
      const qty = Number(line.quantity) || 0;
      const unit = Number(line.unitPrice) || 0;
      totalQty += qty;
      totalCost += qty * unit;
    });
    return { totalQty, totalCost };
  }, [form.items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const cleanedItems = form.items
        .map((line) => ({
          itemId: line.itemId,
          quantity: Number(line.quantity),
          unitPrice: line.unitPrice !== '' ? Number(line.unitPrice) : undefined,
        }))
        .filter((line) => line.itemId && Number.isFinite(line.quantity) && line.quantity > 0);

      if (cleanedItems.length === 0) {
        setError('Add at least one item with a valid quantity.');
        setSaving(false);
        return;
      }

      const payload = {
        supplierId: form.supplierId || undefined,
        supplierName: form.supplierName?.trim() || undefined,
        locationId: form.locationId || undefined,
        note: form.note?.trim() || undefined,
        purchasedAt: form.purchasedAt || undefined,
        items: cleanedItems,
      };

      const { data } = await api.post('/purchases', payload);
      setPurchases((prev) => [data, ...prev]);
      setForm({
        supplierId: '',
        supplierName: '',
        locationId: '',
        note: '',
        purchasedAt: '',
        items: [emptyLine()],
      });
      toast.success('Purchase recorded.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record purchase.');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '-';
    return num.toFixed(2);
  };

  return (
    <AdminLayout title="Purchases">
      <div className="p-6 space-y-6">
        <div className="app-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Record Purchase</h2>
            <div className="text-sm text-[var(--muted)]">
              Total Qty: {totals.totalQty} · Total Cost: {formatCurrency(totals.totalCost)}
            </div>
          </div>
          {error && <div className="mb-3 text-rose-500 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Supplier</label>
                <select
                  className="app-input"
                  value={form.supplierId}
                  onChange={(e) => setForm((prev) => ({ ...prev, supplierId: e.target.value }))}
                >
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Supplier (Manual)</label>
                <input
                  className="app-input"
                  value={form.supplierName}
                  onChange={(e) => setForm((prev) => ({ ...prev, supplierName: e.target.value }))}
                  placeholder="If not in list"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <select
                  className="app-input"
                  value={form.locationId}
                  onChange={(e) => setForm((prev) => ({ ...prev, locationId: e.target.value }))}
                >
                  <option value="">-- Select Location --</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Purchase Date</label>
                <input
                  type="date"
                  className="app-input"
                  value={form.purchasedAt}
                  onChange={(e) => setForm((prev) => ({ ...prev, purchasedAt: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Items</label>
              <div className="space-y-3">
                {form.items.map((line, index) => (
                  <div key={index} className="grid gap-2 md:grid-cols-[2fr_1fr_1fr_auto] items-end">
                    <select
                      className="app-input"
                      value={line.itemId}
                      onChange={(e) => handleLineChange(index, 'itemId', e.target.value)}
                    >
                      <option value="">-- Select Item --</option>
                      {items.map((item) => (
                        <option key={item._id} value={item._id}>{item.name}</option>
                      ))}
                    </select>
                    <input
                      className="app-input"
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={line.quantity}
                      onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                    />
                    <input
                      className="app-input"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Unit Price"
                      value={line.unitPrice}
                      onChange={(e) => handleLineChange(index, 'unitPrice', e.target.value)}
                    />
                    <button
                      type="button"
                      className="app-btn app-btn-outline text-sm"
                      onClick={() => removeLine(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="app-btn app-btn-outline text-sm mt-3" onClick={addLine}>
                + Add Item
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Note</label>
              <textarea
                className="app-input min-h-[80px]"
                value={form.note}
                onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
              />
            </div>

            <button type="submit" className="app-btn app-btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Purchase'}
            </button>
          </form>
        </div>

        <div className="app-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Recent Purchases</h2>
            {loading && <span className="text-xs text-[var(--muted)]">Loading...</span>}
          </div>
          {!loading && purchases.length === 0 && (
            <p className="text-sm text-[var(--muted)]">No purchases recorded yet.</p>
          )}
          {purchases.length > 0 && (
            <div className="overflow-x-auto">
              <table className="app-table min-w-full text-left text-sm">
                <thead className="border-b border-[var(--border)]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Items</th>
                    <th className="p-3">Total Qty</th>
                    <th className="p-3">Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase._id} className="border-b border-[var(--border)]">
                      <td className="p-3">
                        {purchase.purchasedAt ? new Date(purchase.purchasedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-3 text-[var(--muted)]">
                        {purchase.supplier?.name || purchase.supplierName || '-'}
                      </td>
                      <td className="p-3 text-[var(--muted)]">
                        {purchase.location?.name || purchase.location || 'Unassigned'}
                      </td>
                      <td className="p-3 text-[var(--muted)]">
                        {purchase.items?.length || 0}
                      </td>
                      <td className="p-3 text-[var(--muted)]">
                        {purchase.totalQuantity ?? '-'}
                      </td>
                      <td className="p-3 text-[var(--muted)]">
                        {formatCurrency(purchase.totalCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
