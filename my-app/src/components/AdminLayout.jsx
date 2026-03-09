import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { key: 'sales-dashboard', label: 'Sales Dashboard', to: '/sales-dashboard', roles: ['storekeeper'] },
  { key: 'inventory', label: 'Inventory', to: '/inventory' },
  { key: 'sales-team', label: 'Storekeepers', to: '/sales-team' },
  { key: 'suppliers', label: 'Suppliers', to: '/suppliers' },
  { key: 'categories', label: 'Categories', to: '/categories' },
  { key: 'purchases', label: 'Purchases', to: '/purchases' },
  { key: 'report', label: 'Reports', to: '/report' },
  { key: 'settings', label: 'Settings', to: '/settings' },
  { key: 'logout', label: 'Logout', to: '/logout' },
];

const getActiveKey = (pathname) => {
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/sales-dashboard')) return 'sales-dashboard';
  if (
    pathname.startsWith('/inventory') ||
    pathname.startsWith('/create-item') ||
    pathname.startsWith('/edit-item')
  ) {
    return 'inventory';
  }
  if (pathname.startsWith('/sales-team')) return 'sales-team';
  if (pathname.startsWith('/suppliers')) return 'suppliers';
  if (pathname.startsWith('/categories')) return 'categories';
  if (pathname.startsWith('/purchases')) return 'purchases';
  if (pathname.startsWith('/report')) return 'report';
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/logout')) return 'logout';
  return '';
};

const readRecentPurchases = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = JSON.parse(localStorage.getItem('dashboardRecentPurchases') || 'null');
    if (Array.isArray(stored)) return stored;
    const legacy = JSON.parse(localStorage.getItem('dashboardDeletedPurchases') || '[]');
    return Array.isArray(legacy) ? legacy : [];
  } catch (err) {
    return [];
  }
};

export default function AdminLayout({ children, title }) {
  const location = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentPurchases, setRecentPurchases] = useState(() => readRecentPurchases());
  const [recentPurchasesOpen, setRecentPurchasesOpen] = useState(false);
  const activeKey = useMemo(() => getActiveKey(location.pathname), [location.pathname]);

  useEffect(() => {
    const sync = () => setRecentPurchases(readRecentPurchases());
    sync();

    const handleStorage = (event) => {
      if (event.key === 'dashboardRecentPurchases' || event.key === 'dashboardDeletedPurchases') {
        sync();
      }
    };

    const handleCustom = () => sync();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('recentPurchasesUpdated', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('recentPurchasesUpdated', handleCustom);
    };
  }, []);

  const userLabel = user?.name || user?.email || 'User';
  const role = user?.role || 'storekeeper';
  const rawAvatarUrl = user?.avatarUrl || user?.avatar || user?.profileImage;
  const apiBase = import.meta.env.VITE_API_URL || '';
  const uploadBase = apiBase ? apiBase.replace(/\/api$/, '').replace(/\/$/, '') : '';
  const avatarSrc = rawAvatarUrl
    ? rawAvatarUrl.startsWith('http') || rawAvatarUrl.startsWith('data:') || rawAvatarUrl.startsWith('blob:')
      ? rawAvatarUrl
      : `${uploadBase}${rawAvatarUrl}`
    : '';
  const userInitial = userLabel.charAt(0).toUpperCase();

  const formatCurrency = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '-';
    return num.toFixed(2);
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString();
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString();
  };

  const sidebarPurchases = Array.isArray(recentPurchases) ? recentPurchases.slice(0, 5) : [];

  const renderRecentPurchases = () => (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setRecentPurchasesOpen((prev) => !prev)}
          className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] hover:text-[var(--text)]"
          aria-expanded={recentPurchasesOpen}
        >
          {recentPurchasesOpen ? 'Recent Purchases -' : 'Recent Purchases +'}
        </button>
        <Link
          to="/purchases"
          onClick={() => setSidebarOpen(false)}
          className="text-xs font-semibold text-[var(--primary)] hover:underline"
        >
          All
        </Link>
      </div>
      {recentPurchasesOpen && (
        <div className="mt-3 space-y-2">
          {sidebarPurchases.length === 0 ? (
            <div className="text-xs text-[var(--muted)]">No recent purchases saved.</div>
          ) : (
            sidebarPurchases.map((purchase) => (
              <div
                key={purchase._id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs"
              >
                <div className="font-semibold text-[var(--text)] truncate">
                  {purchase.supplierName || '-'}
                </div>
                <div className="text-[var(--muted)]">
                  {formatDate(purchase.purchasedAt)} - Qty {purchase.totalQuantity ?? '-'}
                </div>
                <div className="text-[var(--muted)]">
                  {formatCurrency(purchase.totalCost)} - {purchase.locationName || 'Unassigned'}
                </div>
                {purchase.deletedAt && (
                  <div className="text-rose-500">Deleted {formatDateTime(purchase.deletedAt)}</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const filteredItems = navItems.filter((item) => {
    if (item.roles && !item.roles.includes(role)) return false;
    if (role !== 'admin' && ['sales-team', 'settings'].includes(item.key)) return false;
    return true;
  });

  const visibleItems = activeKey
    ? filteredItems.filter((item) => item.key !== activeKey)
    : filteredItems;

  const renderNavItem = (item) => {
    const label =
      item.key === 'sales-dashboard' && role === 'storekeeper'
        ? 'Storekeeper Dashboard'
        : item.label;
    return (
    <li
      key={item.key}
      className="hover:bg-[var(--surface-muted)] rounded-full px-4 py-2 transition-colors"
    >
      <Link to={item.to} onClick={() => setSidebarOpen(false)}>
        {label}
      </Link>
    </li>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden app-shell">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex w-72 flex-col border-r border-[var(--border)] bg-[var(--surface)] p-6">
        <h1 className="text-2xl font-semibold text-[var(--primary)] mb-8">MedTracker</h1>
        <ul className="space-y-2 text-[var(--muted)] font-semibold">
          {visibleItems.map(renderNavItem)}
        </ul>
        {role === 'admin' && renderRecentPurchases()}
      </div>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-72 bg-[var(--surface)] p-6 border-r border-[var(--border)]">
            <h1 className="text-2xl font-semibold text-[var(--primary)] mb-8">MedTracker</h1>
            <ul className="space-y-2 text-[var(--muted)] font-semibold">
              {visibleItems.map(renderNavItem)}
            </ul>
            {role === 'admin' && renderRecentPurchases()}
          </div>

          <div
            className="flex-1 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          ></div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="app-card mx-4 mt-4 px-4 py-3 flex justify-between items-center gap-3">
          <button
            className="lg:hidden text-[var(--primary)] font-semibold"
            onClick={() => setSidebarOpen(true)}
          >
            Menu
          </button>
          <h2 className="text-lg font-semibold">{title || ''}</h2>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={`${userLabel} avatar`}
                  className="h-9 w-9 rounded-full object-cover border border-[var(--border)]"
                />
              ) : (
                <div className="h-9 w-9 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--muted)] flex items-center justify-center text-sm font-semibold">
                  {userInitial}
                </div>
              )}
              <div className="text-sm text-[var(--muted)]">{userLabel}</div>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
