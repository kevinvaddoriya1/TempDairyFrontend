import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaMoneyBillWave, FaArrowLeft, FaFileInvoice, FaUser,
    FaCalendarAlt, FaCheckCircle, FaExclamationCircle,
    FaInfoCircle, FaCalculator
} from 'react-icons/fa';
import { getInvoiceById, addPaymentToInvoice } from '../services/invoiceService';
import { getCustomerInvoiceSummary } from '../services/invoiceService';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';

const AddPayment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        amount: '',
        paymentMethod: 'cash',
        transactionId: '',
        notes: ''
    });

    // Quick amount buttons
    const quickAmounts = [
        { label: '25%', calculate: (due) => (due * 0.25).toFixed(2) },
        { label: '50%', calculate: (due) => (due * 0.50).toFixed(2) },
        { label: '75%', calculate: (due) => (due * 0.75).toFixed(2) },
        { label: 'Full', calculate: (due) => due.toFixed(2) }
    ];

    useEffect(() => {
        fetchInvoice();
    }, [id]);

    const fetchInvoice = async () => {
        try {
            setLoading(true);
            const data = await getInvoiceById(id);
            setInvoice(data);
        } catch (err) {
            setError('Failed to fetch invoice details');
        } finally {
            setLoading(false);
        }
    };

    const handleMethodChange = (method) => {
        setFormData(prev => ({ ...prev, paymentMethod: method }));

        // Clear transaction ID when switching to cash
        if (method === 'cash') {
            setFormData(prev => ({ ...prev, transactionId: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const amount = parseFloat(formData.amount);
        if (!amount || amount <= 0) {
            setError('Please enter a valid payment amount');
            return;
        }


        try {
            setSubmitting(true);
            setError('');

            const paymentData = {
                amount: amount,
                paymentMethod: formData.paymentMethod,
                notes: formData.notes || undefined
            };

            // Only add transactionId for online payments if provided
            if (formData.paymentMethod === 'online' && formData.transactionId) {
                paymentData.transactionId = formData.transactionId;
            }
            // If online payment without transactionId, backend will auto-generate

            const response = await addPaymentToInvoice(id, paymentData);

            setSuccess('Payment added successfully!');
            setTimeout(() => {
                navigate(`/invoices/view/${id}`);
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add payment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuickAmount = (calculate) => {
        if (invoice) {
            const amount = calculate(invoice.dueAmount);
            setFormData(prev => ({ ...prev, amount }));
        }
    };

    const isFormValid = () => {
        const amount = parseFloat(formData.amount);
        if (!amount || amount <= 0) return false;
        // Transaction ID is optional for online payments (will be auto-generated if not provided)
        return true;
    };

    if (loading) return <LoadingSpinner />;
    if (!invoice) return <div>Invoice not found</div>;

    const paymentPercentage = formData.amount ?
        ((parseFloat(formData.amount) / invoice.dueAmount) * 100).toFixed(1) : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate(`/invoices/view/${id}`)}
                                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <FaArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold">Add Payment</h1>
                                <p className="text-sm text-gray-600">Invoice {invoice.invoiceNumber}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Alerts */}
                {error && (
                    <div className="mb-6">
                        <Alert type="error" message={error} onClose={() => setError('')} />
                    </div>
                )}
                {success && (
                    <div className="mb-6">
                        <Alert type="success" message={success} onClose={() => setSuccess('')} />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Invoice Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <FaUser className="text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-600">Customer</p>
                                        <p className="font-medium">{invoice.customer.name}</p>
                                        <p className="text-sm text-gray-500">{invoice.customer.customerNo}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <FaCalendarAlt className="text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-600">Invoice Date</p>
                                        <p className="font-medium">{formatDate(invoice.createdAt)}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <FaFileInvoice className="text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                            invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'
                                            }`}>
                                            {invoice.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Amount</span>
                                        <span className="font-medium">{formatCurrency(invoice.totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Paid Amount</span>
                                        <span className="font-medium text-green-600">
                                            {formatCurrency(invoice.amountPaid || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t">
                                        <span className="text-gray-900 font-medium">Due Amount</span>
                                        <span className="font-bold text-red-600">
                                            {formatCurrency(invoice.dueAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Progress */}
                        {formData.amount && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Progress</h4>
                                <div className="relative">
                                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 transition-all duration-300"
                                            style={{ width: `${paymentPercentage}%` }}
                                        />
                                    </div>
                                    <p className="text-center text-sm text-gray-600 mt-2">
                                        {paymentPercentage}% of due amount
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Information</h3>

                            {/* Amount Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Amount
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                        ₹
                                    </span>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        step="0.01"
                                        className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter payment amount"
                                    />
                                </div>

                                {/* Overpayment Info */}
                                <div className="mt-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded p-2">
                                    You can pay more than the due amount. Any extra will be credited as advance and automatically applied to your next invoice.
                                </div>

                                {/* Quick Amount Buttons */}
                                <div className="flex gap-2 mt-3">
                                    {quickAmounts.map((quick) => (
                                        <button
                                            key={quick.label}
                                            type="button"
                                            onClick={() => handleQuickAmount(quick.calculate)}
                                            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                        >
                                            {quick.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Payment Method
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'cash', label: 'Cash', icon: '💵' },
                                        { value: 'online', label: 'Online', icon: '💳' }
                                    ].map((method) => (
                                        <button
                                            key={method.value}
                                            type="button"
                                            onClick={() => handleMethodChange(method.value)}
                                            className={`p-4 rounded-lg border-2 transition-all ${formData.paymentMethod === method.value
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                        >
                                            <div className="text-2xl mb-2">{method.icon}</div>
                                            <div className="font-medium">{method.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Transaction ID - Only for Online payments */}
                            {formData.paymentMethod === 'online' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Transaction ID <span className="text-gray-500">(Optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="transactionId"
                                        value={formData.transactionId}
                                        onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter transaction ID or leave blank to auto-generate"
                                    />

                                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex items-start gap-2 text-sm">
                                            <FaInfoCircle className="text-amber-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-amber-800">
                                                <p className="font-medium">Transaction ID Information:</p>
                                                <ul className="mt-1 list-disc list-inside text-amber-700">
                                                    <li>Leave blank to auto-generate ID</li>
                                                    <li>Auto format: {new Date().getFullYear()}_{invoice?.customer?.customerNo}_[N]</li>
                                                    <li>Or enter your own reference number</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Notes
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Add any notes about this payment (optional)"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/invoices/view/${id}`)}
                                    className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !isFormValid()}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <LoadingSpinner size="small" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <FaMoneyBillWave />
                                            Add Payment
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddPayment;