import api from './api';

// Get all subcategories
export const getSubcategories = async (categoryId = null) => {
  const url = categoryId ? `/subcategories?category=${categoryId}` : '/subcategories';
  const { data } = await api.get(url);
  console.log(data)
  return data;
};

// Get subcategory by ID
export const getSubcategoryById = async (id) => {
  const { data } = await api.get(`/subcategories/${id}`);
  return data;
};

// Create new subcategory
export const createSubcategory = async (subcategoryData) => {
  const { data } = await api.post('/subcategories', subcategoryData);
  return data;
};

// Update subcategory
export const updateSubcategory = async (id, subcategoryData) => {
  const { data } = await api.put(`/subcategories/${id}`, subcategoryData);
  return data;
};

// Delete subcategory
export const deleteSubcategory = async (id) => {
  const { data } = await api.delete(`/subcategories/${id}`);
  return data;
};