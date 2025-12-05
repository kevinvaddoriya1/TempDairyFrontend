// components/EditRecordDialog.jsx
import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import * as recordService from '../../services/recordService';
import LoadingSpinner from "../common/LoadingSpinner";

const EditRecordDialog = ({ isOpen, onClose, recordId, onSuccess }) => {
    const [record, setRecord] = useState(null); // Will hold the full record object
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [customerDetails, setCustomerDetails] = useState(null);
    const [recordDate, setRecordDate] = useState(null);

    // Fetch record details when dialog opens
    useEffect(() => {
        if (isOpen && recordId) {
            fetchRecord();
        }
    }, [isOpen, recordId]);

    const fetchRecord = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await recordService.getRecordById(recordId);
            const recordData = response.data;
            setRecord(recordData);
            setCustomerDetails(recordData.customer);
            setRecordDate(new Date(recordData.date));
            setLoading(false);
        } catch (err) {
            setError('Failed to load record details. Please try again.');
            setLoading(false);
        }
    };

    // Handle milk item change
    const handleMilkItemChange = (deliveryTime, idx, field, value) => {
        setRecord(prev => {
            const newDeliverySchedule = prev.deliverySchedule.map(delivery => {
                if (delivery.time !== deliveryTime) return delivery;
                const newMilkItems = delivery.milkItems.map((item, i) => {
                    if (i !== idx) return item;
                    const updated = {
                        ...item,
                        [field]: field === 'quantity' || field === 'pricePerUnit' ? parseFloat(value) || 0 : value
                    };
                    updated.totalPrice = updated.quantity * updated.pricePerUnit;
                    return updated;
                });
                const totalQuantity = newMilkItems.reduce((sum, item) => sum + item.quantity, 0);
                const totalPrice = newMilkItems.reduce((sum, item) => sum + item.totalPrice, 0);
                return { ...delivery, milkItems: newMilkItems, totalQuantity, totalPrice };
            });
            // Recalculate daily totals
            const totalDailyQuantity = newDeliverySchedule.reduce((sum, d) => sum + d.totalQuantity, 0);
            const totalDailyPrice = newDeliverySchedule.reduce((sum, d) => sum + d.totalPrice, 0);
            return { ...prev, deliverySchedule: newDeliverySchedule, totalDailyQuantity, totalDailyPrice };
        });
    };

    // Format date (DD-MM-YYYY)
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [day, month, year].join('-');
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError(null);
            // Only send the fields that are editable
            await recordService.updateRecord(recordId, {
                deliverySchedule: record.deliverySchedule,
                totalDailyQuantity: record.totalDailyQuantity,
                totalDailyPrice: record.totalDailyPrice
            });
            setSubmitting(false);
            onSuccess('Record updated successfully');
            onClose();
        } catch (err) {
            setError(err.toString());
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={onClose}
                    />
                    {/* Dialog */}
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative z-10"
                        >
                            {/* Dialog Header */}
                            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-800">Edit Record</h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            {/* Dialog Content */}
                            <div className="p-6">
                                {loading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <LoadingSpinner />
                                    </div>
                                ) : error ? (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
                                        {error}
                                    </div>
                                ) : (
                                    <>
                                        {customerDetails && (
                                            <div className="mb-6">
                                                <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Details</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Name</p>
                                                        <p className="text-sm font-medium text-gray-900">{customerDetails.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Customer ID</p>
                                                        <p className="text-sm font-medium text-gray-900">#{customerDetails.customerNo}</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Phone</p>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {customerDetails.phoneNo || "N/A"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Record Date</p>
                                                        <p className="text-sm font-medium text-gray-900">{formatDate(recordDate)}</p>
                                                    </div>
                                                </div>
                                                <hr className="my-4" />
                                            </div>
                                        )}
                                        <form onSubmit={handleSubmit}>
                                            {['morning', 'evening'].map(time => {
                                                const delivery = record.deliverySchedule?.find(d => d.time === time);
                                                return (
                                                    <div key={time} className="mb-8">
                                                        <h3 className="font-semibold mb-2 capitalize text-lg text-gray-800 border-b pb-1 border-gray-200 bg-gray-50 px-2 py-1 rounded-t">
                                                            {time} Delivery
                                                        </h3>
                                                        {delivery && delivery.milkItems.length > 0 ? (
                                                            <table className="text-sm w-full border border-gray-200 rounded shadow-sm">
                                                                <thead>
                                                                    <tr className="bg-gray-100">
                                                                        <th className="px-3 py-2 text-left font-semibold">Type</th>
                                                                        <th className="px-3 py-2 text-left font-semibold">Subcat</th>
                                                                        <th className="px-3 py-2 text-center font-semibold">Qty</th>
                                                                        <th className="px-3 py-2 text-center font-semibold">Rate</th>
                                                                        <th className="px-3 py-2 text-right font-semibold">Total</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {delivery.milkItems.map((item, idx) => (
                                                                        <tr key={item._id || idx} className="border-b last:border-b-0">
                                                                            <td className="px-3 py-2 text-gray-800">{item.milkType?.name || 'No Type'}</td>
                                                                            <td className="px-3 py-2 text-gray-800">{item.subcategory?.name || 'No Subcat'}</td>
                                                                            <td className="px-3 py-2 text-center">
                                                                                <input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    step="0.01"
                                                                                    value={item.quantity}
                                                                                    onChange={e => handleMilkItemChange(time, idx, 'quantity', e.target.value)}
                                                                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-200"
                                                                                />
                                                                            </td>
                                                                            <td className="px-3 py-2 text-center text-gray-700 bg-gray-50 font-medium">₹{item.pricePerUnit}</td>
                                                                            <td className="px-3 py-2 text-right font-semibold">₹{item.totalPrice}</td>
                                                                        </tr>
                                                                    ))}
                                                                    <tr className="font-bold bg-blue-50 border-t">
                                                                        <td colSpan={2} className="px-3 py-2">Total</td>
                                                                        <td className="px-3 py-2 text-center">{delivery.totalQuantity}</td>
                                                                        <td className="px-3 py-2"></td>
                                                                        <td className="px-3 py-2 text-right">₹{delivery.totalPrice}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        ) : <span className="text-gray-400 px-2 py-2 block">No delivery</span>}
                                                    </div>
                                                );
                                            })}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg mb-6">
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500">Total Quantity</p>
                                                    <p className="text-lg font-bold text-gray-900">{record.totalDailyQuantity}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500">Total Amount</p>
                                                    <p className="text-lg font-bold text-gray-900">₹{record.totalDailyPrice}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    type="button"
                                                    onClick={onClose}
                                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                                    disabled={submitting}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 bg-[#2E7CE6] text-white rounded-md hover:bg-[#2671d2] disabled:bg-[#2E7CE6]/50"
                                                    disabled={submitting}
                                                >
                                                    {submitting ? 'Updating...' : 'Update Record'}
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EditRecordDialog;