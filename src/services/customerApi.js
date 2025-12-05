// services/customerApi.js
import api from './api';

export const getCustomers = async (params = {}) => {
  try {
    console.log('Sending API request with params:', params);

    // Make sure search param is correctly passed to the API
    // Some APIs use 'search', others might use 'searchTerm' or 'q'
    // Adjust based on your backend API
    const queryParams = { ...params };

    const response = await api.get('/customers', { params: queryParams });

    console.log('API response received:', {
      totalCustomers: response.data.totalCustomers,
      count: response.data.customers?.length || 0
    });

    return response.data;
  } catch (error) {
    console.error('API error in getCustomers:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Error fetching customers';
    const enhancedError = new Error(errorMessage);
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const getAllCustomers = async () => {
  try {
    const response = await api.get('/customers');
    console.log('API response received:', {
      totalCustomers: response.data.totalCustomers,
      count: response.data.customers?.length || 0
    });
    return response.data;
  } catch (error) {
    console.error('API error in getAllCustomers:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Error fetching customers';
    const enhancedError = new Error(errorMessage);
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const getCustomerById = async (id) => {
  try {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error(`API error in getCustomerById(${id}):`, error);
    const errorMessage = error.response?.data?.message || error.message || 'Error fetching customer details';
    const enhancedError = new Error(errorMessage);
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// Create new customer
export const createCustomer = async (customerData) => {
  try {
    const response = await api.post('/customers', customerData);
    return response.data;
  } catch (error) {
    console.error('API error in createCustomer:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Error creating customer';
    const enhancedError = new Error(errorMessage);
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// Update customer
export const updateCustomer = async (id, customerData) => {
  try {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  } catch (error) {
    console.error(`API error in updateCustomer(${id}):`, error);
    const errorMessage = error.response?.data?.message || error.message || 'Error updating customer';
    const enhancedError = new Error(errorMessage);
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// Delete customer
export const deleteCustomer = async (id) => {
  try {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error(`API error in deleteCustomer(${id}):`, error);
    const errorMessage = error.response?.data?.message || error.message || 'Error deactivating customer';
    const enhancedError = new Error(errorMessage);
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// Get milk types (categories)
export const getMilkTypes = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('API error in getMilkTypes:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Error fetching milk types';
    const enhancedError = new Error(errorMessage);
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// Get subcategories by milk type (category ID)
export const getSubcategoriesByMilkType = async (milkTypeId) => {
  try {
    const response = await api.get(`/subcategories?category=${milkTypeId}`);
    return response.data;
  } catch (error) {
    console.error(`API error in getSubcategoriesByMilkType(${milkTypeId}):`, error);
    const errorMessage = error.response?.data?.message || error.message || 'Error fetching subcategories';
    const enhancedError = new Error(errorMessage);
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// Get customers with advance payments
export const getCustomersWithAdvance = async () => {
  try {
    const response = await api.get('/customers/with-advance');
    return response.data;
  } catch (error) {
    console.error('API error in getCustomersWithAdvance:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Error fetching customers with advance';
    const enhancedError = new Error(errorMessage);
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// Create an advance payment for a customer
export const createAdvancePayment = async ({ customerId, amount }) => {
  try {
    const response = await api.post('/customers/advancepayment', { customerId, amount });
    return response.data;
  } catch (error) {
    console.error('API error in createAdvancePayment:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Error creating advance payment';
    const enhancedError = new Error(errorMessage);
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// Set a customer's advance amount
export const setAdvanceAmount = async (customerId, amount) => {
  try {
    const response = await api.put(`/customers/${customerId}/advance`, { amount });
    return response.data;
  } catch (error) {
    console.error('API error in setAdvanceAmount:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Error updating advance amount';
    const enhancedError = new Error(errorMessage);
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

// Clear a customer's advance (set to 0)
export const clearAdvanceAmount = async (customerId) => {
  try {
    const response = await api.put(`/customers/${customerId}/advance/clear`);
    return response.data;
  } catch (error) {
    console.error('API error in clearAdvanceAmount:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Error clearing advance amount';
    const enhancedError = new Error(errorMessage);
    enhancedError.response = error.response;
    throw enhancedError;
  }
};
