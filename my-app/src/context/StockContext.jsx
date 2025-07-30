import React, { createContext, useContext, useState } from 'react';

// Example initial stock data
const initialStock = [
  {
    id: 1,
    name: 'Paracetamol',
    batchNumber: 'A123',
    quantity: 100,
    reorderLevel: 20,
    expiryDate: '2025-12-31',
  },
  {
    id: 2,
    name: 'Ibuprofen',
    batchNumber: 'B456',
    quantity: 50,
    reorderLevel: 10,
    expiryDate: '2025-08-15',
  },
];

const StockContext = createContext();

export function StockProvider({ children }) {
  const [items, setItems] = useState(initialStock);

  // You can add more stock management functions here
  return (
    <StockContext.Provider value={{ items, setItems }}>
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  return useContext(StockContext);
}
