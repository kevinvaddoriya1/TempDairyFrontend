import api from './api';

// Get all invoices with filters
export const getInvoices = async (params = {}) => {
    try {
        const { data } = await api.get('/invoices', { params });
        return data;
    } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }
};

// Get invoice dashboard data
export const getInvoiceDashboard = async () => {
    const { data } = await api.get('/invoices/dashboard');
    return data;
};

// Check if invoice already exists for customer and period
export const checkExistingInvoice = async (customerId, { month, year }) => {
    try {
        const { data } = await api.get('/invoices/check-existing', {
            params: {
                customerId,
                month,
                year
            }
        });
        return data;
    } catch (error) {
        // If no existing invoice found, return null
        if (error.response?.status === 404) {
            return { exists: false };
        }
        throw error;
    }
};

// Generate invoice for a specific customer (with update capability)
export const generateCustomerInvoice = async (customerId, { month, year, updateExisting = false }) => {
    const { data } = await api.post(`/invoices/generate/customer/${customerId}`, {
        month,
        year,
        updateExisting
    });
    return data;
};

// Generate batch invoices (with update capability)
export const generateBatchInvoices = async (month, year, { updateExisting = false } = {}) => {
    const { data } = await api.post('/invoices/generate/batch', {
        month,
        year,
        updateExisting
    });
    return data;
};

// Get customer invoice summary
export const getCustomerInvoiceSummary = async (customerId) => {
    const { data } = await api.get(`/invoices/customer/${customerId}/summary`);
    return data;
};

// Get specific invoice by ID
export const getInvoiceById = async (invoiceId) => {
    const { data } = await api.get(`/invoices/${invoiceId}`);
    return data;
};

// Update invoice status
export const updateInvoiceStatus = async (invoiceId, status) => {
    const { data } = await api.put(`/invoices/${invoiceId}/status`, { status });
    return data;
};

// Add payment to invoice
export const addPaymentToInvoice = async (invoiceId, paymentData) => {
    const { data } = await api.post(`/invoices/${invoiceId}/payment`, paymentData);
    return data;
};

// Delete invoice
export const deleteInvoice = async (invoiceId) => {
    const { data } = await api.delete(`/invoices/${invoiceId}`);
    return data;
};

/**
 * Download invoice PDF
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise<Blob>} - PDF data as blob
 */
export const downloadInvoicePDF = async (invoiceId) => {
    try {
        const response = await api.get(`/invoices/${invoiceId}/pdf`, {
            responseType: 'blob'
        });

        // Create a blob URL from the response
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        // Create a link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${invoiceId}.pdf`);
        document.body.appendChild(link);
        link.click();

        // Clean up
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);

        return response.data;
    } catch (error) {
        console.error('Error downloading invoice PDF:', error);
        throw error;
    }
};

/**
 * Print invoice PDF
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise<boolean>} - Success status
 */
export const printInvoicePDF = async (invoiceId) => {
    try {
        // First, get the PDF data from the API
        const response = await api.get(`/invoices/${invoiceId}/pdf`, {
            responseType: 'blob'
        });

        // Create a blob URL from the response
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const blobUrl = window.URL.createObjectURL(blob);

        // Open in a new window
        const printWindow = window.open(blobUrl, '_blank');

        if (!printWindow) {
            throw new Error('Popup window was blocked. Please allow popups for this site.');
        }

        // Print after the window loads
        printWindow.addEventListener('load', () => {
            printWindow.print();
            // Clean up the blob URL after printing
            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
            }, 100);
        }, { once: true });

        return true;
    } catch (error) {
        console.error('Error printing invoice PDF:', error);
        throw error;
    }
};
// Get customers with pending (due) amounts with pagination
export const getDueCustomers = async (params = {}) => {
    try {
        const { data } = await api.get('/invoices/due/customers', { params });
        return data;
    } catch (error) {
        console.error('Error fetching due customers:', error);
        throw error;
    }
};

// Search due customers across all data
export const searchDueCustomers = async (q) => {
    try {
        const { data } = await api.get('/invoices/due/customers/search', { params: { q } });
        return data;
    } catch (error) {
        console.error('Error searching due customers:', error);
        throw error;
    }
};
