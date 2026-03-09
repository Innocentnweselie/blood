import React, { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';
import Badge from './Badge.jsx';
import AdminLayout from './AdminLayout';

export default function Report() {
  const [summary, setSummary] = useState({
    totalItems: 0,
    totalQuantity: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    expiringSoonCount: 0,
    expiringWithinDays: 30,
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [salesReport, setSalesReport] = useState({
    summary: { totalSales: 0, totalQuantity: 0, totalRevenue: 0 },
    sales: [],
    page: 1,
    limit: 100,
    totalCount: 0,
  });
  const [salesFilters, setSalesFilters] = useState({
    from: '',
    to: '',
    search: '',
    limit: 100,
  });
  const [loading, setLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '-';
    return num.toFixed(2);
  };

  const fetchSummary = async () => {
    const { data } = await api.get('/reports/stock-summary?expiringWithinDays=30');
    if (data) setSummary((prev) => ({ ...prev, ...data }));
  };

  const fetchLowStock = async () => {
    const { data } = await api.get('/reports/low-stock?limit=200');
    setLowStockItems(Array.isArray(data?.items) ? data.items : []);
  };

  const fetchSales = async (filters = salesFilters) => {
    const params = new URLSearchParams();
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.search) params.set('search', filters.search);
    if (filters.limit) params.set('limit', String(filters.limit));
    const url = params.toString() ? `/reports/sales?${params.toString()}` : '/reports/sales';
    const { data } = await api.get(url);
    setSalesReport({
      summary: data?.summary || { totalSales: 0, totalQuantity: 0, totalRevenue: 0 },
      sales: Array.isArray(data?.sales) ? data.sales : [],
      page: data?.page || 1,
      limit: data?.limit || filters.limit || 100,
      totalCount: data?.totalCount || 0,
    });
  };

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchSummary(), fetchLowStock(), fetchSales()]);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load reports.');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const handleSalesFilterSubmit = async (e) => {
    e.preventDefault();
    setSalesLoading(true);
    try {
      await fetchSales(salesFilters);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load sales report.');
    } finally {
      setSalesLoading(false);
    }
  };

  const handleSalesFilterChange = (e) => {
    const { name, value } = e.target;
    setSalesFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AdminLayout title="Reports">
      <div className="p-6 space-y-6">
        {error && <div className="app-card p-3 text-rose-500 text-sm">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="app-card p-5 bg-[var(--primary)] text-white border-transparent">
            <p className="text-sm uppercase tracking-wide opacity-80">Total Items</p>
            <p className="text-3xl font-semibold mt-2">{summary.totalItems}</p>
          </div>
          <div className="app-card p-5">
            <p className="text-sm uppercase tracking-wide text-[var(--muted)]">Low Stock</p>
            <p className="text-3xl font-semibold mt-2">{summary.lowStockCount}</p>
          </div>
          <div className="app-card p-5">
            <p className="text-sm uppercase tracking-wide text-[var(--muted)]">Out of Stock</p>
            <p className="text-3xl font-semibold mt-2">{summary.outOfStockCount}</p>
          </div>
          <div className="app-card p-5">
            <p className="text-sm uppercase tracking-wide text-[var(--muted)]">Expiring Soon</p>
            <p className="text-3xl font-semibold mt-2">{summary.expiringSoonCount}</p>
            <p className="text-xs text-[var(--muted)] mt-1">
              Next {summary.expiringWithinDays} days
            </p>
          </div>
        </div>

        <div className="app-card p-5">
          <h2 className="text-xl font-semibold mb-3">Stock Summary</h2>
          <div className="grid gap-4 md:grid-cols-3 text-sm text-[var(--muted)]">
            <div>
              <p>Total Quantity</p>
              <p className="text-lg font-semibold text-[var(--text)]">{summary.totalQuantity}</p>
            </div>
            <div>
              <p>Total Inventory Value</p>
              <p className="text-lg font-semibold text-[var(--text)]">{formatCurrency(summary.totalValue)}</p>
            </div>
            <div>
              <p>Expiring Soon</p>
              <p className="text-lg font-semibold text-[var(--text)]">{summary.expiringSoonCount}</p>
            </div>
          </div>
        </div>

        <div className="app-card p-5 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-3">Low Stock Items</h2>
          {loading && <div className="text-sm text-[var(--muted)]">Loading low stock items...</div>}
          {!loading && lowStockItems.length === 0 && (
            <div className="text-sm text-[var(--muted)]">No low stock items.</div>
          )}
          {lowStockItems.length > 0 && (
            <table className="app-table min-w-full text-left text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Reorder Level</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => {
                  const qty = Number(item.quantity) || 0;
                  const reorder = Number(item.reorderLevel) || 0;
                  return (
                    <tr key={item._id} className="border-b border-[var(--border)]">
                      <td className="p-3">{item.name}</td>
                      <td className="p-3 text-[var(--muted)]">{item.category?.name || '-'}</td>
                      <td className="p-3 text-[var(--muted)]">{qty}</td>
                      <td className="p-3 text-[var(--muted)]">{reorder}</td>
                      <td className="p-3 text-[var(--muted)]">
                        {item.location?.name || item.location || 'Unassigned'}
                      </td>
                      <td className="p-3">
                        {qty === 0 ? <Badge color="red">Out</Badge> : <Badge color="yellow">Low</Badge>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="app-card p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-semibold">Sales Report</h2>
            <div className="text-sm text-[var(--muted)]">
              Total Revenue: {formatCurrency(salesReport.summary.totalRevenue)}
            </div>
          </div>

          <form onSubmit={handleSalesFilterSubmit} className="grid gap-3 md:grid-cols-[1fr_1fr_1.2fr_0.6fr_auto] items-end">
            <div>
              <label className="block text-xs font-semibold uppercase text-[var(--muted)] mb-1">From</label>
              <input
                type="date"
                name="from"
                value={salesFilters.from}
                onChange={handleSalesFilterChange}
                className="app-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-[var(--muted)] mb-1">To</label>
              <input
                type="date"
                name="to"
                value={salesFilters.to}
                onChange={handleSalesFilterChange}
                className="app-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-[var(--muted)] mb-1">Search</label>
              <input
                name="search"
                value={salesFilters.search}
                onChange={handleSalesFilterChange}
                placeholder="Item, batch, receipt"
                className="app-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-[var(--muted)] mb-1">Limit</label>
              <input
                name="limit"
                type="number"
                min="1"
                max="500"
                value={salesFilters.limit}
                onChange={handleSalesFilterChange}
                className="app-input"
              />
            </div>
            <button type="submit" className="app-btn app-btn-primary" disabled={salesLoading}>
              {salesLoading ? 'Loading...' : 'Apply'}
            </button>
          </form>

          <div className="grid gap-3 md:grid-cols-3 text-sm text-[var(--muted)]">
            <div>
              <p>Total Sales</p>
              <p className="text-lg font-semibold text-[var(--text)]">{salesReport.summary.totalSales}</p>
            </div>
            <div>
              <p>Total Quantity</p>
              <p className="text-lg font-semibold text-[var(--text)]">{salesReport.summary.totalQuantity}</p>
            </div>
            <div>
              <p>Total Revenue</p>
              <p className="text-lg font-semibold text-[var(--text)]">{formatCurrency(salesReport.summary.totalRevenue)}</p>
            </div>
          </div>

          {salesReport.sales.length === 0 && (
            <div className="text-sm text-[var(--muted)]">No sales records found.</div>
          )}
          {salesReport.sales.length > 0 && (
            <div className="overflow-x-auto">
              <table className="app-table min-w-full text-left text-sm">
                <thead className="border-b border-[var(--border)]">
                  <tr>
                    <th className="p-3">Item</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Unit Price</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Receipt</th>
                    <th className="p-3">Sold At</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport.sales.map((sale) => (
                    <tr key={sale._id} className="border-b border-[var(--border)]">
                      <td className="p-3">{sale.itemName}</td>
                      <td className="p-3 text-[var(--muted)]">{sale.quantity}</td>
                      <td className="p-3 text-[var(--muted)]">{formatCurrency(sale.unitPrice)}</td>
                      <td className="p-3 text-[var(--muted)]">{formatCurrency(sale.total)}</td>
                      <td className="p-3 text-[var(--muted)]">{sale.receiptNumber}</td>
                      <td className="p-3 text-[var(--muted)]">
                        {sale.soldAt ? new Date(sale.soldAt).toLocaleString() : '-'}
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
