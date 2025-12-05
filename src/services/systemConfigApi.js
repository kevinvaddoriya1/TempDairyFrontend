// services/systemConfigApi.js
import api from './api';

// Get system configuration
export const getSystemConfig = async () => {
    try {
        const response = await api.get('/config');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error fetching system configuration');
    }
};

// Update system configuration
export const updateSystemConfig = async (configData) => {
    try {
        const response = await api.put('/config', configData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error updating system configuration');
    }
};

// Add milkman
export const addMilkman = async (milkmanData) => {
    try {
        const response = await api.post('/config/milkman', milkmanData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error adding milkman');
    }
};

// Update milkman
export const updateMilkman = async (id, milkmanData) => {
    try {
        const response = await api.put(`/config/milkman/${id}`, milkmanData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error updating milkman');
    }
};

// Delete milkman
export const deleteMilkman = async (id) => {
    try {
        const response = await api.delete(`/config/milkman/${id}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error deleting milkman');
    }
};

// Get active milkmen
export const getActiveMilkmen = async () => {
    try {
        const response = await api.get('/config/milkmen');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error fetching milkmen');
    }
};

// Admin management functions
export const getAllAdmins = async () => {
    try {
        const response = await api.get('/auth/admins');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error fetching admins');
    }
};

export const createAdmin = async (adminData) => {
    try {
        const response = await api.post('/auth/admins', adminData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error creating admin');
    }
};

export const updateAdmin = async (id, adminData) => {
    try {
        const response = await api.put(`/auth/admins/${id}`, adminData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error updating admin');
    }
};

export const deleteAdmin = async (id) => {
    try {
        const response = await api.delete(`/auth/admins/${id}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error deleting admin');
    }
};
