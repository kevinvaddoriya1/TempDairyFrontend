// pages/CustomersPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  getCustomers,
  deleteCustomer,
  getMilkTypes,
  getSubcategoriesByMilkType,
} from "../services/customerApi";
import { toast } from "react-toastify";
import { LoadingSpinner } from "../components";
import DeleteDialog from '../components/common/DeleteDialog';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // State for search and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("customerNo");
  const [sortOrder, setSortOrder] = useState("asc");
  const searchTimerRef = useRef(null);

  // State for milk category and subcategory filters
  const [milkTypes, setMilkTypes] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedMilkType, setSelectedMilkType] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch customers data with current parameters
  const fetchCustomers = async () => {
    setLoading(true);
    // Clear any previous errors
    setError(null);

    try {
      // Log all parameters being sent to the API
      console.log("API Request Parameters:", {
        page: currentPage,
        limit,
        search: searchTerm, // Make sure this is included
        sortField,
        sortOrder,
        milkType: selectedMilkType,
        subcategory: selectedSubcategory,
        isActive: statusFilter !== "all" ? (statusFilter === "active" ? "true" : "false") : undefined
      });

      // Build query parameters
      const queryParams = {
        page: currentPage,
        limit,
        search: searchTerm, // Make sure this parameter name matches what your API expects
        sortField,
        sortOrder,
      };

      if (selectedMilkType) {
        queryParams.milkType = selectedMilkType;
      }

      if (selectedSubcategory) {
        queryParams.subcategory = selectedSubcategory;
      }

      if (statusFilter !== "all") {
        queryParams.isActive = statusFilter === "active" ? "true" : "false";
      }

      const response = await getCustomers(queryParams);

      if (response && response.customers) {
        setCustomers(response.customers);
        setTotalPages(response.totalPages || 0);
        setTotalCustomers(response.totalCustomers || 0);
      } else {
        setCustomers([]);
        setTotalPages(0);
        setTotalCustomers(0);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch customers";
      setError(errorMessage);
      toast.error(errorMessage);
      setCustomers([]);
      setTotalPages(0);
      setTotalCustomers(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch milk types for filter dropdown
  const fetchMilkTypes = async () => {
    try {
      const data = await getMilkTypes();
      setMilkTypes(data || []);
    } catch (error) {
      console.error("Failed to fetch milk types:", error);
      setMilkTypes([]);
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch milk types";
      setError(prevError => prevError || errorMessage);
      toast.error(errorMessage);
    }
  };

  // Fetch subcategories when milk type changes
  const fetchSubcategories = async (milkTypeId) => {
    if (!milkTypeId) {
      setSubcategories([]);
      return;
    }

    try {
      const data = await getSubcategoriesByMilkType(milkTypeId);
      setSubcategories(data || []);
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
      setSubcategories([]);
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch subcategories";
      setError(prevError => prevError || errorMessage);
      toast.error(errorMessage);
    }
  };

  // Effect for initial load
  useEffect(() => {
    fetchCustomers();
    fetchMilkTypes();

    // Cleanup function
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  // Effect for pagination and sorting changes
  useEffect(() => {
    fetchCustomers();
  }, [currentPage, limit, sortField, sortOrder]);

  // Effect for milk type changes
  useEffect(() => {
    if (selectedMilkType) {
      fetchSubcategories(selectedMilkType);
    } else {
      setSubcategories([]);
      setSelectedSubcategory("");
    }
  }, [selectedMilkType]);

  // Effect for filter changes
  useEffect(() => {
    setCurrentPage(1);
    fetchCustomers();
  }, [selectedMilkType, selectedSubcategory, statusFilter]);

  // Effect for search term changes
  useEffect(() => {
    // Only trigger when searchTerm changes AND it's not the initial render
    if (searchTerm !== null) { // This condition ensures the effect doesn't run on initial render
      const timer = setTimeout(() => {
        console.log("Search term changed to:", searchTerm);
        setCurrentPage(1);
        fetchCustomers();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [searchTerm]); // Only trigger on searchTerm changes

  // Handle search input with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;

    // Clear any existing timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // Clear previous errors when starting a new search
    if (error) setError(null);

    // Update the search term state
    setSearchTerm(value);
  };

  const handleMilkTypeChange = (e) => {
    // Clear any previous errors when changing filters
    setError(null);
    setSelectedMilkType(e.target.value);
    setSelectedSubcategory("");
  };

  const handleSubcategoryChange = (e) => {
    // Clear any previous errors when changing filters
    setError(null);
    setSelectedSubcategory(e.target.value);
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    // Clear any previous errors when changing filters
    setError(null);
    setStatusFilter(e.target.value);
  };

  // Handle sorting
  const handleSort = (field) => {
    // Clear any previous errors when sorting
    setError(null);

    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    // Clear any previous errors when changing page
    setError(null);
    setCurrentPage(page);
  };

  // Handle rows per page change
  const handleLimitChange = (e) => {
    // Clear any previous errors when changing limit
    setError(null);
    setLimit(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Reset all filters
  const handleResetFilters = () => {
    // Clear search and filters
    setSearchTerm("");
    setSelectedMilkType("");
    setSelectedSubcategory("");
    setStatusFilter("all");

    // Reset to page 1
    setCurrentPage(1);

    // Clear any existing search timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // Clear any previous errors
    setError(null);

    // Force a fetch with cleared filters
    setTimeout(() => {
      console.log("Fetching with reset filters");
      fetchCustomers();
    }, 0);
  };

  // Handle delete customer
  const openDeleteDialog = (customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  // Handle delete customer
  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;

    setDeleteLoading(true);
    // Clear any previous errors
    setError(null);

    try {
      await deleteCustomer(customerToDelete._id);
      toast.success("Customer deactivated successfully");
      closeDeleteDialog();
      fetchCustomers(); // Refresh the list
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to deactivate customer";
      setError(errorMessage);
      toast.error(errorMessage);
      closeDeleteDialog(); // Close the dialog even on error
    } finally {
      setDeleteLoading(false);
    }
  };

  // Add these new functions for bulk delete
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCustomers(customers.map(customer => customer._id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return;

    setDeleteLoading(true);
    // Clear any previous errors
    setError(null);

    try {
      // Delete each selected customer
      await Promise.all(selectedCustomers.map(id => deleteCustomer(id)));
      toast.success(`${selectedCustomers.length} customers deactivated successfully`);
      setSelectedCustomers([]); // Clear selection
      fetchCustomers(); // Refresh the list
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to deactivate customers";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Custom Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    // Calculate the page numbers to show
    let pageNumbers = [];
    const maxPageButtons = 5; // Maximum number of page buttons to show

    if (totalPages <= maxPageButtons) {
      // Show all pages if there are less than maxPageButtons
      pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Show a range of pages with ellipses
      if (currentPage <= 3) {
        // Near the start
        pageNumbers = [1, 2, 3, 4, "...", totalPages];
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pageNumbers = [
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        // In the middle
        pageNumbers = [
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        ];
      }
    }

    return (
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2 py-1 rounded ${currentPage === 1
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-3 py-1">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded ${currentPage === page
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-2 py-1 rounded ${currentPage === totalPages
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    );
  };

  // Sort indicator component
  const SortIndicator = ({ field }) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>;
  };

  // Add this new function
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedCustomers([]); // Clear selection when toggling mode
  };

  if (loading && customers.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container px-6 py-4 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Customer Management
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSelectionMode}
            className={`px-4 py-2 transition rounded ${isSelectionMode
              ? "bg-gray-600 text-white hover:bg-gray-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            {isSelectionMode ? "Cancel Selection" : "Select Customers"}
          </button>
          {selectedCustomers.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={deleteLoading}
              className="px-4 py-2 text-white transition bg-red-600 rounded hover:bg-red-700 disabled:bg-red-400"
            >
              {deleteLoading ? (
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                `Delete Selected (${selectedCustomers.length})`
              )}
            </button>
          )}
          <Link
            to="/customers/create"
            className="px-4 py-2 text-white transition bg-blue-600 rounded hover:bg-blue-700"
          >
            Add New Customer
          </Link>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-6">
        <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-4">
          {/* Search input */}
          <div className="md:col-span-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, phone, or address..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                    // Force fetch after clearing search
                    setTimeout(() => fetchCustomers(), 0);
                  }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filter dropdowns */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Milk Type
            </label>
            <select
              value={selectedMilkType}
              onChange={handleMilkTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Milk Types</option>
              {milkTypes.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Subcategory
            </label>
            <select
              value={selectedSubcategory}
              onChange={handleSubcategoryChange}
              disabled={!selectedMilkType}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="">All Subcategories</option>
              {subcategories.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full px-4 py-2 text-sm text-gray-700 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Active filters display */}
        {(selectedMilkType ||
          selectedSubcategory ||
          statusFilter !== "all" ||
          searchTerm) && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-sm font-medium text-gray-700">
                Active Filters:
              </span>

              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                  Search: {searchTerm.length > 20 ? `${searchTerm.substring(0, 20)}...` : searchTerm}
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentPage(1);
                      setTimeout(() => fetchCustomers(), 0);
                    }}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                    aria-label="Remove search filter"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedMilkType && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                  Milk Type:{" "}
                  {milkTypes.find((t) => t._id === selectedMilkType)?.name ||
                    "Selected"}
                  <button
                    onClick={() => {
                      setSelectedMilkType("");
                      setSelectedSubcategory("");
                    }}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                    aria-label="Remove milk type filter"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedSubcategory && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                  Subcategory:{" "}
                  {subcategories.find((s) => s._id === selectedSubcategory)
                    ?.name || "Selected"}
                  <button
                    onClick={() => setSelectedSubcategory("")}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                    aria-label="Remove subcategory filter"
                  >
                    ×
                  </button>
                </span>
              )}

              {statusFilter !== "all" && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                  Status: {statusFilter === "active" ? "Active" : "Inactive"}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                    aria-label="Remove status filter"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 border-l-4 border-red-500 rounded-md">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="font-medium">Error:</span>
            <span className="ml-2">{error}</span>
          </div>
          <div className="mt-2">
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-700 underline hover:text-red-900"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Customers Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              {isSelectionMode && (
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.length === customers.length && customers.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
              )}
              <th
                className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort("customerNo")}
              >
                Customer No
                <SortIndicator field="customerNo" />
              </th>
              <th
                className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name
                <SortIndicator field="name" />
              </th>
              <th
                className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort("phoneNo")}
              >
                Phone
                <SortIndicator field="phoneNo" />
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Address
              </th>
              {/* <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Morning Delivery
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Evening Delivery
              </th> */}
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Total Qty
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Total Price
              </th>
              <th
                className="px-4 py-3 text-center text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort("isActive")}
              >
                Status
                <SortIndicator field="isActive" />
              </th>
              <th className="px-4 py-3 text-center text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={isSelectionMode ? "12" : "11"}
                  className="px-4 py-4 text-sm text-center text-gray-500"
                >
                  Loading customers...
                </td>
              </tr>
            ) : totalCustomers === 0 ? (
              <tr>
                <td
                  colSpan={isSelectionMode ? "12" : "11"}
                  className="px-4 py-4 text-sm text-center text-gray-500"
                >
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((customer) => {
                // Find morning and evening deliverySchedule
                let morning = null;
                let evening = null;
                if (Array.isArray(customer.deliverySchedule)) {
                  customer.deliverySchedule.forEach(ds => {
                    if (ds.time === 'morning') morning = ds;
                    if (ds.time === 'evening') evening = ds;
                  });
                }
                return (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    {isSelectionMode && (
                      <td className="px-4 py-3 text-sm text-center text-gray-900 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer._id)}
                          onChange={() => handleSelectCustomer(customer._id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {customer.customerNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {customer.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {customer.phoneNo}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-sm text-gray-900 truncate">
                      {customer.address}
                    </td>
                    {/* Morning Delivery column */}
                    {/* <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {morning && morning.milkItems && morning.milkItems.length > 0 ? (
                        <div className="space-y-1">
                          {morning.milkItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-blue-50 rounded px-2 py-1">
                              <span className="font-medium">{item.milkType?.name || 'N/A'}</span>
                              <span className="text-xs text-gray-500">/ {item.subcategory?.name || 'N/A'}</span>
                              <span className="ml-auto text-xs text-gray-700">{item.quantity}L × ₹{item.pricePerUnit}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td> */}
                    {/* Evening Delivery column */}
                    {/* <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {evening && evening.milkItems && evening.milkItems.length > 0 ? (
                        <div className="space-y-1">
                          {evening.milkItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-yellow-50 rounded px-2 py-1">
                              <span className="font-medium">{item.milkType?.name || 'N/A'}</span>
                              <span className="text-xs text-gray-500">/ {item.subcategory?.name || 'N/A'}</span>
                              <span className="ml-auto text-xs text-gray-700">{item.quantity}L × ₹{item.pricePerUnit}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td> */}
                    {/* Total Daily Quantity */}
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {customer.totalDailyQuantity || 0}
                    </td>
                    {/* Total Daily Price */}
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      ₹{customer.totalDailyPrice || 0}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${customer.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {customer.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 whitespace-nowrap">
                      <div className="flex justify-center space-x-2">
                        <Link
                          to={`/customers/view/${customer._id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </Link>
                        <Link
                          to={`/customers/edit/${customer._id}`}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit Customer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Link>
                        <button
                          onClick={() => openDeleteDialog(customer)}
                          className="text-red-600 hover:text-red-900"
                          title="Deactivate Customer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        message={`Are you sure you want to delete customer ${customerToDelete?.name} (#${customerToDelete?.customerNo})? This action will make them inactive in the system.`}
      />
      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Showing {customers.length} of {totalCustomers} customers
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <select
              value={limit}
              onChange={handleLimitChange}
              className="px-2 py-1 text-sm border rounded"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
          <Pagination />
        </div>
      </div>
    </div>
  );
};

export default CustomersPage