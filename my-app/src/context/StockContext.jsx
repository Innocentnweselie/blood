import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/axiosInstance";

const StockContext = createContext(null);

export function StockProvider({ children, initialItems = [] }) {
  const [items, setItems] = useState(initialItems);
  const [loadingStock, setLoadingStock] = useState(false);

  const loadStock = async () => {
    try {
      setLoadingStock(true);
      const res = await api.get("/inventory");
      setItems(res.data);
    } catch (err) {
      console.error("Error loading inventory:", err);
    } finally {
      setLoadingStock(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  const addItem = (item) => setItems((prev) => [...prev, item]);
  const updateItem = (id, patch) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  const value = { items, setItems, loadingStock, loadStock, addItem, updateItem, removeItem };

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
}

export const useStock = () => {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error("useStock must be used within a StockProvider");
  return ctx;
};
