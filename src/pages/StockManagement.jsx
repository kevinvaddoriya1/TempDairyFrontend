import React, { useState, useEffect } from 'react';
import {
    getStockEntries,
    getStockSummary,
    createStockEntry,
    updateStockEntry,
    deleteStockEntry,
    getStockByCategory
} from '../services/stockService';
import { getCategories } from '../services/categoryApi';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart
} from 'recharts';
import DeleteDialog from '../components/common/DeleteDialog';

const StockManagement = () => {
    // State management
    const [entries, setEntries] = useState([]);
    const [summary, setSummary] = useState(null);
    const [categories, setCategories] = useState([]);
    const [categoryStockData, setCategoryStockData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form states
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        entryType: 'in',
        quantity: 0,
        entryDate: new Date(),
        notes: '',
        category: ''
    });
    const [editId, setEditId] = useState(null);
    const [formValidation, setFormValidation] = useState({ isValid: true, error: null });

    // Date filter and category filter state
    const [filterDate, setFilterDate] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // Chart display options
    const [chartType, setChartType] = useState('area');

    // First, add a state for the delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteEntryId, setDeleteEntryId] = useState(null);
    // Colors for charts
    const COLORS = ['#2F80ED', '#EF4444'];
    const CHART_COLORS = {
        stockIn: '#2F80ED',   // Primary Blue
        stockOut: '#EF4444',  // Red
        grid: '#E5E7EB',      // Light Gray
        text: '#6B7280',      // Medium Gray
        background: '#F9FAFB' // Faint Gray
    };

    // Load data on component mount
    useEffect(() => {
        loadData();
        loadCategories();
    }, []);

    // Function to load categories
    const loadCategories = async () => {
        try {
            const categoriesData = await getCategories();
            setCategories(categoriesData);
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    };

    // Function to load stock entries and summary
    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Prepare filter parameters
            const params = {};

            if (filterDate) {
                // Create start date at beginning of the day (00:00:00)
                const startDate = new Date(filterDate);
                startDate.setHours(0, 0, 0, 0);

                // Create end date at end of the day (23:59:59)
                const endDate = new Date(filterDate);
                endDate.setHours(23, 59, 59, 999);

                params.startDate = startDate.toISOString();
                params.endDate = endDate.toISOString();
            }

            if (filterCategory) {
                params.category = filterCategory;
            }

            // Get stock entries with filter parameters
            const entriesData = await getStockEntries(params);

            // Get stock summary with same filter parameters
            const summaryData = await getStockSummary(params);

            // Get category-wise stock data with same filter parameters
            let categoryStock = [];
            try {
                categoryStock = await getStockByCategory(params);
            } catch (categoryError) {
                console.warn('Failed to load category stock data:', categoryError);
                // Continue without category data rather than failing completely
            }

            setEntries(entriesData);
            setSummary(summaryData);
            setCategoryStockData(categoryStock || []);
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;

        let newFormData;
        // Special handling for number inputs
        if (type === 'number') {
            newFormData = {
                ...formData,
                [name]: Number(value)
            };
        } else {
            newFormData = {
                ...formData,
                [name]: value
            };
        }

        setFormData(newFormData);

        // Real-time validation for stock out operations
        if ((name === 'quantity' || name === 'entryType' || name === 'category') &&
            newFormData.entryType === 'out' && newFormData.quantity > 0 && newFormData.category) {
            const validation = validateStockAvailability(newFormData.entryType, newFormData.quantity, newFormData.category);
            setFormValidation(validation);
        } else {
            setFormValidation({ isValid: true, error: null });
        }
    };

    // Get available stock for a specific category
    const getAvailableStock = (categoryId) => {
        if (!categoryId) return 0;

        const categoryStock = categoryStockData.find(stock =>
            (stock.categoryId && stock.categoryId.toString() === categoryId) ||
            (stock.category && stock.category._id === categoryId)
        );

        return categoryStock ? (categoryStock.currentStock || 0) : 0;
    };

    // Validate stock availability for stock out operations
    const validateStockAvailability = (entryType, quantity, categoryId) => {
        if (entryType !== 'out' || !quantity || !categoryId) {
            return { isValid: true, error: null };
        }

        // Find current stock for the selected category
        const categoryStock = categoryStockData.find(stock =>
            (stock.categoryId && stock.categoryId.toString() === categoryId) ||
            (stock.category && stock.category._id === categoryId)
        );

        const availableStock = categoryStock ? (categoryStock.currentStock || 0) : 0;

        if (quantity > availableStock) {
            return {
                isValid: false,
                error: `Insufficient stock! Available: ${availableStock} units, Requested: ${quantity} units`
            };
        }

        return { isValid: true, error: null };
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Prepare data for submission
            const entryData = {
                ...formData,
                // Ensure quantity is a number
                quantity: Number(formData.quantity)
            };

            // Validate stock availability for stock out operations
            const validation = validateStockAvailability(entryData.entryType, entryData.quantity, entryData.category);

            if (!validation.isValid) {
                setError(validation.error);
                setLoading(false);
                return;
            }

            if (editId) {
                await updateStockEntry(editId, entryData);
            } else {
                await createStockEntry(entryData);
            }

            // Reset form and reload data
            setFormData({
                entryType: 'in',
                quantity: 0,
                entryDate: new Date(),
                notes: '',
                category: ''
            });
            setEditId(null);
            setShowForm(false);
            setFormValidation({ isValid: true, error: null });

            // Reload data with current filter
            loadData();
        } catch (err) {
            console.error('Error saving entry:', err);
            setError('Failed to save entry. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle edit button click
    const handleEdit = (entry) => {
        setFormData({
            entryType: entry.entryType,
            quantity: Number(entry.quantity),
            entryDate: new Date(entry.entryDate),
            notes: entry.notes || '',
            category: entry.category?._id || entry.category || ''
        });
        setEditId(entry._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        setDeleteEntryId(id);
        setShowDeleteModal(true);
    };
    const confirmDelete = async () => {
        setLoading(true);
        try {
            await deleteStockEntry(deleteEntryId);
            // Reload data with current filter
            loadData();
        } catch (err) {
            console.error('Error deleting entry:', err);
            setError('Failed to delete entry. Please try again.');
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
            setDeleteEntryId(null);
        }
    };
    // Handle date filter change
    const handleDateFilterChange = (e) => {
        setFilterDate(e.target.value);
    };

    // Handle category filter change
    const handleCategoryFilterChange = (e) => {
        setFilterCategory(e.target.value);
    };

    // Apply filters
    const applyFilter = () => {
        loadData();
    };

    // Clear filters
    const clearFilter = () => {
        setFilterDate('');
        setFilterCategory('');
        loadData();
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '-';

        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Format date for form input (YYYY-MM-DD)
    const formatDateForInput = (date) => {
        if (!date) return '';

        // For Date objects
        if (date instanceof Date) {
            return date.toISOString().split('T')[0];
        }

        // For date strings
        return new Date(date).toISOString().split('T')[0];
    };

    // Get chart data from summary
    const getChartData = () => {
        if (!summary || !summary.dailyData) return [];

        const { stockIn = [], stockOut = [] } = summary.dailyData;
        const chartData = [];

        // Process stock in data
        stockIn.forEach(item => {
            if (!item || !item._id || !item._id.day) return;

            const existingEntry = chartData.find(entry => entry.date === item._id.day);

            if (existingEntry) {
                existingEntry.stockIn = item.totalIn || 0;
            } else {
                chartData.push({
                    date: item._id.day,
                    stockIn: item.totalIn || 0,
                    stockOut: 0
                });
            }
        });

        // Process stock out data
        stockOut.forEach(item => {
            if (!item || !item._id || !item._id.day) return;

            const existingEntry = chartData.find(entry => entry.date === item._id.day);

            if (existingEntry) {
                existingEntry.stockOut = item.totalOut || 0;
            } else {
                chartData.push({
                    date: item._id.day,
                    stockIn: 0,
                    stockOut: item.totalOut || 0
                });
            }
        });

        // Sort by date
        return chartData.sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    // Get pie chart data from summary
    const getPieChartData = () => {
        if (!summary || !summary.totals) return [];

        const { stockIn = 0, stockOut = 0 } = summary.totals;

        return [
            { name: 'Stock In', value: stockIn },
            { name: 'Stock Out', value: stockOut }
        ];
    };

    // Get filtered category stock data based on current filters
    const getFilteredCategoryStockData = () => {
        if (!categoryStockData || categoryStockData.length === 0) return [];

        let filteredData = categoryStockData;

        // If category filter is applied, show only that category
        if (filterCategory) {
            filteredData = categoryStockData.filter(categoryStock =>
                (categoryStock.categoryId && categoryStock.categoryId.toString() === filterCategory) ||
                (categoryStock.category && categoryStock.category._id === filterCategory)
            );
        }

        return filteredData.filter(categoryStock => categoryStock && (categoryStock.categoryName || categoryStock.category));
    };

    // Get category-wise pie chart data
    const getCategoryPieChartData = () => {
        if (!categoryStockData || categoryStockData.length === 0) return [];

        let filteredData = categoryStockData;

        // If category filter is applied, show only that category
        if (filterCategory) {
            filteredData = categoryStockData.filter(categoryStock =>
                (categoryStock.categoryId && categoryStock.categoryId.toString() === filterCategory) ||
                (categoryStock.category && categoryStock.category._id === filterCategory)
            );
        }

        return filteredData.map(categoryStock => ({
            name: categoryStock.categoryName || categoryStock.category?.name || 'Unknown',
            value: categoryStock.currentStock || 0,
            stockIn: categoryStock.stockIn || categoryStock.totalIn || 0,
            stockOut: categoryStock.stockOut || categoryStock.totalOut || 0
        })).filter(item => item.value > 0);
    };

    // Check if a filter is active
    const isFilterActive = !!filterDate || !!filterCategory;

    // Check if there is data to display
    const hasData = entries.length > 0 || (summary &&
        ((summary.totals && (summary.totals.stockIn > 0 || summary.totals.stockOut > 0)) ||
            (summary.dailyData && ((summary.dailyData.stockIn && summary.dailyData.stockIn.length > 0) ||
                (summary.dailyData.stockOut && summary.dailyData.stockOut.length > 0)))));

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-100">
                    <p className="font-medium text-gray-700">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Render appropriate chart based on type
    const renderChart = () => {
        const data = getChartData();

        switch (chartType) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                            <XAxis
                                dataKey="date"
                                stroke={CHART_COLORS.text}
                                tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                            />
                            <YAxis
                                stroke={CHART_COLORS.text}
                                tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{
                                    paddingTop: 10,
                                    fontSize: 12,
                                    color: CHART_COLORS.text
                                }}
                            />
                            <Bar
                                dataKey="stockIn"
                                fill={CHART_COLORS.stockIn}
                                name="Stock In"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="stockOut"
                                fill={CHART_COLORS.stockOut}
                                name="Stock Out"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'line':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                            <XAxis
                                dataKey="date"
                                stroke={CHART_COLORS.text}
                                tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                            />
                            <YAxis
                                stroke={CHART_COLORS.text}
                                tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{
                                    paddingTop: 10,
                                    fontSize: 12,
                                    color: CHART_COLORS.text
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="stockIn"
                                stroke={CHART_COLORS.stockIn}
                                name="Stock In"
                                strokeWidth={2}
                                dot={{ r: 4, fill: CHART_COLORS.stockIn }}
                                activeDot={{ r: 6, strokeWidth: 2 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="stockOut"
                                stroke={CHART_COLORS.stockOut}
                                name="Stock Out"
                                strokeWidth={2}
                                dot={{ r: 4, fill: CHART_COLORS.stockOut }}
                                activeDot={{ r: 6, strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'area':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                            <defs>
                                <linearGradient id="colorStockIn" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={CHART_COLORS.stockIn} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={CHART_COLORS.stockIn} stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="colorStockOut" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={CHART_COLORS.stockOut} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={CHART_COLORS.stockOut} stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                            <XAxis
                                dataKey="date"
                                stroke={CHART_COLORS.text}
                                tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                            />
                            <YAxis
                                stroke={CHART_COLORS.text}
                                tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{
                                    paddingTop: 10,
                                    fontSize: 12,
                                    color: CHART_COLORS.text
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="stockIn"
                                stroke={CHART_COLORS.stockIn}
                                fillOpacity={1}
                                fill="url(#colorStockIn)"
                                name="Stock In"
                            />
                            <Area
                                type="monotone"
                                dataKey="stockOut"
                                stroke={CHART_COLORS.stockOut}
                                fillOpacity={1}
                                fill="url(#colorStockOut)"
                                name="Stock Out"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                );

            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={getPieChartData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) =>
                                    percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                            >
                                {getPieChartData().map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke="#FFFFFF"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{
                                    paddingTop: 20,
                                    fontSize: 12,
                                    color: CHART_COLORS.text
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'categoryPie':
                const categoryData = getCategoryPieChartData();
                const categoryColors = ['#2F80ED', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={2}
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent, value }) =>
                                    percent > 5 ? `${name}: ${value}` : ''}
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={categoryColors[index % categoryColors.length]}
                                        stroke="#FFFFFF"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-100">
                                                <p className="font-medium text-gray-700">{data.name}</p>
                                                <p className="text-sm text-blue-600">Current Stock: {data.value} units</p>
                                                <p className="text-sm text-green-600">Stock In: {data.stockIn} units</p>
                                                <p className="text-sm text-red-600">Stock Out: {data.stockOut} units</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend
                                wrapperStyle={{
                                    paddingTop: 20,
                                    fontSize: 11,
                                    color: CHART_COLORS.text
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-dark animate-fade-in">Inventory Management</h1>
                            <p className="text-gray-500 mt-1">Track and analyze your stock movements</p>
                        </div>

                        {/* Date and Category Filter Controls */}
                        <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-lg shadow-sm">
                            <div className="relative flex items-center gap-2">
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={handleDateFilterChange}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                                    aria-label="Filter by date"
                                />

                                <select
                                    value={filterCategory}
                                    onChange={handleCategoryFilterChange}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                                    aria-label="Filter by category"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    onClick={applyFilter}
                                    disabled={!filterDate && !filterCategory}
                                    className={`px-3 py-2 rounded-md flex items-center text-sm font-medium ${!filterDate && !filterCategory
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-primary hover:bg-secondary text-white'
                                        }`}
                                    aria-label="Apply filter"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    Filter
                                </button>

                                {isFilterActive && (
                                    <button
                                        onClick={clearFilter}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-md flex items-center text-sm font-medium"
                                        aria-label="Clear filter"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filter Status Indicator */}
                {isFilterActive && (
                    <div className="bg-blue-50 border-l-4 border-primary text-primary p-4 mb-6 rounded-md flex items-center animate-fade-in">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>
                            Showing data for:
                            {filterDate && <span className="font-semibold ml-1">{formatDate(filterDate)}</span>}
                            {filterDate && filterCategory && <span className="mx-2">and</span>}
                            {filterCategory && (
                                <span className="font-semibold">
                                    {categories.find(cat => cat._id === filterCategory)?.name || 'Selected Category'}
                                </span>
                            )}
                        </p>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 animate-fade-in">
                        <p className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </p>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md animate-slide-up">
                        <div className="flex items-center">
                            <div className="rounded-full bg-blue-100 p-3 mr-4">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Current Stock</p>
                                <div className="flex items-end">
                                    <h2 className="text-3xl font-bold text-dark">{summary?.totals?.currentStock || 0}</h2>
                                    <p className="text-sm text-gray-500 ml-2 mb-1">units</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md animate-slide-up">
                        <div className="flex items-center">
                            <div className="rounded-full bg-green-100 p-3 mr-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Stock In</p>
                                <div className="flex items-end">
                                    <h2 className="text-3xl font-bold text-green-600">{summary?.totals?.stockIn || 0}</h2>
                                    <p className="text-sm text-gray-500 ml-2 mb-1">units received</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md animate-slide-up">
                        <div className="flex items-center">
                            <div className="rounded-full bg-red-100 p-3 mr-4">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Stock Out</p>
                                <div className="flex items-end">
                                    <h2 className="text-3xl font-bold text-red-600">{summary?.totals?.stockOut || 0}</h2>
                                    <p className="text-sm text-gray-500 ml-2 mb-1">units shipped</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md animate-slide-up">
                        <div className="flex items-center">
                            <div className="rounded-full bg-purple-100 p-3 mr-4">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Categories</p>
                                <div className="flex items-end">
                                    <h2 className="text-3xl font-bold text-purple-600">{categories.length}</h2>
                                    <p className="text-sm text-gray-500 ml-2 mb-1">active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category-wise Stock Summary */}
                {getFilteredCategoryStockData().length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    Stock by Category
                                    {isFilterActive && (
                                        <span className="ml-2 text-sm text-primary bg-blue-50 px-2 py-1 rounded-full">
                                            Filtered
                                        </span>
                                    )}
                                </h2>
                                <div className="text-sm text-gray-500">
                                    {getFilteredCategoryStockData().length} {getFilteredCategoryStockData().length === 1 ? 'category' : 'categories'}
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {getFilteredCategoryStockData().map((categoryStock) => (
                                    <div key={categoryStock.categoryId || categoryStock.category?._id || categoryStock.category} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-gray-800 truncate">
                                                {categoryStock.categoryName || categoryStock.category?.name || 'Unknown Category'}
                                            </h3>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${(categoryStock.currentStock || 0) > 0
                                                ? 'bg-green-100 text-green-800 border border-green-200'
                                                : 'bg-red-100 text-red-800 border border-red-200'
                                                }`}>
                                                {categoryStock.currentStock || 0} units
                                            </span>
                                        </div>

                                        {/* Progress bar for stock level */}
                                        <div className="mb-3">
                                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                <span>Stock Level</span>
                                                <span>{((categoryStock.currentStock || 0) / Math.max((categoryStock.stockIn || categoryStock.totalIn || 1), 1) * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${(categoryStock.currentStock || 0) > 0 ? 'bg-green-500' : 'bg-red-500'
                                                        }`}
                                                    style={{
                                                        width: `${Math.min(100, Math.max(5, ((categoryStock.currentStock || 0) / Math.max((categoryStock.stockIn || categoryStock.totalIn || 1), 1) * 100)))}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                                    <span className="text-gray-600">Stock In:</span>
                                                </div>
                                                <span className="text-green-600 font-medium">{categoryStock.stockIn || categoryStock.totalIn || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                                    <span className="text-gray-600">Stock Out:</span>
                                                </div>
                                                <span className="text-red-600 font-medium">{categoryStock.stockOut || categoryStock.totalOut || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Chart Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
                    <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Stock Movement Analysis
                            {isFilterActive && (
                                <span className="ml-2 text-sm text-primary bg-blue-50 px-2 py-1 rounded-full">
                                    Filtered
                                </span>
                            )}
                        </h2>
                        <div className="flex items-center">
                            <label htmlFor="chart-type" className="sr-only">Select chart type</label>
                            <select
                                id="chart-type"
                                value={chartType}
                                onChange={(e) => setChartType(e.target.value)}
                                className="border border-gray-300 rounded-md text-sm py-1.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            >
                                <option value="area">Area Chart</option>
                                <option value="bar">Bar Chart</option>
                                <option value="line">Line Chart</option>
                                <option value="pie">Stock In/Out Pie</option>
                                <option value="categoryPie">Category Stock Pie</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center items-center h-80">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : hasData ? (
                            <div className="h-80">
                                {renderChart()}
                            </div>
                        ) : (
                            <div className="flex flex-col justify-center items-center h-80 text-center">
                                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-gray-500 text-lg">
                                    {isFilterActive
                                        ? 'No data available for the selected date'
                                        : 'No data available. Add some stock entries to get started.'}
                                </p>
                                <button
                                    onClick={() => {
                                        setEditId(null);
                                        setFormData({
                                            entryType: 'in',
                                            quantity: 0,
                                            entryDate: new Date(),
                                            notes: '',
                                            category: ''
                                        });
                                        setShowForm(true);
                                    }}
                                    className="mt-4 bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add First Entry
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => {
                            setEditId(null);
                            setFormData({
                                entryType: 'in',
                                quantity: 0,
                                entryDate: new Date(),
                                notes: '',
                                category: ''
                            });
                            setShowForm(true);
                        }}
                        className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Stock Entry
                    </button>
                </div>

                {/* Stock Entries Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Stock Entries
                        </h2>
                        {entries.length > 0 && (
                            <div className="bg-blue-50 text-primary text-sm py-1 px-3 rounded-full">
                                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                            </div>
                        )}
                    </div>

                    {loading && !entries.length ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : entries.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {entries.map((entry) => (
                                        <tr key={entry._id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(entry.entryDate)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                                {entry.category?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${entry.entryType === 'in'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {entry.entryType === 'in' ? 'Stock In' : 'Stock Out'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{entry.quantity}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{entry.notes || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(entry)}
                                                        className="text-primary hover:text-secondary p-1 rounded-full hover:bg-blue-50 transition-colors duration-150"
                                                        title="Edit entry"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(entry._id)}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors duration-150"
                                                        title="Delete entry"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col justify-center items-center py-12 text-center">
                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-gray-500 text-lg mb-2">
                                {isFilterActive
                                    ? 'No entries found for the selected date.'
                                    : 'No entries found.'}
                            </p>
                            <p className="text-gray-400 text-sm mb-6">
                                {isFilterActive
                                    ? 'Try selecting a different date or clear the filter.'
                                    : 'Add some stock entries to get started.'}
                            </p>
                            <button
                                onClick={() => {
                                    setEditId(null);
                                    setFormData({
                                        entryType: 'in',
                                        quantity: 0,
                                        entryDate: new Date(),
                                        notes: '',
                                        category: ''
                                    });
                                    setShowForm(true);
                                }}
                                className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add First Entry
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-dark flex items-center">
                                {editId ? (
                                    <>
                                        <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Stock Entry
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Stock Entry
                                    </>
                                )}
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-full hover:bg-gray-100"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="entry-type">
                                    Entry Type
                                </label>
                                <div className="flex rounded-md shadow-sm">
                                    <button
                                        type="button"
                                        className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md border ${formData.entryType === 'in'
                                            ? 'bg-blue-50 border-primary text-primary'
                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setFormData(prev => ({ ...prev, entryType: 'in' }))}
                                    >
                                        <div className="flex items-center justify-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                            </svg>
                                            Stock In
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md border ${formData.entryType === 'out'
                                            ? 'bg-red-50 border-red-500 text-red-700'
                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setFormData(prev => ({ ...prev, entryType: 'out' }))}
                                    >
                                        <div className="flex items-center justify-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                            Stock Out
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
                                    Category *
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category) => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>

                                {/* Available Stock Display */}
                                {formData.category && (
                                    <div className="mt-2 text-sm">
                                        <span className="text-gray-600">Available Stock: </span>
                                        <span className={`font-medium ${getAvailableStock(formData.category) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {getAvailableStock(formData.category)} units
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Stock Validation Error */}
                            {!formValidation.isValid && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-red-700 text-sm font-medium">{formValidation.error}</span>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="quantity">
                                        Quantity
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <input
                                            type="number"
                                            id="quantity"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            className="block w-full pr-10 py-2 px-2 border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm"
                                            placeholder="0"
                                            required
                                            min="1"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">units</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="entry-date">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        id="entry-date"
                                        name="entryDate"
                                        value={formatDateForInput(formData.entryDate)}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            entryDate: new Date(e.target.value)
                                        }))}
                                        className="block w-full border-gray-300 py-2 px-2 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
                                    Notes
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="block w-full py-2 px-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="Optional notes about this stock entry..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${formValidation.isValid && !loading
                                        ? 'bg-primary hover:bg-secondary'
                                        : 'bg-gray-400 cursor-not-allowed'
                                        }`}
                                    disabled={loading || !formValidation.isValid}
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                            <span>Saving...</span>
                                        </div>
                                    ) : (
                                        'Save Entry'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteDialog
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Stock Entry"
                message="Are you sure you want to delete this stock entry? This action cannot be undone and all data associated with this entry will be permanently removed."
            />
        </div>
    );
};

export default StockManagement;