import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/axiosInstance';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import AdminLayout from './AdminLayout';

export default function EditItem() {
  const [form, setForm] = useState({
    name: '',
    batchNumber: '',
    barcode: '',
    quantity: 0,
    price: 0,
    reorderLevel: 0,
    expiryDate: '',
    supplier: '',
    locationId: '',
    categoryId: '',
  });
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemRes, suppliersRes, locationsRes, categoriesRes] = await Promise.all([
          api.get(`/items/${id}`),
          api.get('/suppliers'),
          api.get('/locations'),
          api.get('/categories'),
        ]);

        const itemData = itemRes.data;
        setForm({
          name: itemData.name,
          batchNumber: itemData.batchNumber,
          barcode: itemData.barcode || '',
          quantity: itemData.quantity,
          price: itemData.price ?? 0,
          reorderLevel: itemData.reorderLevel,
          expiryDate: dayjs(itemData.expiryDate).format('YYYY-MM-DD'),
          supplier: itemData.supplier,
          locationId: itemData.location?._id || itemData.location || '',
          categoryId: itemData.category?._id || itemData.category || '',
        });
        setSuppliers(suppliersRes.data);
        setLocations(Array.isArray(locationsRes.data) ? locationsRes.data : []);
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      } catch (err) {
        toast.error('Failed to load item data.');
        navigate('/inventory');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        ...form,
        quantity: Number(form.quantity),
        price: Number(form.price),
        reorderLevel: Number(form.reorderLevel),
      };
      
      await api.put(`/items/${id}`, body);
      toast.success('Item updated successfully!');
      navigate('/inventory');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update item.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Item">
        <div className="p-6 dark:bg-gray-900 dark:text-white">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Item">
      <div className="p-6">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Edit Item</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            {Object.entries(form).map(([key, value]) => {
              const label = key === 'locationId'
                ? 'Location'
                : key.replace(/([A-Z])/g, ' $1');
              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{label}</label>
              {key === 'supplier' ? (
                    <select name="supplier" value={value} onChange={handleChange} className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <option value="">-- Select a Supplier --</option>
                      {suppliers.map((s) => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </select>
                  ) : key === 'locationId' ? (
                    <select
                      name="locationId"
                      value={value}
                      onChange={handleChange}
                      className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">-- Select a Location --</option>
                      {locations.map((loc) => (
                        <option key={loc._id} value={loc._id}>{loc.name}</option>
                      ))}
                    </select>
                  ) : key === 'categoryId' ? (
                    <select
                      name="categoryId"
                      value={value}
                      onChange={handleChange}
                      className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">-- Select a Category --</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={
                        key === 'expiryDate'
                          ? 'date'
                          : ['quantity', 'reorderLevel', 'price'].includes(key)
                          ? 'number'
                          : 'text'
                      }
                      name={key}
                      value={value}
                      onChange={handleChange}
                      required={key !== 'barcode'}
                      className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  )}
                </div>
              );
            })}
            <div className="text-right">
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-60">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
