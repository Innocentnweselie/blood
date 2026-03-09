import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';

export default function CreateItem() {
  const [name, setName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [barcode, setBarcode] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [reorderLevel, setReorderLevel] = useState(0);
  const [expiryDate, setExpiryDate] = useState('');
  const [supplier, setSupplier] = useState('');
  const [locationId, setLocationId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const resetForm = () => {
    setName('');
    setBatchNumber('');
    setBarcode('');
    setQuantity(0);
    setPrice(0);
    setReorderLevel(0);
    setExpiryDate('');
    setSupplier('');
    setLocationId('');
    setCategoryId('');
  };

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const { data } = await api.get('/suppliers');
        setSuppliers(data);
      } catch (err) {
        console.error("Failed to fetch suppliers:", err);
        toast.error("Could not load suppliers list.");
      }
    };

    const fetchLocations = async () => {
      try {
        const { data } = await api.get('/locations');
        const list = Array.isArray(data) ? data : [];
        setLocations(list);
        if (!locationId && list.length > 0) {
          setLocationId(list[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    };

    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        const list = Array.isArray(data) ? data : [];
        setCategories(list);
        if (!categoryId && list.length > 0) {
          setCategoryId(list[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchSuppliers();
    fetchLocations();
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { 
        name, 
        batchNumber, 
        barcode: barcode.trim() || undefined,
        quantity: Number(quantity), 
        price: Number(price),
        reorderLevel: Number(reorderLevel), 
        expiryDate: expiryDate || undefined, 
        supplier,
        locationId: locationId || undefined,
        categoryId: categoryId || undefined,
      };
      const res = await api.post('/items', body);
      toast.success('Item created successfully!');
      resetForm();
      navigate('/inventory');
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || err.message || 'Request failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Create Item">
      <div className="p-6">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Create Item</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Batch Number</label>
          <input value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} required className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Barcode (Code128)</label>
          <input value={barcode} onChange={(e) => setBarcode(e.target.value)} className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
          <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reorder Level</label>
          <input type="number" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} required className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
          <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">-- Select a Location --</option>
            {locations.map((loc) => (
              <option key={loc._id} value={loc._id}>{loc.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">-- Select a Category --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier</label>
          <select
            value={supplier}
            onChange={(e) => {
              if (e.target.value === 'add_new') {
                navigate('/suppliers');
              } else {
                setSupplier(e.target.value);
              }
            }}
            className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">-- Select a Supplier --</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s.name}>{s.name}</option>
            ))}
            <option value="add_new" className="font-bold text-blue-600 bg-blue-50 mt-1">+ Add New Supplier</option>
          </select>
        </div>
        <div className="text-right">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-60">
            {loading ? 'Creating...' : 'Create Item'}
          </button>
        </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
