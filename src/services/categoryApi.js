  import api from './api';

  // Get all categories
  export const getCategories = async () => {
    const { data } = await api.get('/categories');
    return data;
  };

  // Get category by ID
  export const getCategoryById = async (id) => {
    const { data } = await api.get(`/categories/${id}`);
    return data;
  };

  // Create new category
  export const createCategory = async (categoryData) => {
    const { data } = await api.post('/categories', categoryData);
    return data;
  };

  // Update category
  export const updateCategory = async (id, categoryData) => {
    const { data } = await api.put(`/categories/${id}`, categoryData);
    return data;
  };

  // Delete category
  export const deleteCategory = async (id) => {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  };

  // Get category with subcategories
  export const getCategoryWithSubcategories = async (id) => {
    const { data } = await api.get(`/categories/${id}/subcategories`);
    return data;
  };