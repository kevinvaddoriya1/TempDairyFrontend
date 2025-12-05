import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaFileInvoice, FaUsers, FaUser, FaCalendarAlt,
    FaArrowLeft, FaCheck, FaSpinner, FaInfoCircle
} from 'react-icons/fa';
import { generateCustomerInvoice, generateBatchInvoices } from '../services/invoiceService';
import { getCustomers } from '../services/customerApi';
import Alert from '../components/common/Alert';

const GenerateInvoice = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState('single');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [customers, setCustomers] = useState([]);
    const [advanceUsed, setAdvanceUsed] = useState(0);

    // Get previous month as default
    const getPreviousMonth = () => {
        const now = new Date();
        const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return {
            month: previousMonth.getMonth() + 1,
            year: previousMonth.getFullYear()
        };
    };

    const defaultPeriod = getPreviousMonth();
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [month, setMonth] = useState(defaultPeriod.month);
    const [year, setYear] = useState(defaultPeriod.year);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await getCustomers();
            setCustomers(response.customers || []);
        } catch (err) {
            setError('Failed to fetch customers');
        }
    };

    const handleGenerate = async () => {
        setError('');
        setSuccess('');
        setAdvanceUsed(0);

        if (tab === 'single' && !selectedCustomer) {
            setError('Please select a customer');
            return;
        }

        try {
            setLoading(true);

            if (tab === 'single') {
                const response = await generateCustomerInvoice(selectedCustomer, {
                    month,
                    year,
                    updateExisting: true // Always allow update for single tab
                });

                // Show advance used if present
                if (response.advanceUsed && response.advanceUsed > 0) {
                    setAdvanceUsed(response.advanceUsed);
                }

                // Check if it was an update or new creation based on response
                if (response.updatedAt && response.createdAt &&
                    new Date(response.updatedAt) > new Date(response.createdAt)) {
                    setSuccess(`Invoice ${response.invoiceNumber} updated successfully!`);
                } else {
                    setSuccess(`Invoice ${response.invoiceNumber} generated successfully!`);
                }
                setTimeout(() => navigate(`/invoices/view/${response._id}`), 2500);
            } else {
                const response = await generateBatchInvoices(month, year, { updateExisting: true });

                let message = '';
                if (response.updated > 0 && response.created > 0) {
                    message = `Generated ${response.created} new invoices and updated ${response.updated} existing invoices!`;
                } else if (response.updated > 0) {
                    message = `Updated ${response.updated} existing invoices!`;
                } else if (response.created > 0) {
                    message = `Generated ${response.created} new invoices!`;
                } else {
                    message = 'No invoices were processed.';
                }

                setSuccess(message);

                if (response.failed > 0) {
                    setError(`${response.failed} invoices failed to process.`);
                }
                setTimeout(() => navigate('/invoices'), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate invoice');
        } finally {
            setLoading(false);
        }
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Simple Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/invoices')}
                                className="mr-4 p-2 rounded-lg hover:bg-gray-100"
                            >
                                <FaArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-xl font-semibold">Generate Invoice</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto py-8 px-4">
                {/* Alerts */}
                {error && <Alert type="error" message={error} onClose={() => setError('')} />}
                {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
                {advanceUsed > 0 && (
                    <div className="mb-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
                            Advance of <b>₹{advanceUsed.toFixed(2)}</b> was applied to this invoice.
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm">
                    {/* Tab Navigation */}
                    <div className="border-b">
                        <div className="flex">
                            <button
                                onClick={() => setTab('single')}
                                className={`flex-1 py-4 text-center font-medium transition-colors relative ${tab === 'single'
                                    ? 'text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <FaUser />
                                    Single Customer
                                </div>
                                {tab === 'single' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                                )}
                            </button>

                            <button
                                onClick={() => setTab('batch')}
                                className={`flex-1 py-4 text-center font-medium transition-colors relative ${tab === 'batch'
                                    ? 'text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <FaUsers />
                                    All Customers
                                </div>
                                {tab === 'batch' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        {/* Customer Selection - Only for Single */}
                        {tab === 'single' && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Customer
                                </label>
                                <select
                                    value={selectedCustomer}
                                    onChange={(e) => setSelectedCustomer(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Choose a customer</option>
                                    {customers.map(customer => (
                                        <option key={customer._id} value={customer._id}>
                                            {customer.name} ({customer.customerNo})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Period Selection */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Invoice Period
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <select
                                            value={month}
                                            onChange={(e) => setMonth(parseInt(e.target.value))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {months.map((m, i) => (
                                                <option key={i} value={i + 1}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <select
                                            value={year}
                                            onChange={(e) => setYear(parseInt(e.target.value))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[0, 1, 2, 3, 4].map(offset => {
                                                const y = new Date().getFullYear() - offset;
                                                return <option key={y} value={y}>{y}</option>;
                                            })}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex">
                                    <FaInfoCircle className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium mb-1">
                                            Invoice will be generated for {months[month - 1]} {year}
                                        </p>
                                        <p className="text-blue-700">
                                            {tab === 'single'
                                                ? 'This will create a new invoice or update an existing one for the selected customer with all their delivery records for this month.'
                                                : 'This will create new invoices or update existing ones for all active customers who have delivery records for this month.'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                onClick={() => navigate('/invoices')}
                                className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={loading || (tab === 'single' && !selectedCustomer)}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FaFileInvoice />
                                        Generate Invoice
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenerateInvoice;