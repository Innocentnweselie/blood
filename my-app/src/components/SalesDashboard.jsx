import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../utils/axiosInstance';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

const formatPrice = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return num.toFixed(2);
};

const RECEIPT_BRAND = {
  name: 'MedTracker',
  address: 'address: 123 Health St Bonaberi, Cameroon',
  phone: '670661722',
  email: 'ngwainnocentnweselie3@gmail.com',
  currency: 'XAF',
};

export default function SalesDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [barcodeFilter, setBarcodeFilter] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [sellQty, setSellQty] = useState({});
  const [sellingId, setSellingId] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [receiptDownloaded, setReceiptDownloaded] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const lastReceiptIdRef = useRef(null);

  const { user, updateUser } = useAuth();
  const role = user?.role || 'sales';
  const isStorekeeper = role === 'storekeeper';
  const userLabel = user?.name || user?.email || 'Sales';
  const rawAvatarUrl = user?.avatarUrl || user?.avatar || user?.profileImage;
  const apiBase = import.meta.env.VITE_API_URL || '';
  const uploadBase = apiBase ? apiBase.replace(/\/api$/, '').replace(/\/$/, '') : '';
  const avatarSrc = rawAvatarUrl
    ? rawAvatarUrl.startsWith('http') || rawAvatarUrl.startsWith('data:') || rawAvatarUrl.startsWith('blob:')
      ? rawAvatarUrl
      : `${uploadBase}${rawAvatarUrl}`
    : '';
  const userInitial = userLabel.charAt(0).toUpperCase();
  const now = new Date();

  const formatCurrency = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '-';
    return `${num.toFixed(2)} ${RECEIPT_BRAND.currency}`;
  };

  const filteredItems = items.filter((item) => {
    const locationMatch =
      selectedLocation === 'all' ||
      item.location?._id === selectedLocation ||
      item.location === selectedLocation;
    const barcodeMatch =
      !barcodeFilter ||
      String(item.barcode || '').trim() === String(barcodeFilter).trim();
    return locationMatch && barcodeMatch;
  });

  const passwordPromptKey = useMemo(() => {
    if (!user?._id) return 'salesPasswordPrompt:dismissed';
    return `salesPasswordPrompt:${user._id}`;
  }, [user?._id]);

  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  useEffect(() => {
    if (!user?.mustChangePassword) {
      setShowPasswordPrompt(false);
      return;
    }
    try {
      setShowPasswordPrompt(sessionStorage.getItem(passwordPromptKey) !== 'dismissed');
    } catch (err) {
      setShowPasswordPrompt(true);
    }
  }, [passwordPromptKey, user?.mustChangePassword]);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/items');
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to load inventory.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data } = await api.get('/locations');
        setLocations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load locations:', err);
      }
    };

    fetchLocations();
  }, []);

  const handleSellChange = (id, value) => {
    setSellQty((prev) => ({ ...prev, [id]: value }));
  };

  const handleSell = async (item) => {
    const expiry = item.expiryDate ? new Date(item.expiryDate) : null;
    if (expiry && expiry <= new Date()) {
      toast.error('Item is expired and cannot be sold.');
      return;
    }
    const qty = Number(sellQty[item._id]);
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error('Enter a valid quantity to sell.');
      return;
    }
    if (qty > Number(item.quantity || 0)) {
      toast.error('Quantity exceeds available stock.');
      return;
    }

    setSellingId(item._id);
    try {
      const { data } = await api.post('/sales', { itemId: item._id, quantity: qty });
      if (data?.item?._id) {
        setItems((prev) =>
          prev.map((it) => (it._id === data.item._id ? { ...it, quantity: data.item.quantity } : it))
        );
      }
      setReceiptDownloaded(false);
      setReceipt(data?.sale || null);
      setSellQty((prev) => ({ ...prev, [item._id]: '' }));
      toast.success('Sale recorded and stock updated.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record sale.');
    } finally {
      setSellingId(null);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError('Enter your current and new password.');
      return;
    }
    setPasswordSaving(true);
    try {
      await api.put('/settings/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      updateUser({ mustChangePassword: false });
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setShowPasswordPrompt(false);
      toast.success('Password updated.');
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const dismissPasswordPrompt = () => {
    try {
      sessionStorage.setItem(passwordPromptKey, 'dismissed');
    } catch (err) {
      // ignore storage issues
    }
    setShowPasswordPrompt(false);
  };

  const applyBarcodeFilter = useCallback(
    (value) => {
      const code = String(value || '').trim();
      setBarcodeFilter(code);
      setBarcodeInput(code);
      if (!code) return;
      if (items.length === 0) {
        toast.error('Inventory is still loading.');
        return;
      }
      const match = items.find((item) => String(item.barcode || '').trim() === code);
      if (match) {
        setSellQty((prev) => ({ ...prev, [match._id]: prev[match._id] || '1' }));
        if (match.location?._id) {
          setSelectedLocation(match.location._id);
        } else if (match.location) {
          setSelectedLocation(match.location);
        } else {
          setSelectedLocation('all');
        }
      } else {
        toast.error('No item found for this barcode.');
      }
    },
    [items]
  );

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.reset();
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    setScannerError('');
    if (!videoRef.current) return;

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128]);

    const reader = new BrowserMultiFormatReader(hints, {
      delayBetweenScanAttempts: 200,
    });
    scannerRef.current = reader;

    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const preferred =
        devices.find((device) => /back|rear|environment/i.test(device.label)) || devices[0];
      const deviceId = preferred?.deviceId;

      await reader.decodeFromVideoDevice(deviceId, videoRef.current, (result) => {
        if (!result) return;
        const text = result.getText();
        applyBarcodeFilter(text);
        setScannerOpen(false);
      });
    } catch (error) {
      console.error('Scanner error:', error);
      setScannerError('Unable to access the camera. Please check permissions.');
    }
  }, [applyBarcodeFilter]);

  useEffect(() => {
    if (scannerOpen) {
      startScanner();
    } else {
      stopScanner();
    }
    return stopScanner;
  }, [scannerOpen, startScanner, stopScanner]);

  const downloadReceipt = useCallback(
    (data) => {
      const receiptData = data || receipt;
      if (!receiptData) return;
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const marginX = 40;
      let y = 48;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(RECEIPT_BRAND.name, marginX, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      y += 18;
      doc.text(RECEIPT_BRAND.address, marginX, y);
      y += 14;
      doc.text(`Phone: ${RECEIPT_BRAND.phone}`, marginX, y);
      y += 14;
      doc.text(`Email: ${RECEIPT_BRAND.email}`, marginX, y);

      y += 10;
      doc.setLineWidth(0.5);
      doc.line(marginX, y, 555, y);

      y += 22;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Sales Receipt', marginX, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      y += 18;

      const receiptNumber = receiptData.receiptNumber || receiptData._id || 'N/A';
      const soldAt = new Date(
        receiptData.soldAt || receiptData.createdAt || Date.now()
      ).toLocaleString();
      const locationName = receiptData.location?.name || receiptData.location || 'Unassigned';

      doc.text(`Receipt #: ${receiptNumber}`, marginX, y);
      y += 14;
      doc.text(`Date: ${soldAt}`, marginX, y);
      y += 14;
      doc.text(`Salesperson: ${userLabel}`, marginX, y);
      y += 14;
      doc.text(`Location: ${locationName}`, marginX, y);

      const tableBody = [
        [
          receiptData.itemName,
          receiptData.batchNumber || '-',
          String(receiptData.quantity),
          formatCurrency(receiptData.unitPrice),
          formatCurrency(receiptData.total),
        ],
      ];

      autoTable(doc, {
        startY: y + 16,
        head: [['Item', 'Batch', 'Qty', 'Unit Price', 'Total']],
        body: tableBody,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [29, 78, 216] },
        columnStyles: {
          2: { halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'right' },
        },
      });

      const finalY = doc.lastAutoTable?.finalY || y + 60;
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: ${formatCurrency(receiptData.total)}`, marginX, finalY + 18);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Thank you for your purchase.', marginX, finalY + 36);

      doc.save(`receipt-${receiptNumber}.pdf`);
      setReceiptDownloaded(true);
    },
    [formatCurrency, receipt, userLabel]
  );

  useEffect(() => {
    if (!receipt?._id) return;
    if (lastReceiptIdRef.current === receipt._id) return;
    downloadReceipt(receipt);
    lastReceiptIdRef.current = receipt._id;
  }, [downloadReceipt, receipt]);

  const handleDeleteReceipt = () => {
    setReceipt(null);
    setReceiptDownloaded(false);
    lastReceiptIdRef.current = null;
  };

  const headerTitle = isStorekeeper ? 'Storekeeper Dashboard' : 'Sales Dashboard';
  const headerSubtitle = isStorekeeper
    ? 'Manage sales and print receipts quickly.'
    : 'Sell products and print receipts.';

  return (
    <div className="app-shell min-h-screen p-4 md:p-6 space-y-6">
      <div className="app-card px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{headerTitle}</h2>
          <p className="text-sm text-[var(--muted)]">{headerSubtitle}</p>
        </div>
        <div className="flex items-center gap-3">
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
          <Link to="/logout" className="app-btn app-btn-outline text-sm">
            Logout
          </Link>
        </div>
      </div>

      {showPasswordPrompt && (
        <div className="app-card p-5">
          <h3 className="text-lg font-semibold mb-2">Update your password</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            This account was created by an admin. Please change the temporary password or ignore for now.
          </p>
          {passwordError && <div className="text-sm text-rose-500 mb-3">{passwordError}</div>}
          <form onSubmit={handlePasswordUpdate} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <div className="relative">
                <input
                  className="app-input pr-10"
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-[var(--muted)] hover:text-[var(--text)]"
                  aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                >
                  {showCurrentPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <div className="relative">
                <input
                  className="app-input pr-10"
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-[var(--muted)] hover:text-[var(--text)]"
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                >
                  {showNewPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button type="submit" className="app-btn app-btn-primary" disabled={passwordSaving}>
                {passwordSaving ? 'Updating...' : 'Change Password'}
              </button>
              <button type="button" className="app-btn app-btn-outline" onClick={dismissPasswordPrompt}>
                Ignore for now
              </button>
            </div>
          </form>
        </div>
      )}

      {receipt && (
        <div className="app-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Receipt Ready</h3>
              <p className="text-sm text-[var(--muted)]">
                {receipt.itemName} x {receipt.quantity} sold.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="app-btn app-btn-primary" onClick={() => downloadReceipt(receipt)}>
                Download Receipt
              </button>
              {receiptDownloaded && (
                <button className="app-btn app-btn-outline" onClick={handleDeleteReceipt}>
                  Delete Receipt
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
            <div>Receipt #: {receipt.receiptNumber || receipt._id}</div>
            <div>Unit Price: {formatCurrency(receipt.unitPrice)}</div>
            <div>Total: {formatCurrency(receipt.total)}</div>
            <div>Location: {receipt.location?.name || receipt.location || 'Unassigned'}</div>
          </div>
        </div>
      )}

      {scannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="app-card w-full max-w-lg p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold">Scan Barcode</h3>
                <p className="text-xs text-[var(--muted)]">Align the Code128 barcode within the frame.</p>
              </div>
              <button
                type="button"
                className="app-btn app-btn-outline text-sm"
                onClick={() => setScannerOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl bg-black">
              <video ref={videoRef} className="h-72 w-full object-cover" muted playsInline />
            </div>
            {scannerError && <div className="mt-3 text-sm text-rose-500">{scannerError}</div>}
          </div>
        </div>
      )}

      <div className="app-card p-4 overflow-x-auto">
        <h3 className="text-xl font-semibold mb-3">Available Inventory</h3>
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div className="min-w-[180px]">
            <label className="block text-xs font-semibold uppercase text-[var(--muted)] mb-1">
              Location
            </label>
            <select
              className="app-input"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="all">All Locations</option>
              {locations.map((location) => (
                <option key={location._id} value={location._id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-semibold uppercase text-[var(--muted)] mb-1">
              Barcode (Code128)
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                className="app-input flex-1 min-w-[180px]"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan or enter barcode"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyBarcodeFilter(barcodeInput);
                  }
                }}
              />
              <button
                type="button"
                className="app-btn app-btn-primary text-sm"
                onClick={() => applyBarcodeFilter(barcodeInput)}
              >
                Search
              </button>
              <button
                type="button"
                className="app-btn app-btn-outline text-sm"
                onClick={() => applyBarcodeFilter('')}
              >
                Clear
              </button>
              <button
                type="button"
                className="app-btn app-btn-outline text-sm"
                onClick={() => setScannerOpen(true)}
              >
                Scan
              </button>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-sm text-[var(--muted)]">Loading items...</div>
        ) : (
          <table className="app-table w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-[var(--border)]">
              <tr>
                <th className="p-3">Item</th>
                <th className="p-3">Batch</th>
                <th className="p-3">Price</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Location</th>
                <th className="p-3">Expiry</th>
                <th className="p-3">Sell</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const expiry = item.expiryDate ? new Date(item.expiryDate) : null;
                const hasValidExpiry = expiry && !Number.isNaN(expiry.getTime());
                const isExpired = hasValidExpiry && expiry <= now;
                const expiryLabel = !hasValidExpiry
                  ? '-'
                  : isExpired
                    ? <span className="text-rose-500 font-medium">Expired</span>
                    : expiry.toLocaleDateString();

                return (
                  <tr key={item._id} className="border-b border-[var(--border)]">
                    <td className="p-3">{item.name}</td>
                    <td className="p-3 text-[var(--muted)]">{item.batchNumber}</td>
                    <td className="p-3 text-[var(--muted)]">{formatPrice(item.price)}</td>
                    <td className="p-3 font-medium">{item.quantity}</td>
                    <td className="p-3 text-[var(--muted)]">
                      {item.location?.name || item.location || 'Unassigned'}
                    </td>
                    <td className="p-3 text-[var(--muted)]">{expiryLabel}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          className="app-input w-24"
                          type="number"
                          min="1"
                          max={Number(item.quantity) > 0 ? item.quantity : undefined}
                          value={sellQty[item._id] || ''}
                          onChange={(e) => handleSellChange(item._id, e.target.value)}
                          disabled={sellingId === item._id}
                        />
                        <button
                          className="app-btn app-btn-primary text-sm"
                          onClick={() => handleSell(item)}
                          disabled={sellingId === item._id}
                        >
                          {sellingId === item._id ? 'Selling...' : 'Sell'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-[var(--muted)]">
                    No items match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
