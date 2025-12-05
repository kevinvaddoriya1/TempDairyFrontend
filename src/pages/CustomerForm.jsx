import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getCustomerById,
    createCustomer,
    updateCustomer
} from '../services/customerApi';
import { getCategories } from '../services/categoryApi';
import { getSubcategories } from '../services/subcategoryApi';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '../components';
import { DatePicker } from 'antd';
import moment from 'moment';

const CustomerForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    // Helper function to get current date in DD/MM/YYYY format
    const getCurrentDateInIndianFormat = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Helper to convert DD/MM/YYYY to moment object
    const stringToMoment = (dateStr) => {
        if (!dateStr) return moment();

        const parts = dateStr.split('/');
        if (parts.length !== 3) return moment();

        return moment(`${parts[2]}-${parts[1]}-${parts[0]}`, 'YYYY-MM-DD');
    };

    // Helper to convert moment to DD/MM/YYYY string
    const momentToString = (momentObj) => {
        if (!momentObj || !momentObj.isValid()) return getCurrentDateInIndianFormat();
        return momentObj.format('DD/MM/YYYY');
    };

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phoneNo: '',
        address: '',
        joinedDate: moment(), // Store as moment object
        isActive: true,
        morning: [
            { milkType: '', subcategory: '', quantity: 0 }
        ],
        evening: [
            { milkType: '', subcategory: '', quantity: 0 }
        ]
    });

    // Component state
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [joinDateError, setJoinDateError] = useState('');
    const [formError, setFormError] = useState(''); // Add a general form error state
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [filteredSubcategories, setFilteredSubcategories] = useState([]);

    // Fetch categories and subcategories on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [categoriesData, subcategoriesData] = await Promise.all([
                    getCategories(),
                    getSubcategories()
                ]);

                setCategories(categoriesData);
                setSubcategories(subcategoriesData);

                // If editing, fetch customer data
                if (isEditMode) {
                    const customerData = await getCustomerById(id);
                    // Extract morning and evening arrays from deliverySchedule
                    let morning = [];
                    let evening = [];
                    if (Array.isArray(customerData.deliverySchedule)) {
                        customerData.deliverySchedule.forEach(ds => {
                            if (ds.time === 'morning') {
                                morning = ds.milkItems.map(item => ({
                                    milkType: item.milkType._id || item.milkType,
                                    subcategory: item.subcategory._id || item.subcategory,
                                    quantity: item.quantity
                                }));
                            } else if (ds.time === 'evening') {
                                evening = ds.milkItems.map(item => ({
                                    milkType: item.milkType._id || item.milkType,
                                    subcategory: item.subcategory._id || item.subcategory,
                                    quantity: item.quantity
                                }));
                            }
                        });
                    }
                    setFormData({
                        name: customerData.name,
                        phoneNo: customerData.phoneNo,
                        address: customerData.address,
                        joinedDate: stringToMoment(customerData.joinedDate),
                        isActive: customerData.isActive,
                        morning: morning.length > 0 ? morning : [{ milkType: '', subcategory: '', quantity: 0 }],
                        evening: evening.length > 0 ? evening : [{ milkType: '', subcategory: '', quantity: 0 }]
                    });
                }
            } catch (error) {
                toast.error(error.message || 'Failed to load form data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, isEditMode]);

    // Filter subcategories when milk type changes
    useEffect(() => {
        if (formData.milkType) {
            const filtered = subcategories.filter(
                subcategory => subcategory.category._id === formData.milkType
            );
            setFilteredSubcategories(filtered);

            // If the currently selected subcategory is not in the filtered list, reset it
            if (
                formData.subcategory &&
                !filtered.some(sub => sub._id === formData.subcategory)
            ) {
                setFormData(prev => ({
                    ...prev,
                    subcategory: '',
                    price: 0
                }));
            }
        } else {
            setFilteredSubcategories([]);
        }
    }, [formData.milkType, subcategories]);

    // Set price when subcategory changes
    useEffect(() => {
        if (formData.subcategory) {
            const selectedSubcategory = subcategories.find(
                sub => sub._id === formData.subcategory
            );
            if (selectedSubcategory) {
                setFormData(prev => ({
                    ...prev,
                    price: selectedSubcategory.price
                }));
            }
        }
    }, [formData.subcategory, subcategories]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Special handling for phone number to allow only digits
        if (name === 'phoneNo') {
            // Allow only digits
            const sanitizedValue = value.replace(/\D/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: sanitizedValue
            }));
            validatePhoneNumber(sanitizedValue);
        }
        else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked :
                    type === 'number' ? parseFloat(value) : value
            }));
        }
    };

    // Handle date change from DatePicker
    const handleDateChange = (date) => {
        setFormData(prev => ({
            ...prev,
            joinedDate: date
        }));
        setJoinDateError(''); // Clear any previous errors
    };

    const validateJoinedDate = (momentDate) => {
        if (!momentDate || !momentDate.isValid()) {
            setJoinDateError('Please select a valid date');
            return false;
        }

        setJoinDateError('');
        return true;
    };

    // Phone number formatting helper (simplified for 10-digit numbers)
    const formatPhoneNumber = (phoneNo) => {
        const cleaned = phoneNo.replace(/\D/g, '');

        // Format 10-digit number as XXX-XXX-XXXX
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        }

        return phoneNo;
    };

    // Phone number validation function (simplified for 10-digit numbers only)
    const validatePhoneNumber = (phoneNo) => {
        // Remove any non-digit characters for validation
        const cleanedPhone = phoneNo.replace(/\D/g, '');

        // Check if it's empty
        if (!phoneNo.trim()) {
            setPhoneError('Phone number is required');
            return false;
        }

        // Check if it's exactly 10 digits
        if (cleanedPhone.length !== 10) {
            setPhoneError('Please enter a valid 10-digit mobile number');
            return false;
        }

        // Indian mobile numbers start with 6, 7, 8, or 9
        if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
            setPhoneError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
            return false;
        }

        setPhoneError('');
        return true;
    };

    // Filter subcategories for morning and evening
    const getFilteredSubcategories = (milkType) =>
        milkType ? subcategories.filter(sub => sub.category._id === milkType) : [];

    // Handle form input changes for milk items
    const handleMilkItemChange = (time, idx, field, value) => {
        setFormData(prev => {
            const updated = prev[time].map((item, i) =>
                i === idx ? { ...item, [field]: field === 'quantity' ? parseFloat(value) : value } : item
            );
            return { ...prev, [time]: updated };
        });

        // Clear validation error when user makes changes
        if (validationError) {
            setValidationError('');
        }
    };

    // Add milk item row
    const handleAddMilkItem = (time) => {
        setFormData(prev => ({
            ...prev,
            [time]: [...prev[time], { milkType: '', subcategory: '', quantity: 0 }]
        }));

        // Clear validation error when user adds items
        if (validationError) {
            setValidationError('');
        }
    };

    // Remove milk item row
    const handleRemoveMilkItem = (time, idx) => {
        setFormData(prev => ({
            ...prev,
            [time]: prev[time].filter((_, i) => i !== idx)
        }));

        // Clear validation error when user removes items (they might still have valid items)
        if (validationError) {
            setValidationError('');
        }
    };

    // Validation function
    const validateDeliverySchedule = () => {
        const hasMorningItems = formData.morning && formData.morning.some(item =>
            item.milkType && item.subcategory && item.quantity > 0
        );
        const hasEveningItems = formData.evening && formData.evening.some(item =>
            item.milkType && item.subcategory && item.quantity > 0
        );

        if (!hasMorningItems && !hasEveningItems) {
            setValidationError('At least one delivery schedule (morning or evening) is required. Please select milk type, subcategory, and enter quantity greater than 0.');
            return false;
        }

        setValidationError('');
        return true;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear any previous errors
        setFormError('');

        // Validate phone number
        if (!validatePhoneNumber(formData.phoneNo)) {
            return;
        }

        // Validate join date
        if (!validateJoinedDate(formData.joinedDate)) {
            return;
        }

        // Validate delivery schedule before proceeding
        if (!validateDeliverySchedule()) {
            return;
        }

        setSubmitting(true);
        try {
            // Build deliverySchedule array from formData.morning and formData.evening
            const deliverySchedule = [];
            if (formData.morning && formData.morning.some(item => item.milkType && item.subcategory && item.quantity > 0)) {
                deliverySchedule.push({
                    time: 'morning',
                    milkItems: formData.morning
                        .filter(item => item.milkType && item.subcategory && item.quantity > 0)
                        .map(item => {
                            const subcat = subcategories.find(sub => sub._id === item.subcategory);
                            return {
                                milkType: item.milkType,
                                subcategory: item.subcategory,
                                quantity: item.quantity,
                                pricePerUnit: subcat ? subcat.price : 0
                            };
                        })
                });
            }
            if (formData.evening && formData.evening.some(item => item.milkType && item.subcategory && item.quantity > 0)) {
                deliverySchedule.push({
                    time: 'evening',
                    milkItems: formData.evening
                        .filter(item => item.milkType && item.subcategory && item.quantity > 0)
                        .map(item => {
                            const subcat = subcategories.find(sub => sub._id === item.subcategory);
                            return {
                                milkType: item.milkType,
                                subcategory: item.subcategory,
                                quantity: item.quantity,
                                pricePerUnit: subcat ? subcat.price : 0
                            };
                        })
                });
            }
            const payload = {
                name: formData.name,
                phoneNo: formData.phoneNo,
                address: formData.address,
                joinedDate: momentToString(formData.joinedDate),
                isActive: formData.isActive,
                deliverySchedule
            };
            if (isEditMode) {
                await updateCustomer(id, payload);
                toast.success('Customer updated successfully');
                navigate('/customers');
            } else {
                await createCustomer(payload);
                toast.success('Customer created successfully');
                navigate('/customers');
            }
        } catch (error) {
            // Set the detailed error message
            let errorMessage = error.response?.data?.message || error.message || 'Failed to save customer';

            // Handle specific error types
            if (errorMessage.includes('phone number already exists') ||
                errorMessage.includes('duplicate key') ||
                errorMessage.toLowerCase().includes('phoneNo_1 dup')) {
                errorMessage = 'A customer with this phone number already exists';
                setPhoneError(errorMessage);
            } else {
                setFormError(errorMessage);
            }

            toast.error(errorMessage);

            // Scroll to the top of the form to make the error visible
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container px-6 py-4 mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    {isEditMode ? 'Edit Customer' : 'Add New Customer'}
                </h1>
                <p className="text-gray-600 mt-1">
                    {isEditMode
                        ? 'Update the customer details below'
                        : 'Fill in the details to add a new customer'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
                {/* General Form Error */}
                {formError && (
                    <div className="mb-6">
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium">Error: {formError}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Name */}
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Customer Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label
                            htmlFor="phoneNo"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            id="phoneNo"
                            name="phoneNo"
                            value={formData.phoneNo}
                            onChange={handleChange}
                            required
                            maxLength="10"
                            className={`w-full px-3 py-2 border ${phoneError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md focus:outline-none`}
                            placeholder="Enter 10-digit mobile number (e.g., 9876543210)"
                        />
                        {phoneError && (
                            <p className="mt-1 text-sm text-red-500">{phoneError}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            This will also be used as login username and password.
                            <br />
                            Please enter exactly 10 digits starting with 6, 7, 8, or 9
                        </p>
                    </div>

                    {/* Join Date */}
                    <div>
                        <label
                            htmlFor="joinedDate"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Join Date <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                            id="joinedDate"
                            className={`w-full px-3 py-2 border ${joinDateError ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                            format="DD/MM/YYYY"
                            onChange={handleDateChange}
                            placeholder="Select join date"
                            style={{ width: '100%' }}
                        />
                        {joinDateError && (
                            <p className="mt-1 text-sm text-red-500">{joinDateError}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Date when customer joined the service
                        </p>
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label
                            htmlFor="address"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        ></textarea>
                    </div>

                    {/* Validation Error Message */}
                    {validationError && (
                        <div className="md:col-span-2">
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium">{validationError}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Morning Delivery Section */}
                    <div className="mt-8 md:col-span-2">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span role="img" aria-label="morning">☀️</span> Morning Delivery
                            <span className="text-xs text-gray-500 font-normal">(At least one delivery schedule required)</span>
                        </h2>
                        {formData.morning.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col md:flex-row items-end gap-3 mb-4 p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 relative"
                            >
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Milk Type</label>
                                    <select
                                        id={`morning.milkType.${idx}`}
                                        name={`morning.milkType.${idx}`}
                                        value={item.milkType}
                                        onChange={e => handleMilkItemChange('morning', idx, 'milkType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">-- Select Milk Type --</option>
                                        {categories.map(category => (
                                            <option key={category._id} value={category._id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                                    <select
                                        id={`morning.subcategory.${idx}`}
                                        name={`morning.subcategory.${idx}`}
                                        value={item.subcategory}
                                        onChange={e => handleMilkItemChange('morning', idx, 'subcategory', e.target.value)}
                                        disabled={!item.milkType}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">-- Select Subcategory --</option>
                                        {getFilteredSubcategories(item.milkType).map(subcategory => (
                                            <option key={subcategory._id} value={subcategory._id}>{subcategory.name} (₹{subcategory.price})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        id={`morning.quantity.${idx}`}
                                        name={`morning.quantity.${idx}`}
                                        value={item.quantity}
                                        onChange={e => handleMilkItemChange('morning', idx, 'quantity', e.target.value)}
                                        min="0"
                                        step="0.5"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                {formData.morning.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMilkItem('morning', idx)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                        title="Remove"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => handleAddMilkItem('morning')}
                            className="w-full mt-2 px-3 py-2 border-2 border-dashed border-blue-400 text-blue-700 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center gap-2"
                        >
                            <span className="text-xl">+</span> Add Milk Item
                        </button>
                    </div>

                    {/* Evening Delivery Section */}
                    <div className="mt-8 md:col-span-2">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span role="img" aria-label="evening">🌙</span> Evening Delivery
                            <span className="text-xs text-gray-500 font-normal">(At least one delivery schedule required)</span>
                        </h2>
                        {formData.evening.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col md:flex-row items-end gap-3 mb-4 p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 relative"
                            >
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Milk Type</label>
                                    <select
                                        id={`evening.milkType.${idx}`}
                                        name={`evening.milkType.${idx}`}
                                        value={item.milkType}
                                        onChange={e => handleMilkItemChange('evening', idx, 'milkType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">-- Select Milk Type --</option>
                                        {categories.map(category => (
                                            <option key={category._id} value={category._id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                                    <select
                                        id={`evening.subcategory.${idx}`}
                                        name={`evening.subcategory.${idx}`}
                                        value={item.subcategory}
                                        onChange={e => handleMilkItemChange('evening', idx, 'subcategory', e.target.value)}
                                        disabled={!item.milkType}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">-- Select Subcategory --</option>
                                        {getFilteredSubcategories(item.milkType).map(subcategory => (
                                            <option key={subcategory._id} value={subcategory._id}>{subcategory.name} (₹{subcategory.price})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        id={`evening.quantity.${idx}`}
                                        name={`evening.quantity.${idx}`}
                                        value={item.quantity}
                                        onChange={e => handleMilkItemChange('evening', idx, 'quantity', e.target.value)}
                                        min="0"
                                        step="0.5"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                {formData.evening.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMilkItem('evening', idx)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                        title="Remove"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => handleAddMilkItem('evening')}
                            className="w-full mt-2 px-3 py-2 border-2 border-dashed border-blue-400 text-blue-700 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center gap-2"
                        >
                            <span className="text-xl">+</span> Add Milk Item
                        </button>
                    </div>

                    {/* Status - Only show in edit mode */}
                    {isEditMode && (
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                                htmlFor="isActive"
                                className="ml-2 block text-sm text-gray-700"
                            >
                                Active Customer
                            </label>
                        </div>
                    )}
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate('/customers')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {submitting ? 'Saving...' : isEditMode ? 'Update Customer' : 'Add Customer'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustomerForm;