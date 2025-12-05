import api from './api';

// Get all stock entries
export const getStockEntries = async (params) => {
  const { data } = await api.get('/stock', { params });
  return data;
};

// Get stock entry by ID
export const getStockEntryById = async (id) => {
  const { data } = await api.get(`/stock/${id}`);
  return data;
};

// Create new stock entry
export const createStockEntry = async (entryData) => {
  const { data } = await api.post('/stock', entryData);
  return data;
};

// Update stock entry
export const updateStockEntry = async (id, entryData) => {
  const { data } = await api.put(`/stock/${id}`, entryData);
  return data;
};

// Delete stock entry
export const deleteStockEntry = async (id) => {
  const { data } = await api.delete(`/stock/${id}`);
  return data;
};

// Get stock summary
export const getStockSummary = async (params) => {
  const { data } = await api.get('/stock/summary', { params });
  return data;
};

// Get stock by category
export const getStockByCategory = async (params) => {
  const { data } = await api.get('/stock/categories', { params });
  return data;
};