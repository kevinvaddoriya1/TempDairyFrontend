import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaArrowLeft, FaPrint, FaDownload, FaEdit, FaMoneyBillWave,
    FaFileInvoice, FaCalendarAlt, FaUser, FaPhone, FaMapMarkerAlt,
    FaCheckCircle, FaClock, FaExclamationCircle
} from 'react-icons/fa';
import { getInvoiceById } from '../services/invoiceService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import { formatCurrency, formatDate } from '../utils/formatters';
import { downloadInvoicePDF, printInvoicePDF } from '../services/invoiceService';

const InvoiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [generating, setGenerating] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});

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

    const handleDownloadPDF = async (invoiceId) => {
        try {
            setPdfLoading(true);
            await downloadInvoicePDF(invoiceId);
        } catch (err) {
            console.error('Error downloading invoice PDF:', err);
            setError(err.message || 'Failed to download PDF. Please try again.');
        } finally {
            setPdfLoading(false);
        }
    };

    const handlePrintPDF = async (invoiceId) => {
        try {
            setPdfLoading(true);
            await printInvoicePDF(invoiceId);

            // Since printing happens in a new window, we can set loading to false after a delay
            setTimeout(() => {
                setPdfLoading(false);
            }, 1000);
        } catch (err) {
            console.error('Error printing invoice PDF:', err);
            setError(err.message || 'Failed to print PDF. Please try again.');
            setPdfLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FaClock },
            paid: { bg: 'bg-green-100', text: 'text-green-800', icon: FaCheckCircle },
            partially_paid: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FaExclamationCircle },
            overdue: { bg: 'bg-red-100', text: 'text-red-800', icon: FaExclamationCircle }
        };

        const badge = badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: FaFileInvoice };
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
                <Icon className="w-4 h-4" />
                {status.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    const toggleRow = (date) => {
        setExpandedRows(prev => ({
            ...prev,
            [date]: !prev[date]
        }));
    };

    if (loading) return <LoadingSpinner />;
    if (!invoice) return <div>Invoice not found</div>;

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const invoiceMonth = new Date(invoice.startDate).getMonth();
    const invoiceYear = new Date(invoice.startDate).getFullYear();

    return (
        <>
            {/* Screen View */}
            <div className="min-h-screen bg-gray-50 print:hidden">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center">
                                <button
                                    onClick={() => navigate('/invoices')}
                                    className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <FaArrowLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h1 className="text-xl font-semibold">Invoice Details</h1>
                                    <p className="text-sm text-gray-600">{invoice.invoiceNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handlePrintPDF(invoice._id)}  // This passes a callback function
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                                >
                                    <FaPrint className="w-4 h-4" />
                                    Print
                                </button>
                                <button
                                    onClick={() => handleDownloadPDF(invoice._id)}  // This passes a callback function
                                    disabled={generating}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                                >
                                    {generating ? (
                                        <>
                                            <LoadingSpinner size="small" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <FaDownload className="w-4 h-4" />
                                            Download PDF
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {error && <Alert type="error" message={error} onClose={() => setError('')} />}

                    <div className="bg-white rounded-lg shadow-sm">
                        {/* Invoice Header */}
                        <div className="px-8 py-6 border-b">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                                    <p className="text-gray-600 mt-1">#{invoice.invoiceNumber}</p>
                                </div>
                                {getStatusBadge(invoice.status)}
                            </div>
                        </div>

                        {/* Invoice Info */}
                        <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Bill To</h3>
                                <div className="space-y-2">
                                    <p className="font-semibold text-gray-900">{invoice.customer.name}</p>
                                    <p className="text-gray-600">Customer ID: {invoice.customer.customerNo}</p>
                                    {invoice.customer.phoneNo && (
                                        <p className="text-gray-600 flex items-center gap-2">
                                            <FaPhone className="w-4 h-4" />
                                            {invoice.customer.phoneNo}
                                        </p>
                                    )}
                                    {invoice.customer.address && (
                                        <p className="text-gray-600 flex items-start gap-2">
                                            <FaMapMarkerAlt className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            {invoice.customer.address}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="text-right">
                                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Invoice Details</h3>
                                <div className="space-y-2">
                                    <p className="text-gray-600">
                                        <span className="font-medium">Date:</span> {formatDate(invoice.createdAt)}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Due Date:</span> {formatDate(invoice.dueDate)}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Period:</span> {months[invoiceMonth]} {invoiceYear}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Items Table - Professional Collapsible View */}
                        <div className="overflow-x-auto mt-6">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Total Qty</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Price</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {invoice.items.map(item => {
                                        let totalQty = 0;
                                        let totalPrice = 0;
                                        const milkDetails = [];
                                        item.deliverySchedule.forEach(delivery => {
                                            delivery.milkItems.forEach(milkItem => {
                                                totalQty += milkItem.quantity;
                                                totalPrice += milkItem.totalPrice;
                                                milkDetails.push({
                                                    time: delivery.time,
                                                    milkType: milkItem.milkType?.name || '—',
                                                    subcategory: milkItem.subcategory?.name || '—',
                                                    quantity: milkItem.quantity,
                                                    pricePerUnit: milkItem.pricePerUnit,
                                                    totalPrice: milkItem.totalPrice,
                                                });
                                            });
                                        });
                                        const dateKey = item.date;
                                        return (
                                            <React.Fragment key={dateKey}>
                                                <tr className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 font-semibold">{formatDate(item.date)}</td>
                                                    <td className="px-4 py-2 text-center">{totalQty}</td>
                                                    <td className="px-4 py-2 text-right">{formatCurrency(totalPrice)}</td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button
                                                            className="text-blue-600 hover:underline focus:outline-none"
                                                            onClick={() => toggleRow(dateKey)}
                                                        >
                                                            {expandedRows[dateKey] ? '▲ Details' : '▼ Details'}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedRows[dateKey] && (
                                                    <tr>
                                                        <td colSpan={4} className="bg-gray-50 px-4 py-2">
                                                            <table className="w-full text-sm border">
                                                                <thead>
                                                                    <tr>
                                                                        <th className="px-2 py-1 text-left">Delivery</th>
                                                                        <th className="px-2 py-1 text-left">Milk Type</th>
                                                                        <th className="px-2 py-1 text-left">Subcategory</th>
                                                                        <th className="px-2 py-1 text-center">Qty</th>
                                                                        <th className="px-2 py-1 text-center">Rate</th>
                                                                        <th className="px-2 py-1 text-right">Total</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {milkDetails.map((milk, idx) => (
                                                                        <tr key={idx} className="hover:bg-blue-50">
                                                                            <td className="px-2 py-1 font-medium flex items-center gap-1">
                                                                                {milk.time === 'morning' ? (
                                                                                    <span className="inline-flex items-center text-blue-700 bg-blue-100 rounded px-2 py-0.5 text-xs font-semibold"><FaClock className="mr-1" />Morning</span>
                                                                                ) : (
                                                                                    <span className="inline-flex items-center text-yellow-700 bg-yellow-100 rounded px-2 py-0.5 text-xs font-semibold"><FaClock className="mr-1" />Evening</span>
                                                                                )}
                                                                            </td>
                                                                            <td className="px-2 py-1">{milk.milkType || '—'}</td>
                                                                            <td className="px-2 py-1">{milk.subcategory || '—'}</td>
                                                                            <td className="px-2 py-1 text-center">{milk.quantity?.toFixed(2) ?? '—'}</td>
                                                                            <td className="px-2 py-1 text-center">₹{milk.pricePerUnit?.toFixed(2) ?? '—'}</td>
                                                                            <td className="px-2 py-1 text-right font-semibold">₹{milk.totalPrice?.toFixed(2) ?? '—'}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Payment Summary */}
                        <div className="px-8 py-6 bg-gray-50 border-t">
                            <div className="max-w-xs ml-auto">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">{formatCurrency(invoice.totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Paid Amount</span>
                                        <span className="font-medium text-green-600">{formatCurrency(invoice.amountPaid || 0)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                        <span className="font-semibold">Due Amount</span>
                                        <span className="font-bold text-red-600">{formatCurrency(invoice.dueAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment History */}
                        {invoice.payments && invoice.payments.length > 0 && (
                            <div className="px-8 py-6 border-t">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                                <div className="space-y-3">
                                    {invoice.payments.map((payment, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{formatCurrency(payment.amount)}</p>
                                                <p className="text-sm text-gray-600">
                                                    {formatDate(payment.paymentDate)} - {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                                                </p>
                                                {payment.transactionId && (
                                                    <p className="text-sm text-gray-500">TXN: {payment.transactionId}</p>
                                                )}
                                            </div>
                                            <FaCheckCircle className="text-green-500 w-5 h-5" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        {invoice.status !== 'paid' && (
                            <div className="px-8 py-6 border-t">
                                <button
                                    onClick={() => navigate(`/invoices/payment/${invoice._id}`)}
                                    className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FaMoneyBillWave />
                                    Add Payment
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Print View */}
            <div className="hidden print:block">
                <PrintableInvoice invoice={invoice} />
            </div>
        </>
    );
};

// Printable Invoice Component
const PrintableInvoice = ({ invoice }) => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const gujaratiMonths = [
        'જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન',
        'જુલાઈ', 'ઓગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'
    ];

    const invoiceMonth = new Date(invoice.startDate).getMonth();
    const invoiceYear = new Date(invoice.startDate).getFullYear();
    const daysInMonth = new Date(invoiceYear, invoiceMonth + 1, 0).getDate();

    // Create calendar data
    const getCalendarData = () => {
        const data = [];
        for (let i = 0; i < 11; i++) {
            const row = {
                date1: i + 1 <= daysInMonth ? i + 1 : null,
                morning1: '',
                evening1: '',
                date2: i + 12 <= daysInMonth ? i + 12 : null,
                morning2: '',
                evening2: '',
                date3: i + 23 <= daysInMonth ? i + 23 : null,
                morning3: '',
                evening3: ''
            };

            // Fill in the data
            invoice.items.forEach(item => {
                const itemDate = new Date(item.date).getDate();
                if (itemDate === row.date1) {
                    row.morning1 = item.morningQuantity;
                    row.evening1 = item.eveningQuantity;
                } else if (itemDate === row.date2) {
                    row.morning2 = item.morningQuantity;
                    row.evening2 = item.eveningQuantity;
                } else if (itemDate === row.date3) {
                    row.morning3 = item.morningQuantity;
                    row.evening3 = item.eveningQuantity;
                }
            });

            data.push(row);
        }
        return data;
    };

    const calendarData = getCalendarData();

    return (
        <div className="w-full max-w-[210mm] mx-auto p-4" style={{ height: '297mm', border: '2px solid black' }}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                    <div className="bg-black text-white p-4 rounded">
                        <h1 className="text-2xl font-bold">RAMDEV</h1>
                        <p className="text-lg">ડેરી ફાર્મ</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold">ઉમેશભાઈ</p>
                    <p>મો. ૭૦૪૧૬૮૧૦૦૦</p>
                    <p className="font-bold mt-2">નિકુંજભાઈ</p>
                    <p>મો. ૭૨૦૩૮૩૫૮૫૯</p>
                </div>
            </div>

            {/* Month and Rate */}
            <div className="mb-4">
                <p className="text-lg font-bold">
                    માસ: {gujaratiMonths[invoiceMonth]} {invoiceYear} &nbsp;&nbsp;&nbsp;&nbsp;
                    ભાવ: {formatCurrency(invoice.items[0]?.price || 0)}
                </p>
            </div>

            {/* Calendar Grid */}
            <table className="w-full border-collapse mb-6">
                <thead>
                    <tr>
                        <th className="border border-black p-2 text-center">તા.</th>
                        <th className="border border-black p-2 text-center">સવાર</th>
                        <th className="border border-black p-2 text-center">સાંજ</th>
                        <th className="border border-black p-2 text-center">તા.</th>
                        <th className="border border-black p-2 text-center">સવાર</th>
                        <th className="border border-black p-2 text-center">સાંજ</th>
                        <th className="border border-black p-2 text-center">તા.</th>
                        <th className="border border-black p-2 text-center">સવાર</th>
                        <th className="border border-black p-2 text-center">સાંજ</th>
                    </tr>
                </thead>
                <tbody>
                    {calendarData.map((row, index) => (
                        <tr key={index}>
                            <td className="border border-black p-2 text-center font-bold">{row.date1 || ''}</td>
                            <td className="border border-black p-2 text-center">{row.morning1}</td>
                            <td className="border border-black p-2 text-center">{row.evening1}</td>
                            <td className="border border-black p-2 text-center font-bold">{row.date2 || ''}</td>
                            <td className="border border-black p-2 text-center">{row.morning2}</td>
                            <td className="border border-black p-2 text-center">{row.evening2}</td>
                            <td className="border border-black p-2 text-center font-bold">{row.date3 || ''}</td>
                            <td className="border border-black p-2 text-center">{row.morning3}</td>
                            <td className="border border-black p-2 text-center">{row.evening3}</td>
                        </tr>
                    ))}
                    <tr>
                        <td className="border border-black p-2 text-center font-bold">કુલ</td>
                        <td className="border border-black p-2 text-center font-bold">
                            {invoice.items.reduce((sum, item) => sum + item.morningQuantity, 0)}
                        </td>
                        <td className="border border-black p-2 text-center font-bold">
                            {invoice.items.reduce((sum, item) => sum + item.eveningQuantity, 0)}
                        </td>
                        <td className="border border-black p-2 text-center font-bold">કુલ</td>
                        <td className="border border-black p-2 text-center font-bold"></td>
                        <td className="border border-black p-2 text-center font-bold"></td>
                        <td className="border border-black p-2 text-center font-bold">કુલ</td>
                        <td className="border border-black p-2 text-center font-bold"></td>
                        <td className="border border-black p-2 text-center font-bold"></td>
                    </tr>
                </tbody>
            </table>

            {/* Summary Section */}
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <table className="w-full max-w-xs">
                        <tbody>
                            <tr>
                                <td className="py-1">હિસાબ માસ :</td>
                                <td className="py-1 font-bold">{gujaratiMonths[invoiceMonth]} {invoiceYear}</td>
                            </tr>
                            <tr>
                                <td className="py-1">કુલ લિટર :</td>
                                <td className="py-1 font-bold">{invoice.totalQuantity} લીટર</td>
                            </tr>
                            <tr>
                                <td className="py-1">કુલ બિલ :</td>
                                <td className="py-1 font-bold">{formatCurrency(invoice.totalAmount)}</td>
                            </tr>
                            <tr>
                                <td className="py-1">જમા / બાકી :</td>
                                <td className="py-1 font-bold">{formatCurrency(invoice.amountPaid || 0)}</td>
                            </tr>
                            <tr>
                                <td className="py-1">કુલ બાકી :</td>
                                <td className="py-1 font-bold">{formatCurrency(invoice.dueAmount)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* QR Code Placeholder */}
                <div className="border-2 border-black p-4 text-center">
                    <div className="w-32 h-32 bg-gray-200 mb-2 flex items-center justify-center">
                        QR CODE
                    </div>
                    <p className="text-sm">QR For Payment</p>
                </div>
            </div>

            {/* Footer Notes */}
            <div className="mt-6">
                <p className="text-sm">• બીલ ૧૦ તારીખ પહેલા ફરજીયાત જમા કરાવવું.</p>
                <p className="text-sm">• વધારે-ઓછું દૂધ જોઈએ તો પહેલા થી જણાવવું.</p>
            </div>
        </div>
    );
};

export default InvoiceDetail;