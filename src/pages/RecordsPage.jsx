// pages/RecordsPage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaChartBar, FaTimes, FaEye } from "react-icons/fa";
import { motion } from "framer-motion";
import * as recordService from '../services/recordService';
import * as customerService from '../services/customerApi';
import Alert from "../components/common/Alert";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EditRecordDialog from "../components/common/EditRecordDialog";
import DeleteDialog from '../components/common/DeleteDialog';
import { toast } from 'react-toastify';
import { formatCurrency, formatDate } from '../utils/formatters';
import moment from 'moment';
import Pagination from "../components/common/Pagination";

const RecordsPage = () => {
    const navigate = useNavigate();
    const searchInputRef = useRef(null);
    const searchTimerRef = useRef(null);

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [editDialog, setEditDialog] = useState({
        isOpen: false,
        recordId: null
    });
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, recordId: null });
    const [viewDialog, setViewDialog] = useState({ isOpen: false, record: null });

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState({
        startDate: formatDateForInput(new Date(new Date().setDate(1))), // First day of current month
        endDate: formatDateForInput(new Date()) // Today
    });

    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0
    });

    // Format date for input field (YYYY-MM-DD)
    function formatDateForInput(date) {
        if (!date) return '';
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    // Format date for display (DD-MM-YYYY)
    function formatDisplayDate(dateString) {
        if (!dateString) return '';
        // Debug: log the raw date value
        console.log('Record date raw:', dateString);
        // Add 5.5 hours to UTC to show IST date
        return moment.utc(dateString).add(5.5, 'hours').format('DD-MM-YYYY');
    }

    // Fetch records with search (by customer number) and date range
    const fetchRecords = async (currentPage = pagination.currentPage, search = searchTerm, dateRangeParam = dateRange) => {
        try {
            setLoading(true);
            setError(null);

            const filters = {
                startDate: dateRangeParam.startDate,
                endDate: dateRangeParam.endDate,
                // Search by customer number only
                searchTerm: '',
                customerNo: search
            };

            const response = await recordService.getRecords(
                currentPage,
                10, // items per page
                filters
            );

            if (response && response.data) {
                setRecords(response.data);
                setPagination({
                    currentPage: response.pagination?.currentPage || currentPage,
                    totalPages: response.pagination?.totalPages || 1,
                    totalRecords: response.pagination?.totalRecords || 0
                });
            } else {
                setRecords([]);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalRecords: 0
                });
            }

            setLoading(false);
        } catch (err) {
            setError(err?.toString() || "An error occurred while fetching records");
            setLoading(false);
        }
    };

    // Fetch customers
    const fetchCustomers = async () => {
        try {
            const response = await customerService.getCustomers();
            if (response && response.data) {
                setCustomers(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch customers:', err);
        }
    };

    // Handle date change
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle search input with debounce (live search)
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Clear any existing timer
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }

        // Set a new timer for debounce
        searchTimerRef.current = setTimeout(() => {
            // Reset to first page when search changes
            setPagination(prev => ({ ...prev, currentPage: 1 }));
            // Trigger search with the current search value
            fetchRecords(1, value, dateRange);
        }, 300); // 300ms debounce for better performance
    };

    // Clear search - FIXED VERSION
    const clearSearch = () => {
        setSearchTerm("");
        setPagination(prev => ({ ...prev, currentPage: 1 }));

        // Focus the search input after clearing
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }

        // Fetch records immediately with empty search term
        fetchRecords(1, "", dateRange);
    };

    // Apply date filters
    const applyDateFilter = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        fetchRecords(1, searchTerm, dateRange);
    };

    // Handle page change
    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
        fetchRecords(page, searchTerm, dateRange);
    };

    // Create daily records for all customers
    const handleCreateDailyRecords = async () => {
        try {
            setLoading(true);
            const response = await recordService.createDailyRecords();
            if (response && response.count !== undefined) {
                setSuccess(`Successfully created ${response.count} records`);
            } else {
                setSuccess('Daily records created successfully');
            }
            fetchRecords(); // Refresh the list
        } catch (err) {
            setError(err?.toString() || 'Failed to create daily records');
            setLoading(false);
        }
    };

    // Delete record
    const handleDeleteRecord = (recordId) => {
        setDeleteDialog({ isOpen: true, recordId });
    };

    // Confirm delete
    const confirmDelete = async () => {
        try {
            await recordService.deleteRecord(deleteDialog.recordId);
            toast.success('Record deleted successfully');
            fetchRecords(); // Refresh with current state
        } catch (error) {
            toast.error('Failed to delete record');
        } finally {
            setDeleteDialog({ isOpen: false, recordId: null });
        }
    };

    // Reset all filters - FIXED VERSION
    const resetFilters = () => {
        const newDateRange = {
            startDate: formatDateForInput(new Date(new Date().setDate(1))),
            endDate: formatDateForInput(new Date())
        };

        setSearchTerm("");
        setDateRange(newDateRange);
        setPagination(prev => ({ ...prev, currentPage: 1 }));

        // Fetch records with reset values
        fetchRecords(1, "", newDateRange);
    };

    // Initialize data on component mount
    useEffect(() => {
        fetchCustomers();
        fetchRecords();

        return () => {
            // Clean up any timers on unmount
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
        };
    }, []);

    // Clear success message after 3 seconds
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    // Generate pagination items
    const renderPagination = () => {
        if (pagination.totalPages <= 1) return null;

        const pages = [];
        const maxPages = 5; // Maximum number of page buttons to show
        let startPage = Math.max(1, pagination.currentPage - Math.floor(maxPages / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxPages - 1);

        if (endPage - startPage + 1 < maxPages) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }

        // Previous button
        pages.push(
            <button
                key="prev"
                onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
                disabled={pagination.currentPage === 1}
                className={`px-3 py-1 rounded-md ${pagination.currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
            >
                &laquo;
            </button>
        );

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 rounded-md ${pagination.currentPage === i
                        ? "bg-[#2E7CE6] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                >
                    {i}
                </button>
            );
        }

        // Next button
        pages.push(
            <button
                key="next"
                onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-3 py-1 rounded-md ${pagination.currentPage === pagination.totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
            >
                &raquo;
            </button>
        );

        return pages;
    };

    return (
        <div className="p-4 sm:p-6 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Records Management</h1>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleCreateDailyRecords}
                        className="inline-flex items-center px-4 py-2 bg-[#2E7CE6] text-white rounded-lg hover:bg-[#2671d2] transition-colors"
                    >
                        <FaPlus className="mr-2" /> Create Daily Records
                    </button>

                </div>
            </div>

            {/* Alert messages */}
            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={success} />}

            {/* Live Search Bar */}
            <div className="mb-4 relative">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by customer number... (live search)"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        ref={searchInputRef}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2E7CE6]"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>
            </div>

            {/* Date Range Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-4">
                    <form onSubmit={applyDateFilter} className="flex flex-wrap items-end gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={dateRange.startDate}
                                onChange={handleDateChange}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2E7CE6]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={dateRange.endDate}
                                onChange={handleDateChange}
                                min={dateRange.startDate}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2E7CE6]"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#2E7CE6] text-white rounded-md hover:bg-[#2671d2]"
                            >
                                Apply Date Filter
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Active Filters Display */}
            {(searchTerm ||
                dateRange.startDate !== formatDateForInput(new Date(new Date().setDate(1))) ||
                dateRange.endDate !== formatDateForInput(new Date())) && (
                    <div className="mb-4 flex items-center">
                        <span className="text-sm text-gray-500 mr-2">Active filters:</span>
                        {searchTerm && (
                            <span className="inline-flex items-center bg-gray-100 text-gray-800 text-sm rounded-full px-3 py-1 mr-2">
                                Customer No: "{searchTerm.length > 15 ? searchTerm.substring(0, 15) + '...' : searchTerm}"
                            </span>
                        )}
                        {(dateRange.startDate !== formatDateForInput(new Date(new Date().setDate(1))) ||
                            dateRange.endDate !== formatDateForInput(new Date())) && (
                                <span className="inline-flex items-center bg-gray-100 text-gray-800 text-sm rounded-full px-3 py-1 mr-2">
                                    Date: {formatDisplayDate(dateRange.startDate)} to {formatDisplayDate(dateRange.endDate)}
                                </span>
                            )}
                        <button
                            onClick={resetFilters}
                            className="text-sm text-[#2E7CE6] hover:text-[#2671d2]"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}

            {/* Records Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {loading ? (
                    <div className="flex justify-center items-center p-8">
                        <LoadingSpinner />
                    </div>
                ) : records.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>No records found for the selected criteria.</p>
                        {(searchTerm ||
                            dateRange.startDate !== formatDateForInput(new Date(new Date().setDate(1))) ||
                            dateRange.endDate !== formatDateForInput(new Date())) && (
                                <button
                                    onClick={resetFilters}
                                    className="mt-2 text-[#2E7CE6] hover:text-[#2671d2]"
                                >
                                    Reset filters and try again
                                </button>
                            )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Daily Total Qty
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Daily Total Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {records
                                        .filter(record => record.customer)
                                        .map(record => (
                                            <motion.tr
                                                key={record._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDisplayDate(record.date)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{record.customer.name}</div>
                                                    <div className="text-xs text-gray-500">#{record.customer.customerNo}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {record.totalDailyQuantity}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ₹{record.totalDailyPrice?.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-4 items-center">
                                                        <button
                                                            onClick={() => setViewDialog({ isOpen: true, record })}
                                                            className="text-gray-600 hover:text-[#2E7CE6]"
                                                            title="View Details"
                                                        >
                                                            <FaEye size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditDialog({ isOpen: true, recordId: record._id })}
                                                            className="text-[#2E7CE6] hover:text-[#2671d2]"
                                                        >
                                                            <FaEdit size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRecord(record._id)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <FaTrash size={20} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="hidden sm:block">
                                <p className="text-sm text-gray-700">
                                    Showing{' '}
                                    <span className="font-medium">{records.length}</span>{' '}
                                    of{' '}
                                    <span className="font-medium">{pagination.totalRecords}</span>{' '}
                                    records
                                </p>
                            </div>
                            <div className="flex gap-1">
                                {renderPagination()}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Edit Record Dialog */}
            <EditRecordDialog
                isOpen={editDialog.isOpen}
                recordId={editDialog.recordId}
                onClose={() => setEditDialog({ isOpen: false, recordId: null })}
                onSuccess={(message) => {
                    setSuccess(message);
                    fetchRecords();
                }}
            />

            {/* Delete Dialog */}
            <DeleteDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, recordId: null })}
                onConfirm={confirmDelete}
                title="Delete Record"
                message="Are you sure you want to delete this record? This action cannot be undone."
            />

            {/* View Record Dialog */}
            {viewDialog.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-0 relative border border-gray-200">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            onClick={() => setViewDialog({ isOpen: false, record: null })}
                        >
                            <FaTimes size={22} />
                        </button>
                        <div className="px-8 pt-8 pb-2">
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Record Details</h2>
                            {viewDialog.record && (
                                <div>
                                    <div className="mb-6 text-base text-gray-700 space-y-1">
                                        <div><span className="font-semibold">Date:</span> <span className="text-gray-900">{formatDisplayDate(viewDialog.record.date)}</span></div>
                                        <div><span className="font-semibold">Customer:</span> <span className="text-gray-900">{viewDialog.record.customer.name} (#{viewDialog.record.customer.customerNo})</span></div>
                                        <div><span className="font-semibold">Total Qty:</span> <span className="text-gray-900">{viewDialog.record.totalDailyQuantity}</span></div>
                                        <div><span className="font-semibold">Total Price:</span> <span className="text-gray-900">₹{viewDialog.record.totalDailyPrice?.toFixed(2)}</span></div>
                                    </div>
                                    <hr className="my-4 border-gray-200" />
                                    {['morning', 'evening'].map(time => {
                                        const delivery = viewDialog.record.deliverySchedule?.find(d => d.time === time);
                                        return (
                                            <div key={time} className="mb-6">
                                                <div className="font-semibold text-lg mb-2 px-3 py-1 rounded-t bg-blue-50 text-blue-900 border-b border-blue-100">
                                                    {time.charAt(0).toUpperCase() + time.slice(1)} Delivery
                                                </div>
                                                {delivery && delivery.milkItems.length > 0 ? (
                                                    <div className="bg-gray-50 rounded-b-xl shadow-sm border border-gray-200 overflow-x-auto">
                                                        <table className="text-sm w-full">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="px-4 py-2 text-left font-semibold">Type</th>
                                                                    <th className="px-4 py-2 text-left font-semibold">Subcat</th>
                                                                    <th className="px-4 py-2 text-center font-semibold">Qty</th>
                                                                    <th className="px-4 py-2 text-center font-semibold">Rate</th>
                                                                    <th className="px-4 py-2 text-right font-semibold">Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {delivery.milkItems.map((item, idx) => (
                                                                    <tr key={item._id || idx} className="border-b last:border-b-0">
                                                                        <td className="px-4 py-2 text-gray-800">{item.milkType?.name || 'No Type'}</td>
                                                                        <td className="px-4 py-2 text-gray-800">{item.subcategory?.name || 'No Subcat'}</td>
                                                                        <td className="px-4 py-2 text-center">{item.quantity}</td>
                                                                        <td className="px-4 py-2 text-center text-gray-700 bg-gray-50 font-medium">₹{item.pricePerUnit}</td>
                                                                        <td className="px-4 py-2 text-right font-semibold">₹{item.totalPrice}</td>
                                                                    </tr>
                                                                ))}
                                                                <tr className="font-bold bg-blue-50 border-t">
                                                                    <td colSpan={2} className="px-4 py-2">Total</td>
                                                                    <td className="px-4 py-2 text-center">{delivery.totalQuantity}</td>
                                                                    <td className="px-4 py-2"></td>
                                                                    <td className="px-4 py-2 text-right">₹{delivery.totalPrice}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : <span className="text-gray-400 px-3 py-3 block">No delivery</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecordsPage;
