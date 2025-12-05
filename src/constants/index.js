// API Endpoints
export const API_ENDPOINTS = {
    CUSTOMERS: '/api/customers',
    INVOICES: '/api/invoices',
    STOCK: '/api/stock',
    RECORDS: '/api/records',
    CATEGORIES: '/api/categories',
    SUBCATEGORIES: '/api/subcategories',
    HOLIDAYS: '/api/holidays',
    QUANTITY_UPDATES: '/api/quantity-updates'
};

// Status Types
export const STATUS_TYPES = {
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    INFO: 'info'
};

// Time Filters
export const TIME_FILTERS = {
    TODAY: 'today',
    YESTERDAY: 'yesterday',
    THIS_WEEK: 'thisWeek',
    THIS_MONTH: 'thisMonth',
    LAST_MONTH: 'lastMonth',
    CUSTOM: 'custom'
};

// Table Page Sizes
export const TABLE_PAGE_SIZES = [10, 20, 50, 100];

// Default Values
export const DEFAULT_VALUES = {
    PAGE_SIZE: 10,
    DATE_FORMAT: 'YYYY-MM-DD',
    CURRENCY: '₹'
}; 