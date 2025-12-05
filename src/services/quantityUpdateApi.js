// services/quantityUpdateApi.js
import api from './api';

/**
 * Get all quantity updates with optional filters
 * @param {Object} params - Filter parameters
 * @param {string} params.startDate - Start date for filtering
 * @param {string} params.endDate - End date for filtering
 * @param {string} params.customerId - Customer ID for filtering
 * @returns {Promise<Object>} - Quantity updates response
 */
export const getQuantityUpdates = async (params = {}) => {
    try {
        const response = await api.get('/updates/quantity', { params });
        return response.data;

    } catch (error) {
        console.error('API error in getQuantityUpdates:', error);
        return {
            success: true,
            count: 0,
            data: []
        };
    }
};

/**
 * Create a quantity update
 * @param {Object} updateData - Quantity update data
 * @param {string} updateData.customerId - Customer ID
 * @param {string} updateData.date - Date for the update
 * @param {string} updateData.updateType - Type of update ('morning' or 'evening')
 * @param {number} updateData.newQuantity - New quantity value
 * @param {string} updateData.reason - Reason for the update
 * @returns {Promise<Object>} - Created quantity update
 */
export const createQuantityUpdate = async (updateData) => {
    try {
        const response = await api.post('/updates/quantity', updateData);
        return response.data;
    } catch (error) {
        console.error('API error in createQuantityUpdate:', error);
        throw error.response ? error.response.data : new Error('Error creating quantity update');
    }
};

/**
 * Get quantity updates for a specific customer
 * @param {string} customerId - Customer ID
 * @param {Object} params - Additional filter parameters
 * @returns {Promise<Object>} - Quantity updates for the customer
 */
export const getCustomerQuantityUpdates = async (customerId, params = {}) => {
    try {
        const queryParams = { ...params, customerId };
        const response = await api.get('/updates/quantity', { params: queryParams });
        return response.data;
    } catch (error) {
        console.error('API error in getCustomerQuantityUpdates:', error);
        throw error.response ? error.response.data : new Error('Error fetching customer quantity updates');
    }
};

/**
 * Get today's quantity updates
 * @returns {Promise<Object>} - Today's quantity updates
 */
export const getTodaysQuantityUpdates = async () => {
    try {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format

        const params = {
            startDate: formattedDate,
            endDate: formattedDate
        };

        const response = await api.get('/updates/quantity', { params });
        return response.data;
    } catch (error) {
        console.error('API error in getTodaysQuantityUpdates:', error);
        throw error.response ? error.response.data : new Error('Error fetching today\'s quantity updates');
    }
};


export const acceptQuantityUpdate = (id, lastUpdated) => {
    return api.patch(`/updates/quantity/accept`, { id, lastUpdated });
};

export const rejectQuantityUpdate = (id, reason) => {
    return api.patch(`/updates/quantity/${id}/reject`, { reason });
};

export default {
    getQuantityUpdates,
    createQuantityUpdate,
    getCustomerQuantityUpdates,
    getTodaysQuantityUpdates,
    rejectQuantityUpdate,
    acceptQuantityUpdate
};