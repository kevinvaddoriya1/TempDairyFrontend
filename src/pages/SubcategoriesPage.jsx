import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getSubcategories,
    getSubcategoryById,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory
} from '../services/subcategoryApi';
import { getCategories } from '../services/categoryApi';
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch,
    FaSortAlphaDown,
    FaSortAlphaUp,
    FaEye,
    FaFilter,
    FaTimes,
    FaRupeeSign
} from 'react-icons/fa';
import DeleteDialog from '../components/common/DeleteDialog';

const SubcategoryList = () => {
    const navigate = useNavigate();
    const { categoryId } = useParams();

    const modalRef = useRef(null);

    // Main data states
    const [subcategories, setSubcategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(categoryId || '');

    // Filtering and sorting states
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
    const [currentSubcategory, setCurrentSubcategory] = useState({
        name: '',
        category: '',
        price: 0,
        description: '',
        isActive: true
    });
    const [formErrors, setFormErrors] = useState({});
    // Add delete dialog state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [subcategoryToDelete, setSubcategoryToDelete] = useState(null);

    // Fetch data on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Fetch categories first
                const categoriesData = await getCategories();
                setCategories(categoriesData);

                // If categoryId is provided, use it
                const categoryToUse = categoryId || '';
                setSelectedCategory(categoryToUse);

                // Fetch subcategories based on selected category
                const subcategoriesData = await getSubcategories(categoryToUse || null);
                setSubcategories(subcategoriesData);
                setError(null);
            } catch (err) {
                setError('Failed to fetch data. Please try again later.');
                console.error('Error fetching initial data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [categoryId]);

    // Fetch subcategories when selected category changes
    useEffect(() => {
        const fetchSubcategories = async () => {
            setLoading(true);
            try {
                const data = await getSubcategories(selectedCategory || null);
                setSubcategories(data);
                setError(null);
                // Reset pagination when changing category
                setCurrentPage(1);
            } catch (err) {
                setError('Failed to fetch subcategories. Please try again later.');
                console.error('Error fetching subcategories:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubcategories();
    }, [selectedCategory]);

    // Handle category change
    const handleCategoryChange = (e) => {
        const newCategoryId = e.target.value;
        setSelectedCategory(newCategoryId);
    };

    // Modal event handlers
    const openCreateModal = () => {
        setCurrentSubcategory({
            name: '',
            category: selectedCategory || '',
            price: 0,
            description: '',
            isActive: true
        });
        setFormErrors({});
        setModalMode('create');
        setIsModalOpen(true);
    };

    const openEditModal = async (id) => {
        try {
            setLoading(true);
            const subcategory = await getSubcategoryById(id);
            // Ensure category is set as string ID for the select field
            const formattedSubcategory = {
                ...subcategory,
                category: typeof subcategory.category === 'object' ? subcategory.category._id : subcategory.category
            };
            setCurrentSubcategory(formattedSubcategory);
            setFormErrors({});
            setModalMode('edit');
            setIsModalOpen(true);
        } catch (err) {
            setError('Failed to fetch subcategory details. Please try again later.');
            console.error('Error fetching subcategory:', err);
        } finally {
            setLoading(false);
        }
    };

    const openViewModal = async (id) => {
        try {
            setLoading(true);
            const subcategory = await getSubcategoryById(id);
            // Ensure category is set as string ID for consistency
            const formattedSubcategory = {
                ...subcategory,
                category: typeof subcategory.category === 'object' ? subcategory.category._id : subcategory.category
            };
            setCurrentSubcategory(formattedSubcategory);
            setModalMode('view');
            setIsModalOpen(true);
        } catch (err) {
            setError('Failed to fetch subcategory details. Please try again later.');
            console.error('Error fetching subcategory:', err);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentSubcategory({
            ...currentSubcategory,
            [name]: type === 'checkbox' ? checked : value
        });

        // Clear error for this field if it exists
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ''
            });
        }
    };

    // Form validation
    const validateForm = () => {
        const errors = {};

        if (!currentSubcategory.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!currentSubcategory.category) {
            errors.category = 'Category is required';
        }

        if (currentSubcategory.price === '' || isNaN(currentSubcategory.price) || parseFloat(currentSubcategory.price) < 0) {
            errors.price = 'Price must be a positive number';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const formattedData = {
                ...currentSubcategory,
                price: parseFloat(currentSubcategory.price)
            };

            if (modalMode === 'create') {
                await createSubcategory(formattedData);
            } else if (modalMode === 'edit') {
                await updateSubcategory(currentSubcategory._id, formattedData);
            }

            // Refresh the subcategories list
            const refreshedData = await getSubcategories(selectedCategory || null);
            setSubcategories(refreshedData);

            // Close the modal
            closeModal();
            setError(null);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                if (err.response.data.message.includes('duplicate key')) {
                    setFormErrors({
                        ...formErrors,
                        name: 'A subcategory with this name already exists in this category'
                    });
                } else {
                    setError(`Failed to ${modalMode === 'create' ? 'create' : 'update'} subcategory: ${err.response.data.message}`);
                }
            } else {
                setError(`Failed to ${modalMode === 'create' ? 'create' : 'update'} subcategory. Please try again later.`);
            }
            console.error(`Error ${modalMode === 'create' ? 'creating' : 'updating'} subcategory:`, err);
        } finally {
            setLoading(false);
        }
    };

    // Modify handleDelete function
    const handleDelete = async (id) => {
        const subcategory = subcategories.find(s => s._id === id);
        setSubcategoryToDelete(subcategory);
        setIsDeleteDialogOpen(true);
    };

    // Add confirmDelete function
    const confirmDelete = async () => {
        try {
            setLoading(true);
            await deleteSubcategory(subcategoryToDelete._id);

            // Refresh the subcategories list
            const refreshedData = await getSubcategories(selectedCategory || null);
            setSubcategories(refreshedData);

            setError(null);
            setIsDeleteDialogOpen(false);
            setSubcategoryToDelete(null);
        } catch (err) {
            setError('Failed to delete subcategory. Please try again later.');
            console.error('Error deleting subcategory:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const applyFilters = () => {
        return subcategories.filter(subcategory => {
            // Text search filter
            const textMatch =
                subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (subcategory.description && subcategory.description.toLowerCase().includes(searchTerm.toLowerCase()));

            // Status filter
            const statusMatch =
                statusFilter === 'all' ||
                (statusFilter === 'active' && subcategory.isActive) ||
                (statusFilter === 'inactive' && !subcategory.isActive);

            // Price range filter
            const priceMatch =
                (priceRange.min === '' || subcategory.price >= parseFloat(priceRange.min)) &&
                (priceRange.max === '' || subcategory.price <= parseFloat(priceRange.max));

            return textMatch && statusMatch && priceMatch;
        });
    };

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setPriceRange({ min: '', max: '' });
        setSelectedCategory('');
        setCurrentPage(1); // Reset pagination when clearing filters
    };

    const filteredSubcategories = applyFilters();

    // Sorting logic
    const sortedSubcategories = [...filteredSubcategories].sort((a, b) => {
        // Handle null or undefined values
        const valueA = a[sortField] ?? '';
        const valueB = b[sortField] ?? '';

        if (sortField === 'price') {
            // Numeric sort for price
            return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
        } else {
            // String sort for other fields
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return sortDirection === 'asc'
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA);
            }
            return 0;
        }
    });

    // Handle sort
    const handleSort = (field) => {
        if (sortField === field) {
            // Toggle direction if same field
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // New field, default to ascending
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1); // Reset to first page
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedSubcategories.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedSubcategories.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Show all pages if there are fewer than maxPagesToShow
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always show first page
            pageNumbers.push(1);

            // Calculate start and end of middle pages
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);

            // Adjust if at the beginning or end
            if (currentPage <= 2) {
                endPage = 4;
            } else if (currentPage >= totalPages - 1) {
                startPage = totalPages - 3;
            }

            // Add ellipsis if needed after page 1
            if (startPage > 2) {
                pageNumbers.push('...');
            }

            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            // Add ellipsis if needed before last page
            if (endPage < totalPages - 1) {
                pageNumbers.push('...');
            }

            // Always show last page
            pageNumbers.push(totalPages);
        }

        return pageNumbers;
    };

    // Find category name by ID
    const getCategoryName = (categoryId) => {
        // Handle both object and string category ID
        const categoryIdStr = typeof categoryId === 'object' ? categoryId._id : categoryId;
        const category = categories.find(cat => cat._id === categoryIdStr);
        return category ? category.name : 'Unknown Category';
    };

    // Format price with currency symbol
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price);
    };

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                closeModal();
            }
        };

        if (isModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalOpen]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Milk Subcategories</h1>
                    <p className="text-gray-500 mt-1">Manage your product subcategories</p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center font-medium transition-colors duration-200 shadow-sm"
                >
                    <FaPlus className="mr-2" /> Add Subcategory
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-start shadow-sm">
                    <div className="flex-shrink-0 pt-0.5">
                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                </div>
            )}

            {/* Filters and search area */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
                <div className="flex flex-wrap gap-4">
                    {/* Category filter */}
                    <div className="w-full md:w-64">
                        <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <div className="relative">
                            <select
                                id="categoryFilter"
                                className="w-full border border-gray-300 rounded-lg py-2 px-3 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="w-full md:w-auto flex-grow">
                        <label htmlFor="searchFilter" className="block text-sm font-medium text-gray-700 mb-1">
                            Search
                        </label>
                        <div className="relative">
                            <input
                                id="searchFilter"
                                type="text"
                                className="w-full border border-gray-300 rounded-lg py-2 px-4 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Search subcategories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        </div>
                    </div>

                    {/* Status filter */}
                    <div className="w-full sm:w-auto">
                        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <div className="relative">
                            <select
                                id="statusFilter"
                                className="w-full border border-gray-300 rounded-lg py-2 px-3 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Price range filter */}
                    <div className="w-full sm:w-auto flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price Range
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                min="0"
                                placeholder="Min"
                                className="w-24 border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                            />
                            <span className="text-gray-500">to</span>
                            <input
                                type="number"
                                min="0"
                                placeholder="Max"
                                className="w-24 border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Sort and reset buttons */}
                <div className="flex flex-wrap justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Sort by:</span>
                        <button
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors duration-200 ${sortField === 'name'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                                }`}
                            onClick={() => handleSort('name')}
                        >
                            Name
                            {sortField === 'name' && (
                                sortDirection === 'asc' ? <FaSortAlphaDown className="ml-2" /> : <FaSortAlphaUp className="ml-2" />
                            )}
                        </button>
                        <button
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors duration-200 ${sortField === 'price'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                                }`}
                            onClick={() => handleSort('price')}
                        >
                            Price
                            {sortField === 'price' && (
                                sortDirection === 'asc' ? <FaSortAlphaDown className="ml-2" /> : <FaSortAlphaUp className="ml-2" />
                            )}
                        </button>
                        <button
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors duration-200 ${sortField === 'createdAt'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                                }`}
                            onClick={() => handleSort('createdAt')}
                        >
                            Date
                            {sortField === 'createdAt' && (
                                sortDirection === 'asc' ? <FaSortAlphaDown className="ml-2" /> : <FaSortAlphaUp className="ml-2" />
                            )}
                        </button>
                    </div>

                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 mt-2 sm:mt-0 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* Subcategories table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                {loading && !isModalOpen ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 font-medium">Loading subcategories...</p>
                    </div>
                ) : currentItems.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <FaFilter className="text-gray-400 text-xl" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">No subcategories found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || selectedCategory || statusFilter !== 'all' || priceRange.min || priceRange.max
                                ? 'Try adjusting your filters or search criteria.'
                                : 'Create your first subcategory to get started.'}
                        </p>
                        {searchTerm || selectedCategory || statusFilter !== 'all' || priceRange.min || priceRange.max ? (
                            <button
                                onClick={resetFilters}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Clear filters
                            </button>
                        ) : (
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <FaPlus className="mr-2 -ml-1" /> Create Subcategory
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentItems.map((subcategory) => (
                                        <tr key={subcategory._id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">{subcategory.name}</div>
                                                {subcategory.description && (
                                                    <div className="text-xs text-gray-500 line-clamp-1 mt-1 max-w-xs">
                                                        {subcategory.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {getCategoryName(subcategory.category)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatPrice(subcategory.price)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subcategory.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {subcategory.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {new Date(subcategory.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-3">
                                                    <button
                                                        onClick={() => openViewModal(subcategory._id)}
                                                        className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-md transition-colors duration-200"
                                                        title="View Details"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(subcategory._id)}
                                                        className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-md transition-colors duration-200"
                                                        title="Edit Subcategory"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(subcategory._id)}
                                                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-md transition-colors duration-200"
                                                        title="Delete Subcategory"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50">
                                <div className="mb-4 sm:mb-0">
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                                        <span className="font-medium">
                                            {Math.min(indexOfLastItem, sortedSubcategories.length)}
                                        </span>{' '}
                                        of <span className="font-medium">{sortedSubcategories.length}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                                            disabled={currentPage === 1}
                                            className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            Previous
                                        </button>

                                        {getPageNumbers().map((number, index) => (
                                            number === '...' ? (
                                                <span
                                                    key={`ellipsis-${index}`}
                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                                >
                                                    ...
                                                </span>
                                            ) : (
                                                <button
                                                    key={`page-${number}`}
                                                    onClick={() => paginate(number)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === number
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {number}
                                                </button>
                                            )
                                        ))}

                                        <button
                                            onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                                            disabled={currentPage === totalPages}
                                            className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            Next
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal for Create/Edit/View */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-50 flex items-center justify-center p-4">
                    <div
                        ref={modalRef}
                        className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-auto overflow-hidden transform transition-all"
                    >
                        {/* Modal header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-800">
                                {modalMode === 'create' ? 'Add New Subcategory' :
                                    modalMode === 'edit' ? 'Edit Subcategory' : 'Subcategory Details'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="px-6 py-4">
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Name field */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={currentSubcategory.name}
                                            onChange={handleInputChange}
                                            className={`w-full border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                                            placeholder="Enter subcategory name"
                                            disabled={modalMode === 'view'}
                                            required
                                        />
                                        {formErrors.name && (
                                            <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                                        )}
                                    </div>

                                    {/* Category field */}
                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="category"
                                            name="category"
                                            value={currentSubcategory.category}
                                            onChange={handleInputChange}
                                            className={`w-full border ${formErrors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                                            disabled={modalMode === 'view'}
                                            required
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map(category => (
                                                <option key={category._id} value={category._id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.category && (
                                            <p className="mt-1 text-sm text-red-500">{formErrors.category}</p>
                                        )}
                                    </div>

                                    {/* Price field */}
                                    <div>
                                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                            Price <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaRupeeSign className="text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                id="price"
                                                name="price"
                                                min="0"
                                                step="0.01"
                                                value={currentSubcategory.price}
                                                onChange={handleInputChange}
                                                className={`w-full border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2 px-3 pl-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                                                placeholder="0.00"
                                                disabled={modalMode === 'view'}
                                                required
                                            />
                                        </div>
                                        {formErrors.price && (
                                            <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
                                        )}
                                    </div>

                                    {/* Description field */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows="3"
                                            value={currentSubcategory.description || ''}
                                            onChange={handleInputChange}
                                            className={`w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                                            placeholder="Enter subcategory description (optional)"
                                            disabled={modalMode === 'view'}
                                        />
                                    </div>

                                    {/* Active status */}
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            name="isActive"
                                            checked={currentSubcategory.isActive}
                                            onChange={handleInputChange}
                                            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                                            disabled={modalMode === 'view'}
                                        />
                                        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                                            Active
                                        </label>
                                    </div>

                                    {/* Timestamps for View mode */}
                                    {modalMode === 'view' && currentSubcategory.createdAt && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4 mt-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Created At</p>
                                                <p className="text-sm text-gray-900">
                                                    {new Date(currentSubcategory.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            {currentSubcategory.updatedAt && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                                                    <p className="text-sm text-gray-900">
                                                        {new Date(currentSubcategory.updatedAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Form actions */}
                                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        {modalMode === 'view' ? 'Close' : 'Cancel'}
                                    </button>

                                    {modalMode !== 'view' && (
                                        <button
                                            type="submit"
                                            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            {modalMode === 'create' ? 'Create Subcategory' : 'Update Subcategory'}
                                        </button>
                                    )}

                                    {modalMode === 'view' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                closeModal();
                                                openEditModal(currentSubcategory._id);
                                            }}
                                            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Delete Confirmation Dialog */}
            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setSubcategoryToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Subcategory"
                message={`Are you sure you want to delete the subcategory "${subcategoryToDelete?.name}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default SubcategoryList;