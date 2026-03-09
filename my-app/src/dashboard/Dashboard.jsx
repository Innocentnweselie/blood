"use client";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axiosInstance"; // Import the api instance
import AdminLayout from "../components/AdminLayout";
import {
  Bar,
  Pie
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useAuth } from "../context/AuthContext";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    totalItems: 0,
    totalQuantity: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    expiringSoonCount: 0,
    expiredCount: 0,
    expiringWithinDays: 30,
  });
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState("");
  const [salesDeleting, setSalesDeleting] = useState({});
  const [purchasesDeleting, setPurchasesDeleting] = useState({});
  const [purchaseArchive, setPurchaseArchive] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('dashboardRecentPurchases') || 'null');
      if (Array.isArray(stored)) return stored;
      const legacy = JSON.parse(localStorage.getItem('dashboardDeletedPurchases') || '[]');
      return Array.isArray(legacy) ? legacy : [];
    } catch (err) {
      return [];
    }
  });
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [dismissedAlertKey, setDismissedAlertKey] = useState("");
  const { user } = useAuth();
  const isAdmin = (user?.role || 'storekeeper') === 'admin';

  useEffect(() => {
    try {
      localStorage.setItem(
        'dashboardRecentPurchases',
        JSON.stringify(purchaseArchive.slice(0, 20))
      );
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('recentPurchasesUpdated'));
      }
    } catch (err) {
      // Ignore localStorage write errors.
    }
  }, [purchaseArchive]);

  // FETCH ITEMS + OVERVIEW FROM API
  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const [itemsResult, overviewResult] = await Promise.allSettled([
          api.get('/items'),
          api.get('/dashboard/overview?recentLimit=8&expiringWithinDays=30'),
        ]);

        if (isMounted && itemsResult.status === 'fulfilled') {
          setItems(Array.isArray(itemsResult.value.data) ? itemsResult.value.data : []);
        } else if (itemsResult.status === 'rejected') {
          console.error("Dashboard fetch error:", itemsResult.reason);
        }

        if (isMounted && overviewResult.status === 'fulfilled') {
          const data = overviewResult.value.data || {};
          if (data.summary) {
            setSummary((prev) => ({ ...prev, ...data.summary }));
          }
          const recentSalesData = Array.isArray(data.recentSales) ? data.recentSales : [];
          const recentPurchaseData = Array.isArray(data.recentPurchases) ? data.recentPurchases : [];
          setSales(recentSalesData);
          setPurchases(recentPurchaseData);
          if (recentPurchaseData.length > 0) {
            const snapshots = recentPurchaseData.map((purchase) => buildPurchaseSnapshot(purchase));
            setPurchaseArchive((prev) => mergePurchaseArchive(snapshots, prev));
          }
          setSalesError("");
        } else if (overviewResult.status === 'rejected') {
          console.error("Dashboard overview fetch error:", overviewResult.reason);
          setSalesError("Unable to load dashboard overview.");
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        if (err.response) {
          console.error("Server Error Data:", err.response.data);
          console.error("Server Status:", err.response.status);
        } else if (err.request) {
          console.error("No response received:", err.request);
        }
      } finally {
        if (isMounted) {
          setSalesLoading(false);
        }
      }
    };

    fetchDashboardData();
    const refreshId = setInterval(fetchDashboardData, 15000);

    return () => {
      isMounted = false;
      clearInterval(refreshId);
    };
  }, []);

  const inventory = Array.isArray(items) ? items : [];
  const recentSales = Array.isArray(sales) ? sales : [];
  const recentPurchases = Array.isArray(purchases) ? purchases : [];
  const expiringSoonDays = summary.expiringWithinDays || 30;
  const now = new Date();
  const expiringUntil = new Date(now.getTime() + expiringSoonDays * 24 * 60 * 60 * 1000);
  const expiringSoonItems = inventory.filter((item) => {
    const expiry = item?.expiryDate ? new Date(item.expiryDate) : null;
    if (!expiry || Number.isNaN(expiry.getTime())) return false;
    return expiry >= now && expiry <= expiringUntil;
  });
  const expiredItems = inventory.filter((item) => {
    const expiry = item?.expiryDate ? new Date(item.expiryDate) : null;
    if (!expiry || Number.isNaN(expiry.getTime())) return false;
    return expiry < now;
  });
  const lowStockItems = inventory.filter((item) => {
    const qty = Number(item?.quantity ?? 0);
    const reorder = Number(item?.reorderLevel ?? 0);
    if (!Number.isFinite(qty) || !Number.isFinite(reorder)) return false;
    return qty > 0 && qty <= reorder;
  });
  const outOfStockItems = inventory.filter((item) => {
    const qty = Number(item?.quantity ?? 0);
    if (!Number.isFinite(qty)) return false;
    return qty <= 0;
  });

  const cards = [
    { title: "Total Stock", count: summary.totalItems || 0, className: "bg-[var(--primary)] text-white border-transparent" },
    { title: "Low Stock", count: summary.lowStockCount || 0, className: "bg-[var(--surface)]" },
    { title: "Out of Stock", count: summary.outOfStockCount || 0, className: "bg-[var(--surface)]" },
    { title: "Expiring Soon", count: summary.expiringSoonCount || 0, className: "bg-[var(--surface)]" },
  ];

  const alerts = [];
  if ((summary.expiredCount || 0) > 0) {
    alerts.push(`${summary.expiredCount} item${summary.expiredCount === 1 ? '' : 's'} are expired`);
  }
  if ((summary.outOfStockCount || 0) > 0) {
    alerts.push(`${summary.outOfStockCount} item${summary.outOfStockCount === 1 ? '' : 's'} are out of stock`);
  }
  if ((summary.expiringSoonCount || 0) > 0) {
    alerts.push(`${summary.expiringSoonCount} item${summary.expiringSoonCount === 1 ? '' : 's'} will expire in the next ${expiringSoonDays} days`);
  }
  if ((summary.lowStockCount || 0) > 0) {
    alerts.push(`${summary.lowStockCount} item${summary.lowStockCount === 1 ? '' : 's'} are below reorder level`);
  }
  const alertKey = alerts.join('|');

  useEffect(() => {
    if (alerts.length === 0) {
      setShowAlertPopup(false);
      return;
    }
    if (alertKey !== dismissedAlertKey) {
      setShowAlertPopup(true);
    }
  }, [alertKey, alerts.length, dismissedAlertKey]);

  const handleDismissAlerts = () => {
    setDismissedAlertKey(alertKey);
    setShowAlertPopup(false);
  };

  const formatCurrency = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '-';
    return num.toFixed(2);
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString();
  };

  const buildPurchaseSnapshot = (purchase, overrides = {}) => ({
    _id: purchase?._id,
    purchasedAt: purchase?.purchasedAt || null,
    supplierName: purchase?.supplier?.name || purchase?.supplierName || '-',
    itemsCount: purchase?.items?.length || 0,
    totalQuantity: purchase?.totalQuantity ?? '-',
    totalCost: purchase?.totalCost ?? null,
    locationName: purchase?.location?.name || purchase?.location || 'Unassigned',
    deletedAt: overrides.deletedAt || purchase?.deletedAt || null,
  });

  const mergePurchaseArchive = (incoming, existing) => {
    const safeIncoming = Array.isArray(incoming) ? incoming : [];
    const safeExisting = Array.isArray(existing) ? existing : [];
    const byId = new Map();

    safeExisting.forEach((entry) => {
      if (entry?._id) byId.set(entry._id, entry);
    });

    safeIncoming.forEach((entry) => {
      if (!entry?._id) return;
      const prev = byId.get(entry._id);
      const deletedAt = entry.deletedAt || prev?.deletedAt || null;
      byId.set(entry._id, { ...prev, ...entry, deletedAt });
    });

    const sortValue = (entry) => {
      const dateValue = entry?.purchasedAt || entry?.deletedAt;
      if (!dateValue) return 0;
      const parsed = new Date(dateValue);
      return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
    };

    return Array.from(byId.values())
      .sort((a, b) => sortValue(b) - sortValue(a))
      .slice(0, 20);
  };

  const handleDeleteSale = async (saleId) => {
    if (!isAdmin) return;
    const confirmed = window.confirm('Delete this sale record? This cannot be undone.');
    if (!confirmed) return;
    setSalesDeleting((prev) => ({ ...prev, [saleId]: true }));
    try {
      await api.delete(`/sales/${saleId}`);
      setSales((prev) => prev.filter((sale) => sale._id !== saleId));
    } catch (err) {
      console.error('Failed to delete sale:', err);
    } finally {
      setSalesDeleting((prev) => ({ ...prev, [saleId]: false }));
    }
  };

  const handleDeletePurchase = async (purchase) => {
    if (!isAdmin) return;
    const confirmed = window.confirm('Delete this purchase record? This cannot be undone.');
    if (!confirmed) return;
    const purchaseId = purchase?._id;
    if (!purchaseId) return;

    setPurchasesDeleting((prev) => ({ ...prev, [purchaseId]: true }));
    try {
      await api.delete(`/purchases/${purchaseId}`);
      setPurchases((prev) => prev.filter((entry) => entry._id !== purchaseId));
      const archived = buildPurchaseSnapshot(purchase, { deletedAt: new Date().toISOString() });
      setPurchaseArchive((prev) => mergePurchaseArchive([archived], prev));
    } catch (err) {
      console.error('Failed to delete purchase:', err);
    } finally {
      setPurchasesDeleting((prev) => ({ ...prev, [purchaseId]: false }));
    }
  };

  // BAR CHART (dynamic from DB)
  const barData = {
    labels: inventory.map((item) => item.name),
    datasets: [
      {
        label: "Quantity",
        data: inventory.map((item) => item.quantity),
        backgroundColor: "#1d4ed8", // Blue-700
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Inventory Quantity Overview" },
    },
  };

  // PIE CHART
  const pieData = {
    labels: cards.map((card) => card.title),
    datasets: [
      {
        label: "Stock Breakdown",
        data: cards.map((card) => card.count),
        backgroundColor: [
          "#1e3a8a", // Blue-900
          "#1d4ed8", // Blue-700
          "#3b82f6", // Blue-500
          "#93c5fd", // Blue-300
        ],
        borderColor: "white",
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#374151", font: { size: 14 } },
      },
      title: {
        display: true,
        text: "Stock Breakdown",
        color: "#1e293b",
        font: { size: 18 },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="p-4 md:p-6 space-y-6">
          {showAlertPopup && alerts.length > 0 && (
            <div className="fixed right-6 top-24 z-40 w-[min(380px,calc(100vw-3rem))]">
              <div className="app-card p-4 border border-[var(--border)] shadow-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Inventory Alerts</p>
                    <p className="text-xs text-[var(--muted)]">Review these items.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDismissAlerts}
                    className="text-xs font-semibold text-[var(--primary)] hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
                <ul className="mt-3 list-disc ml-5 text-sm text-[var(--muted)] space-y-1">
                  {alerts.map((alert) => (
                    <li key={alert}>{alert}</li>
                  ))}
                </ul>
                {(expiringSoonItems.length > 0 ||
                  expiredItems.length > 0 ||
                  lowStockItems.length > 0 ||
                  outOfStockItems.length > 0) && (
                  <div className="mt-4 border-t border-[var(--border)] pt-3">
                    {outOfStockItems.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Out of Stock
                        </p>
                        <ul className="mt-2 space-y-2 text-sm">
                          {outOfStockItems.slice(0, 5).map((item) => (
                            <li key={item._id} className="flex items-center justify-between gap-3">
                              <Link
                                to={`/edit-item/${item._id}`}
                                className="font-semibold text-rose-500 hover:underline"
                              >
                                {item.name}
                              </Link>
                              <span className="text-xs text-[var(--muted)]">Qty 0</span>
                            </li>
                          ))}
                        </ul>
                        <Link
                          to="/inventory?lowStock=true"
                          className="mt-2 inline-block text-xs font-semibold text-[var(--primary)] hover:underline"
                        >
                          View all low/out stock
                        </Link>
                      </div>
                    )}
                    {lowStockItems.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Low Stock
                        </p>
                        <ul className="mt-2 space-y-2 text-sm">
                          {lowStockItems.slice(0, 5).map((item) => (
                            <li key={item._id} className="flex items-center justify-between gap-3">
                              <Link
                                to={`/edit-item/${item._id}`}
                                className="font-semibold text-[var(--primary)] hover:underline"
                              >
                                {item.name}
                              </Link>
                              <span className="text-xs text-[var(--muted)]">
                                Qty {item.quantity ?? 0} / {item.reorderLevel ?? '-'}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <Link
                          to="/inventory?lowStock=true"
                          className="mt-2 inline-block text-xs font-semibold text-[var(--primary)] hover:underline"
                        >
                          View all low stock
                        </Link>
                      </div>
                    )}
                    {expiringSoonItems.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Expiring Soon
                        </p>
                        <ul className="mt-2 space-y-2 text-sm">
                          {expiringSoonItems.slice(0, 5).map((item) => (
                            <li key={item._id} className="flex items-center justify-between gap-3">
                              <Link
                                to={`/edit-item/${item._id}`}
                                className="font-semibold text-[var(--primary)] hover:underline"
                              >
                                {item.name}
                              </Link>
                              <span className="text-xs text-[var(--muted)]">
                                {new Date(item.expiryDate).toLocaleDateString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <Link
                          to={`/inventory?expiry=soon&expiringWithinDays=${expiringSoonDays}`}
                          className="mt-2 inline-block text-xs font-semibold text-[var(--primary)] hover:underline"
                        >
                          View all expiring items
                        </Link>
                      </div>
                    )}
                    {expiredItems.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Expired
                        </p>
                        <ul className="mt-2 space-y-2 text-sm">
                          {expiredItems.slice(0, 5).map((item) => (
                            <li key={item._id} className="flex items-center justify-between gap-3">
                              <Link
                                to={`/edit-item/${item._id}`}
                                className="font-semibold text-rose-500 hover:underline"
                              >
                                {item.name}
                              </Link>
                              <span className="text-xs text-[var(--muted)]">
                                {new Date(item.expiryDate).toLocaleDateString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <Link
                          to="/inventory?expiry=expired"
                          className="mt-2 inline-block text-xs font-semibold text-[var(--primary)] hover:underline"
                        >
                          View all expired items
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, idx) => (
              <div
                key={idx}
                className={`app-card p-5 ${card.className}`}
              >
                <p className="text-sm uppercase tracking-wide opacity-80">{card.title}</p>
                <p className="text-3xl font-semibold mt-2">{card.count}</p>
              </div>
            ))}
          </div>

          {/* Inventory Table */}
          <div className="app-card p-4 overflow-x-auto">
            <h2 className="text-xl font-semibold mb-3">
              Current Inventory
            </h2>

            <table className="app-table w-full min-w-[600px] table-auto">
              <thead>
                <tr className="text-left border-b border-[var(--border)]">
                  <th className="p-2">Item</th>
                  <th className="p-2">Quantity</th>
                  <th className="p-2">Location</th>
                  <th className="p-2">Expiry Date</th>
                  <th className="p-2">Supplier</th>
                </tr>
              </thead>

              <tbody>
                {inventory.map((item, idx) => (
                  <tr key={idx} className="border-t border-[var(--border)] hover:bg-[var(--surface-muted)]">
                    <td className="p-2">{item.name}</td>

                    <td
                      className={`p-2 font-bold ${
                        item.quantity === 0
                          ? "text-[var(--muted)]"
                          : item.quantity < 10
                          ? "text-[var(--accent-strong)]"
                          : "text-[var(--primary)]"
                      }`}
                    >
                      {item.quantity}
                    </td>

                    <td className="p-2 text-[var(--muted)]">
                      {item.location?.name || item.location || 'Unassigned'}
                    </td>

                    <td className="p-2 text-[var(--muted)]">
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </td>

                    <td className="p-2 text-[var(--muted)]">{item.supplier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Sales */}
          <div className="app-card p-4 overflow-x-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">Recent Sales</h2>
              {salesLoading && <span className="text-xs text-[var(--muted)]">Loading...</span>}
            </div>
            {salesError && <div className="text-sm text-rose-500 mb-3">{salesError}</div>}
            {!salesLoading && recentSales.length === 0 && (
              <div className="text-sm text-[var(--muted)]">No sales recorded yet.</div>
            )}
            {recentSales.length > 0 && (
              <table className="app-table w-full min-w-[820px] text-left text-sm">
                <thead className="border-b border-[var(--border)]">
                  <tr>
                    <th className="p-3">Item</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Sold By</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Sold At</th>
                    <th className="p-3">Receipt</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => {
                    const salesperson =
                      sale?.salesperson?.name || sale?.salesperson?.email || 'Sales';
                    const locationName = sale?.location?.name || sale?.location || 'Unassigned';
                    const isDeleting = Boolean(salesDeleting[sale._id]);
                    return (
                      <tr key={sale._id} className="border-b border-[var(--border)]">
                        <td className="p-3">{sale.itemName}</td>
                        <td className="p-3 text-[var(--muted)]">{sale.quantity}</td>
                        <td className="p-3 text-[var(--muted)]">{formatCurrency(sale.total)}</td>
                        <td className="p-3 text-[var(--muted)]">{salesperson}</td>
                        <td className="p-3 text-[var(--muted)]">{locationName}</td>
                        <td className="p-3 text-[var(--muted)]">{formatDateTime(sale.soldAt)}</td>
                        <td className="p-3 text-[var(--muted)]">{sale.receiptNumber}</td>
                        <td className="p-3">
                          {isAdmin ? (
                            <button
                              type="button"
                              className="text-xs font-semibold text-rose-500 hover:underline disabled:opacity-50"
                              onClick={() => handleDeleteSale(sale._id)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                          ) : (
                            <span className="text-xs text-[var(--muted)]">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Recent Purchases */}
          <div className="app-card p-4 overflow-x-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">Recent Purchases</h2>
            </div>
            {recentPurchases.length === 0 && (
              <div className="text-sm text-[var(--muted)]">No purchases recorded yet.</div>
            )}
            {recentPurchases.length > 0 && (
              <table className="app-table w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-[var(--border)]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3">Items</th>
                    <th className="p-3">Total Qty</th>
                    <th className="p-3">Total Cost</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPurchases.map((purchase) => {
                    const isDeleting = Boolean(purchasesDeleting[purchase._id]);
                    return (
                      <tr key={purchase._id} className="border-b border-[var(--border)]">
                        <td className="p-3 text-[var(--muted)]">
                          {purchase.purchasedAt ? new Date(purchase.purchasedAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-3 text-[var(--muted)]">
                          {purchase.supplier?.name || purchase.supplierName || '-'}
                        </td>
                        <td className="p-3 text-[var(--muted)]">{purchase.items?.length || 0}</td>
                        <td className="p-3 text-[var(--muted)]">{purchase.totalQuantity ?? '-'}</td>
                        <td className="p-3 text-[var(--muted)]">{formatCurrency(purchase.totalCost)}</td>
                        <td className="p-3 text-[var(--muted)]">
                          {purchase.location?.name || purchase.location || 'Unassigned'}
                        </td>
                        <td className="p-3">
                          {isAdmin ? (
                            <button
                              type="button"
                              className="text-xs font-semibold text-rose-500 hover:underline disabled:opacity-50"
                              onClick={() => handleDeletePurchase(purchase)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                          ) : (
                            <span className="text-xs text-[var(--muted)]">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="app-card p-4 flex flex-col justify-between">
              <h2 className="text-xl font-semibold mb-4">
                Inventory Analysis
              </h2>
              <div className="h-64">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>

            {/* Pie Chart */}
            <div className="app-card p-4 flex flex-col justify-between">
              <h2 className="text-xl font-semibold mb-4">
                Stock Breakdown
              </h2>
              <div className="h-64">
                <Pie data={pieData} options={pieOptions} />
              </div>
            </div>
          </div>
        </div>
    </AdminLayout>
  );
}
