import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaSearch, FaMoneyBillWave, FaUser, FaCalendarAlt, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { getCustomersWithAdvance, createAdvancePayment, getAllCustomers, setAdvanceAmount, clearAdvanceAmount } from '../services/customerApi';

const AdvancePayments = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalAdvance, setTotalAdvance] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allCustomers, setAllCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [amount, setAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loadingCustomersList, setLoadingCustomersList] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editCustomer, setEditCustomer] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Load customers with advance payments
    useEffect(() => {
        fetchCustomersWithAdvance();
    }, []);

    // Filter customers based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredCustomers(customers);
        } else {
            const filtered = customers.filter(customer =>
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.phoneNo.includes(searchTerm) ||
                customer.customerNo.toString().includes(searchTerm)
            );
            setFilteredCustomers(filtered);
        }
    }, [searchTerm, customers]);

    const fetchCustomersWithAdvance = async () => {
        try {
            setLoading(true);
            const data = await getCustomersWithAdvance();

            // Filter customers who have advance amount > 0
            const customersWithAdvance = data.filter(customer =>
                customer.advance && customer.advance > 0
            );

            setCustomers(customersWithAdvance);
            setFilteredCustomers(customersWithAdvance);

            // Calculate total advance
            const total = customersWithAdvance.reduce((sum, customer) =>
                sum + (customer.advance || 0), 0
            );
            setTotalAdvance(total);

        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Failed to load customers with advance payments');
        } finally {
            setLoading(false);
        }
    };

    const openPaymentModal = async () => {
        setAmount('');
        setSelectedCustomerId('');
        setIsModalOpen(true);
        if (allCustomers.length === 0) {
            try {
                setLoadingCustomersList(true);
                const data = await getAllCustomers();
                const list = Array.isArray(data?.customers) ? data.customers : [];
                setAllCustomers(list);
            } catch (error) {
                toast.error(error.message || 'Failed to load customers');
            } finally {
                setLoadingCustomersList(false);
            }
        }
    };

    const closePaymentModal = () => {
        setIsModalOpen(false);
        setSelectedCustomerId('');
        setAmount('');
    };

    const handleCreatePayment = async () => {
        if (!selectedCustomerId) {
            toast.error('Please select a customer');
            return;
        }
        const numericAmount = Number(amount);
        if (!numericAmount || numericAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        try {
            setSubmitting(true);
            await createAdvancePayment({ customerId: selectedCustomerId, amount: numericAmount });
            toast.success('Advance payment added');
            closePaymentModal();
            await fetchCustomersWithAdvance();
        } catch (error) {
            toast.error(error.message || 'Failed to add advance payment');
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (customer) => {
        setEditCustomer(customer);
        setEditAmount(String(customer.advance ?? 0));
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditCustomer(null);
        setEditAmount('');
    };

    const handleSaveEdit = async () => {
        if (!editCustomer) return;
        const numericAmount = Number(editAmount);
        if (Number.isNaN(numericAmount) || numericAmount < 0) {
            toast.error('Please enter a valid non-negative amount');
            return;
        }
        try {
            setSavingEdit(true);
            await setAdvanceAmount(editCustomer._id, numericAmount);
            toast.success('Advance amount updated');
            closeEditModal();
            await fetchCustomersWithAdvance();
        } catch (e) {
            toast.error(e.message || 'Failed to update advance amount');
        } finally {
            setSavingEdit(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="container mx-auto p-6">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
                            <FaMoneyBillWave className="mr-3 text-green-500" />
                            Advance Payments
                        </h1>
                        <p className="text-gray-600 mt-1">Manage customer advance payments</p>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow-md">
                        <div className="text-sm opacity-90">Total Advance Amount</div>
                        <div className="text-2xl font-bold">{formatCurrency(totalAdvance)}</div>
                        <div className="text-sm opacity-90">{filteredCustomers.length} customers</div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, phone, or customer number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchCustomersWithAdvance}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                        <button
                            onClick={openPaymentModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Add Advance Payment
                        </button>
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading customers...</p>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="p-8 text-center">
                        <FaMoneyBillWave className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No advance payments found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'No customers match your search criteria.' : 'No customers have advance payments.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Advance Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Updated
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>

                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                                        <FaUser className="h-5 w-5 text-green-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {customer.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {customer.customerNo}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{customer.phoneNo}</div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                {customer.address || 'No address provided'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-lg font-bold text-green-600">
                                                {formatCurrency(customer.advance)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(customer)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-blue-200 text-blue-700 hover:bg-blue-50"
                                                >
                                                    <FaEdit />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(customer)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                                                >
                                                    <FaTrash />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <FaCalendarAlt className="mr-2 h-4 w-4" />
                                                {formatDate(customer.updatedAt)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Summary Footer */}
            {filteredCustomers.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            Showing {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} with advance payments
                        </div>
                        <div className="text-lg font-semibold text-gray-800">
                            Total: {formatCurrency(filteredCustomers.reduce((sum, customer) => sum + (customer.advance || 0), 0))}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Payment Modal */
            }
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-40" onClick={closePaymentModal}></div>
                    <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Advance Payment</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={selectedCustomerId}
                                onChange={(e) => setSelectedCustomerId(e.target.value)}
                                disabled={loadingCustomersList}
                            >
                                <option value="">{loadingCustomersList ? 'Loading customers...' : 'Select a customer'}</option>
                                {!loadingCustomersList && allCustomers.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.customerNo ? `#${c.customerNo} - ` : ''}{c.name} ({c.phoneNo})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter amount"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closePaymentModal}
                                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreatePayment}
                                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                                disabled={submitting}
                            >
                                {submitting ? 'Adding...' : 'Add Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Advance Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-40" onClick={closeEditModal}></div>
                    <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Advance Amount</h3>
                        {editCustomer && (
                            <div className="mb-4 text-sm text-gray-700">
                                <div className="font-medium">{editCustomer.name}</div>
                                <div className="text-gray-500">ID: {editCustomer.customerNo} • {editCustomer.phoneNo}</div>
                            </div>
                        )}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter amount"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeEditModal}
                                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                                disabled={savingEdit}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                                disabled={savingEdit}
                            >
                                {savingEdit ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete (Clear) Advance Confirm Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-40" onClick={() => setDeleteTarget(null)}></div>
                    <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-0 overflow-hidden">
                        <div className="px-6 pt-6 pb-4 bg-red-50 border-b border-red-100 flex items-start gap-3">
                            <FaExclamationTriangle className="text-red-500 mt-1" />
                            <div>
                                <h3 className="text-base font-semibold text-red-800">Delete Advance Amount?</h3>
                                <p className="text-sm text-red-700 mt-1">This will set the customer's advance to 0. The customer will not be deleted.</p>
                            </div>
                        </div>
                        <div className="px-6 py-4">
                            <p className="text-sm text-gray-700">
                                Customer: <span className="font-medium">{deleteTarget.name}</span> (#{deleteTarget.customerNo})
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Current advance: {formatCurrency(deleteTarget.advance)}</p>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await clearAdvanceAmount(deleteTarget._id);
                                        toast.success('Advance cleared');
                                        setDeleteTarget(null);
                                        await fetchCustomersWithAdvance();
                                    } catch (e) {
                                        toast.error(e.message || 'Failed to clear advance');
                                    }
                                }}
                                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                            >
                                Delete Advance
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancePayments;

// Inline editor component for advance amount
const InlineAdvanceEditor = ({ value, onSave, triggerByButton = false }) => {
    const [editing, setEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value ?? 0);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setLocalValue(value ?? 0);
    }, [value]);

    const commit = async () => {
        const num = Number(localValue);
        if (Number.isNaN(num) || num < 0) {
            toast.error('Enter a valid non-negative number');
            return;
        }
        try {
            setSaving(true);
            await onSave(num);
            setEditing(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {editing ? (
                <input
                    type="number"
                    className="w-32 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="0"
                    step="1"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') commit();
                        if (e.key === 'Escape') setEditing(false);
                    }}
                    autoFocus
                />
            ) : (
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-600">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value || 0)}
                    </span>
                    {triggerByButton ? (
                        <button
                            className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                            onClick={() => setEditing(true)}
                        >
                            Edit
                        </button>
                    ) : (
                        <button
                            className="text-xs text-gray-500 hover:underline"
                            onClick={() => setEditing(true)}
                            title="Click to edit"
                        >
                            Change
                        </button>
                    )}
                </div>
            )}
            {saving && <span className="text-xs text-gray-500">Saving...</span>}
        </div>
    );
};
