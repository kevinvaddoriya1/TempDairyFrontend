// src/pages/HolidayManagement.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaEdit, FaCalendarAlt } from 'react-icons/fa';
import {
    getHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday
} from '../services/holidayService';
import DeleteDialog from '../components/common/DeleteDialog';

const HolidayManagement = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedHoliday, setSelectedHoliday] = useState(null);
    const [formData, setFormData] = useState({
        date: '',
        name: '',
        reason: '',
        isRecurringYearly: false
    });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [holidayToDelete, setHolidayToDelete] = useState(null);
    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            setLoading(true);
            const data = await getHolidays();
            setHolidays(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch holidays');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate date - only allow today and future dates
        const today = new Date().toISOString().split('T')[0];
        if (formData.date < today) {
            toast.error('Holidays cannot be added for past dates');
            return;
        }

        try {
            if (isEditing) {
                await updateHoliday(selectedHoliday._id, formData);
                toast.success('Holiday updated successfully');
            } else {
                await createHoliday(formData);
                toast.success('Holiday added successfully');
            }
            resetForm();
            fetchHolidays();
        } catch (error) {
            toast.error(isEditing ? 'Failed to update holiday' : 'Failed to add holiday');
        }
    };

    const handleEdit = (holiday) => {
        const holidayDate = holiday.date.substring(0, 10);
        const today = new Date().toISOString().split('T')[0];

        // Only allow editing if the holiday is for today or future
        if (holidayDate < today) {
            toast.error('Past holidays cannot be edited');
            return;
        }

        setIsEditing(true);
        setSelectedHoliday(holiday);
        setFormData({
            date: holidayDate,
            name: holiday.name,
            reason: holiday.reason,
            isRecurringYearly: holiday.isRecurringYearly
        });
        setIsFormOpen(true);
    };
    // Open delete confirmation modal
    const handleDelete = (holiday) => {
        setHolidayToDelete(holiday);
        setIsDeleteModalOpen(true);
    };

    // Confirm deletion when user clicks Delete in modal
    const confirmDelete = async () => {
        try {
            await deleteHoliday(holidayToDelete._id);
            toast.success('Holiday deleted successfully');
            fetchHolidays();
            setIsDeleteModalOpen(false);
            setHolidayToDelete(null);
        } catch (error) {
            toast.error('Failed to delete holiday');
        }
    };

    const resetForm = () => {
        setFormData({
            date: '',
            name: '',
            reason: '',
            isRecurringYearly: false
        });
        setIsEditing(false);
        setSelectedHoliday(null);
        setIsFormOpen(false);
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Holiday Management</h1>
                <button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="bg-[#2E7CE6] text-white px-4 py-2 rounded-lg flex items-center"
                >
                    <FaPlus className="mr-2" />
                    Add Holiday
                </button>
            </div>

            {/* Form Section */}
            {isFormOpen && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-medium mb-4">
                        {isEditing ? 'Edit Holiday' : 'Add New Holiday'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7CE6]"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Only today and future dates are allowed (no past dates)
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Holiday Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7CE6]"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7CE6]"
                                    rows="3"
                                    required
                                ></textarea>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isRecurringYearly"
                                    name="isRecurringYearly"
                                    checked={formData.isRecurringYearly}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-[#2E7CE6] focus:ring-[#2E7CE6] border-gray-300 rounded"
                                />
                                <label htmlFor="isRecurringYearly" className="ml-2 block text-sm text-gray-700">
                                    Recurring yearly
                                </label>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#2E7CE6] text-white rounded-md hover:bg-[#2468c0]"
                            >
                                {isEditing ? 'Update Holiday' : 'Add Holiday'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            <DeleteDialog
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setHolidayToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Holiday"
                message={`Are you sure you want to delete the holiday "${holidayToDelete?.name}"? This action cannot be undone.`}
            />
            {/* Holidays List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Holiday Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reason
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Recurring
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center">
                                        Loading...
                                    </td>
                                </tr>
                            ) : holidays.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        No holidays found. Add your first holiday!
                                    </td>
                                </tr>
                            ) : (
                                holidays.map((holiday) => {
                                    const holidayDate = new Date(holiday.date);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    holidayDate.setHours(0, 0, 0, 0);

                                    const isToday = holidayDate.getTime() === today.getTime();
                                    const isPast = holidayDate < today;
                                    const isFuture = holidayDate > today;

                                    return (
                                        <tr key={holiday._id} className={
                                            isPast ? 'bg-gray-50' :
                                                isFuture ? 'bg-blue-50' :
                                                    'bg-green-50'
                                        }>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FaCalendarAlt className={`mr-2 ${isPast ? 'text-gray-400' :
                                                            isFuture ? 'text-blue-400' :
                                                                'text-green-500'
                                                        }`} />
                                                    <span className={
                                                        isPast ? 'text-gray-500' :
                                                            isFuture ? 'text-blue-600' :
                                                                'text-green-600 font-medium'
                                                    }>
                                                        {new Date(holiday.date).toLocaleDateString('en-GB', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                        {isToday && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">TODAY</span>}
                                                        {isPast && <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">PAST</span>}
                                                        {isFuture && <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">FUTURE</span>}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {holiday.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="line-clamp-2">{holiday.reason}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {holiday.isRecurringYearly ? 'Yes' : 'No'}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium">
                                                {!isPast ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(holiday)}
                                                            className="text-[#2E7CE6] hover:text-[#2468c0] mr-3"
                                                            title="Edit holiday"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(holiday)}
                                                            className="text-red-500 hover:text-red-700"
                                                            title="Delete holiday"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">
                                                        Past holiday
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HolidayManagement;