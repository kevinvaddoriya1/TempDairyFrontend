// services/recordService.js
import api from './api.js';

// Get all records with filters
export const getRecords = async (page = 1, limit = 10, filters = {}) => {
    try {
        const { startDate, endDate, customerId, customerNo, searchTerm } = filters;
        let url = `/records?page=${page}&limit=${limit}`;

        if (startDate && endDate) {
            url += `&startDate=${startDate}&endDate=${endDate}`;
        }

        if (customerId) {
            url += `&customerId=${customerId}`;
        }

        if (customerNo) {
            url += `&customerNo=${customerNo}`;
        }

        if (searchTerm) {
            url += `&searchTerm=${searchTerm}`;
        }

        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error?.response?.data?.error || 'Failed to fetch records';
    }
};

// Get record by ID
export const getRecordById = async (id) => {
    try {
        const response = await api.get(`/records/${id}`);
        return response.data;
    } catch (error) {
        throw error?.response?.data?.error || 'Failed to fetch record';
    }
};

// Update record
export const updateRecord = async (id, recordData) => {
    try {
        const response = await api.put(`/records/${id}`, recordData);
        return response.data;
    } catch (error) {
        throw error?.response?.data?.error || 'Failed to update record';
    }
};

// Delete record
export const deleteRecord = async (id) => {
    try {
        const response = await api.delete(`/records/${id}`);
        return response.data;
    } catch (error) {
        throw error?.response?.data?.error || 'Failed to delete record';
    }
};

// Create daily records for all customers
export const createDailyRecords = async () => {
    try {
        const response = await api.post('/records/daily');
        return response.data;
    } catch (error) {
        throw error?.response?.data?.error || 'Failed to create daily records';
    }
};

// Get records summary
export const getRecordsSummary = async (startDate, endDate, customerId) => {
    try {
        let url = `/records/summary?startDate=${startDate}&endDate=${endDate}`;

        if (customerId) {
            url += `&customerId=${customerId}`;
        }

        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error?.response?.data?.error || 'Failed to fetch records summary';
    }
};
