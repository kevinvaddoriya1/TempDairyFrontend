import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaFileInvoice, FaPlus, FaFilter, FaDownload, FaEye,
    FaMoneyBillWave, FaTrash, FaSearch, FaClock, FaCheckCircle,
    FaExclamationCircle, FaCalendarAlt, FaTimes
} from 'react-icons/fa';
import { getInvoices, deleteInvoice, getInvoiceDashboard } from '../services/invoiceService';
import { getCustomers } from '../services/customerApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import DeleteDialog from '../components/common/DeleteDialog';
import Pagination from '../components/common/Pagination';
import { formatCurrency, formatDate } from '../utils/formatters';

const InvoicesPage = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dashboardData, setDashboardData] = useState(null);
    const [allInvoices, setAllInvoices] = useState([]);

    // Get previous month as default
    const getPreviousMonth = () => {
        // Try to get saved values from localStorage first
        const savedMonth = localStorage.getItem('selectedInvoiceMonth');
        const savedYear = localStorage.getItem('selectedInvoiceYear');

        // If we have saved values, use them
        if (savedMonth && savedYear) {
            return {
                month: savedMonth,
                year: savedYear
            };
        }

        // Otherwise, use previous month as default
        const now = new Date();
        const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return {
            month: (previousMonth.getMonth() + 1).toString(),
            year: previousMonth.getFullYear().toString()
        };
    };

    // Selected month state (default to previous month)
    const defaultMonth = getPreviousMonth();
    const [selectedMonth, setSelectedMonth] = useState(defaultMonth.month);
    const [selectedYear, setSelectedYear] = useState(defaultMonth.year);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        customerId: '',
        status: '',
        month: defaultMonth.month,
        year: defaultMonth.year
    });

    const [showFilters, setShowFilters] = useState(false);

    // Quick filter states
    const [quickFilter, setQuickFilter] = useState('all');

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            // Prepare query parameters
            const params = {
                page: currentPage,
                limit: 10
            };

            // Add filters to params if they have values
            if (filters.customerId) params.customerId = filters.customerId;
            if (filters.status) params.status = filters.status;

            // Handle quick filters
            if (quickFilter === 'pending') params.status = 'pending';
            else if (quickFilter === 'paid') params.status = 'paid';
            else if (quickFilter === 'overdue') params.status = 'overdue';

            // Always send the selected month and year from header selector
            params.month = selectedMonth;
            params.year = selectedYear;

            // Also check if filters have specific month/year (for advanced filters)
            if (filters.month && filters.year) {
                params.month = filters.month;
                params.year = filters.year;
            }

            const response = await getInvoices(params);

            if (response) {
                setInvoices(response.invoices || []);
                setTotalPages(response.totalPages || 1);
                setTotal(response.total || 0);
            }
        } catch (err) {
            console.error('Error fetching invoices:', err);
            setError(err.message || 'Failed to fetch invoices');
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters, quickFilter, selectedMonth, selectedYear]);

    const fetchAllInvoicesForSearch = useCallback(async () => {
        try {
            const params = {
                page: 1,
                limit: 1000, // Get all invoices for search
                month: selectedMonth,
                year: selectedYear
            };

            const response = await getInvoices(params);
            if (response) {
                setAllInvoices(response.invoices || []);
            }
        } catch (err) {
            console.error('Error fetching all invoices:', err);
        }
    }, [selectedMonth, selectedYear]);

    const fetchCustomers = useCallback(async () => {
        try {
            const response = await getCustomers();
            if (response && response.customers) {
                setCustomers(response.customers);
            } else if (Array.isArray(response)) {
                setCustomers(response);
            }
        } catch (err) {
            console.error('Failed to fetch customers:', err);
        }
    }, []);

    const fetchDashboard = useCallback(async () => {
        try {
            const data = await getInvoiceDashboard();
            setDashboardData(data.summary);
        } catch (err) {
            console.error('Failed to fetch dashboard:', err);
        }
    }, []);

    // Calculate dashboard stats for selected month from invoices
    const getMonthlyStats = useCallback(() => {
        if (!allInvoices || allInvoices.length === 0) {
            return {
                totalInvoices: 0,
                totalAmount: 0,
                pendingCount: 0,
                overdueCount: 0,
                paidCount: 0,
                dueAmount: 0
            };
        }

        const stats = allInvoices.reduce((acc, invoice) => {
            acc.totalInvoices += 1;
            acc.totalAmount += invoice.totalAmount || 0;
            acc.dueAmount += invoice.dueAmount || 0;

            if (invoice.status === 'pending') acc.pendingCount += 1;
            else if (invoice.status === 'overdue') acc.overdueCount += 1;
            else if (invoice.status === 'paid') acc.paidCount += 1;

            return acc;
        }, {
            totalInvoices: 0,
            totalAmount: 0,
            pendingCount: 0,
            overdueCount: 0,
            paidCount: 0,
            dueAmount: 0
        });

        return stats;
    }, [allInvoices]);

    const monthlyStats = getMonthlyStats();

    // Initial load
    useEffect(() => {
        fetchCustomers();
        fetchDashboard();
    }, [fetchCustomers, fetchDashboard]);

    // Fetch invoices when dependencies change
    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    // Fetch all invoices for search when month/year changes
    useEffect(() => {
        fetchAllInvoicesForSearch();
    }, [fetchAllInvoicesForSearch]);

    // Use this for searching across all data
    const displayedInvoices = searchTerm ?
        allInvoices.filter(invoice =>
            invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice((currentPage - 1) * 10, currentPage * 10)
        : invoices;

    const handleDelete = async () => {
        if (!selectedInvoice) return;

        try {
            setError('');
            await deleteInvoice(selectedInvoice._id);
            setShowDeleteConfirm(false);
            setSelectedInvoice(null);
            await fetchInvoices();
            await fetchDashboard();
        } catch (err) {
            console.error('Error deleting invoice:', err);
            setError(err.message || 'Failed to delete invoice');
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
        setQuickFilter('all'); // Reset quick filter when manual filter is applied
    };

    const handleMonthChange = (month, year) => {
        // Save to state
        setSelectedMonth(month);
        setSelectedYear(year);

        // Save to localStorage
        localStorage.setItem('selectedInvoiceMonth', month);
        localStorage.setItem('selectedInvoiceYear', year);

        // Reset to page 1 and update filters
        setCurrentPage(1);
        setFilters(prev => ({ ...prev, month, year }));
    };

    const handleQuickFilter = (filterType) => {
        setQuickFilter(filterType);
        setFilters(prev => ({
            ...prev,
            customerId: '',
            status: '',
            // Keep the selected month/year
            month: selectedMonth,
            year: selectedYear
        }));
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setFilters({
            customerId: '',
            status: '',
            month: selectedMonth,
            year: selectedYear
        });
        setQuickFilter('all');
        setSearchTerm('');
        setCurrentPage(1);
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: FaClock },
            paid: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: FaCheckCircle },
            partially_paid: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: FaExclamationCircle },
            overdue: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: FaExclamationCircle }
        };

        const badge = badges[status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: FaFileInvoice };
        const Icon = badge.icon;

        return (
            <span className={`px-3 py-1.5 inline-flex items-center gap-1.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text} border ${badge.border}`}>
                <Icon className="w-3 h-3" />
                {(status || '').replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    const canDeleteInvoice = (invoice) => {
        return invoice &&
            (invoice.status === 'pending' || invoice.status === 'overdue') &&
            (!invoice.payments || invoice.payments.length === 0);
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let i = 0; i < 5; i++) {
        yearOptions.push(currentYear - i);
    }


    const hasActiveFilters = Object.values(filters).some(value => value !== '') || quickFilter !== 'all' || searchTerm;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                            <p className="text-sm text-gray-600 mt-1">Manage and track all customer invoices</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center gap-4">
                            {/* Month Selector */}
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                                <FaCalendarAlt className="text-gray-600 w-4 h-4" />
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => handleMonthChange(e.target.value, selectedYear)}
                                    className="bg-transparent border-none focus:outline-none text-sm font-medium text-gray-700"
                                >
                                    {months.map((month, i) => (
                                        <option key={i} value={i + 1}>
                                            {month}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => handleMonthChange(selectedMonth, e.target.value)}
                                    className="bg-transparent border-none focus:outline-none text-sm font-medium text-gray-700"
                                >
                                    {yearOptions.map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Link
                                to="/invoices/generate"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <FaPlus className="w-4 h-4" />
                                Generate Invoice
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Invoices</p>
                                <p className="text-2xl font-bold text-gray-900">{monthlyStats.totalInvoices}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {months[parseInt(selectedMonth) - 1]} {selectedYear}
                                </p>
                            </div>
                            <FaFileInvoice className="w-8 h-8 text-gray-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyStats.totalAmount)}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Due: {formatCurrency(monthlyStats.dueAmount)}
                                </p>
                            </div>
                            <FaMoneyBillWave className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{monthlyStats.pendingCount}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {monthlyStats.pendingCount > 0 && `${Math.round(monthlyStats.pendingCount / monthlyStats.totalInvoices * 100)}% of total`}
                                </p>
                            </div>
                            <FaClock className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Overdue</p>
                                <p className="text-2xl font-bold text-red-600">{monthlyStats.overdueCount}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {monthlyStats.overdueCount > 0 && `${Math.round(monthlyStats.overdueCount / monthlyStats.totalInvoices * 100)}% of total`}
                                </p>
                            </div>
                            <FaExclamationCircle className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search Section */}
            <div className="px-6 pb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Quick Filters and Search */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-2 overflow-x-auto">
                                <button
                                    onClick={() => handleQuickFilter('all')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${quickFilter === 'all'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => handleQuickFilter('pending')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${quickFilter === 'pending'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Pending
                                </button>
                                <button
                                    onClick={() => handleQuickFilter('paid')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${quickFilter === 'paid'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Paid
                                </button>
                                <button
                                    onClick={() => handleQuickFilter('overdue')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${quickFilter === 'overdue'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Overdue
                                </button>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search invoices..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <FaTimes className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <FaFilter className="w-4 h-4" />
                                    Filters
                                    {hasActiveFilters && !showFilters && (
                                        <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                                            Active
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Customer
                                    </label>
                                    <select
                                        value={filters.customerId}
                                        onChange={(e) => handleFilterChange('customerId', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Customers</option>
                                        {customers.map(customer => (
                                            <option key={customer._id} value={customer._id}>
                                                {customer.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="partially_paid">Partially Paid</option>
                                        <option value="overdue">Overdue</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Month/Year
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={filters.month}
                                            onChange={(e) => handleFilterChange('month', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">All Months</option>
                                            {months.map((month, i) => (
                                                <option key={i} value={i + 1}>
                                                    {month}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={filters.year}
                                            onChange={(e) => handleFilterChange('year', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">All Years</option>
                                            {yearOptions.map(year => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={resetFilters}
                                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                                    >
                                        <FaTimes className="w-3 h-3" />
                                        Clear all filters
                                    </button>
                                    {(filters.customerId || filters.status ||
                                        (filters.month !== selectedMonth || filters.year !== selectedYear)) && (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {filters.customerId && (
                                                    <span className="px-2 py-1 bg-white text-gray-700 rounded-full text-xs border flex items-center gap-1">
                                                        {customers.find(c => c._id === filters.customerId)?.name}
                                                        <button
                                                            onClick={() => handleFilterChange('customerId', '')}
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            <FaTimes className="w-2 h-2" />
                                                        </button>
                                                    </span>
                                                )}
                                                {filters.status && (
                                                    <span className="px-2 py-1 bg-white text-gray-700 rounded-full text-xs border flex items-center gap-1">
                                                        {filters.status.replace('_', ' ')}
                                                        <button
                                                            onClick={() => handleFilterChange('status', '')}
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            <FaTimes className="w-2 h-2" />
                                                        </button>
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Showing {displayedInvoices.length} invoices
                                    {searchTerm && ` (${allInvoices.filter(inv =>
                                        inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        inv.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).length} total matches)`}
                                    {' '}for {months[parseInt(selectedMonth) - 1]} {selectedYear}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Invoices Table */}
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-8 flex justify-center">
                                <LoadingSpinner />
                            </div>
                        ) : error ? (
                            <div className="p-4">
                                <Alert type="error" message={error} onClose={() => setError('')} />
                            </div>
                        ) : displayedInvoices.length === 0 ? (
                            <div className="p-8 text-center">
                                <FaFileInvoice className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 mb-2">No invoices found</p>
                                {(hasActiveFilters || searchTerm) && (
                                    <button
                                        onClick={() => {
                                            resetFilters();
                                            setSearchTerm('');
                                        }}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Clear filters and search to see all invoices
                                    </button>
                                )}
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Invoice #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Period
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Due Date
                                        </th>
                                        <th className="relative px-6 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {displayedInvoices.map((invoice) => (
                                        <tr key={invoice._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FaFileInvoice className="w-5 h-5 text-gray-400 mr-3" />
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {invoice.invoiceNumber}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {invoice.customer?.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {invoice.customer?.customerNo}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formatDate(invoice.startDate)} - {formatDate(invoice.endDate)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(invoice.totalAmount)}
                                                    </div>
                                                    {invoice.dueAmount > 0 && (
                                                        <div className="text-sm text-gray-500">
                                                            Due: {formatCurrency(invoice.dueAmount)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(invoice.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <FaCalendarAlt className="w-4 h-4 text-gray-400 mr-2" />
                                                    {formatDate(invoice.dueDate)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/invoices/view/${invoice._id}`)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View Invoice"
                                                    >
                                                        <FaEye className="w-4 h-4" />
                                                    </button>
                                                    {invoice.status !== 'paid' && (
                                                        <button
                                                            onClick={() => navigate(`/invoices/payment/${invoice._id}`)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Add Payment"
                                                        >
                                                            <FaMoneyBillWave className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {canDeleteInvoice(invoice) && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedInvoice(invoice);
                                                                setShowDeleteConfirm(true);
                                                            }}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Invoice"
                                                        >
                                                            <FaTrash className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {!searchTerm && totalPages > 1 && (
                        <div className="p-4 border-t border-gray-200">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                    {searchTerm && displayedInvoices.length > 10 && (
                        <div className="p-4 border-t border-gray-200">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(allInvoices.filter(inv =>
                                    inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    inv.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).length / 10)}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <DeleteDialog
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setSelectedInvoice(null);
                }}
                onConfirm={handleDelete}
                title="Delete Invoice"
                message={selectedInvoice ?
                    `Are you sure you want to delete invoice ${selectedInvoice.invoiceNumber}? This action cannot be undone.` :
                    'Are you sure you want to delete this invoice?'
                }
            />
        </div>
    );
};

export default InvoicesPage;