import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories, deleteCategory } from "../services/categoryApi";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaEye,
  FaFilter,
} from "react-icons/fa";
import DeleteDialog from '../components/common/DeleteDialog';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Filtering and sorting states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch categories. Please try again later.");
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err) {
      setError("Failed to delete category. Please try again later.");
      console.error("Error deleting category:", err);
    }
  };

  // Filtering and sorting logic
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleSort = (field) => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // If clicking a different field, sort ascending by that field
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset to first page on new sort
  };

  // Apply filtering and sorting
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    // Handle null or undefined values
    const valueA = a[sortField] || "";
    const valueB = b[sortField] || "";

    // Sort strings case-insensitive
    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortDirection === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    // Sort numbers
    return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);

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
        pageNumbers.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis if needed before last page
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Always show last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };
  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  const handleCancelDelete = () => {
    setCategoryToDelete(null);
    setShowDeleteDialog(false);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await deleteCategory(categoryToDelete._id);

      if (response.status) {
        fetchCategories();
      } else {
        setError(
          "Failed to delete category. Please try again later." +
          response.message
        );
      }

      //   }
    } catch (err) {
      setError(
        "Failed to delete category. Please try again later." + err.message
      );
      console.error("Error deleting category:", err);
    } finally {
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
    }
  };
  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Milk Categories</h1>
          <p className="mt-1 text-gray-500">Manage your product categories</p>
        </div>

        <Link
          to="/categories/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center font-medium transition-colors duration-200 shadow-sm"
        >
          <FaPlus className="mr-2" /> Add New Category
        </Link>
      </div>

      {error && (
        <div className="flex items-start p-4 mb-6 text-red-700 border-l-4 border-red-500 rounded shadow-sm bg-red-50">
          <div className="flex-shrink-0 pt-0.5">
            <svg
              className="w-5 h-5 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Search and filter bar */}
      <div className="p-6 mb-6 bg-white border border-gray-100 shadow-sm rounded-xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg pl-11 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="mr-1 font-medium text-gray-600 whitespace-nowrap">
              Sort by:
            </span>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors duration-200 ${sortField === "name"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              onClick={() => handleSort("name")}
            >
              Name
              {sortField === "name" &&
                (sortDirection === "asc" ? (
                  <FaSortAlphaDown className="ml-2" />
                ) : (
                  <FaSortAlphaUp className="ml-2" />
                ))}
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors duration-200 ${sortField === "createdAt"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              onClick={() => handleSort("createdAt")}
            >
              Date
              {sortField === "createdAt" &&
                (sortDirection === "asc" ? (
                  <FaSortAlphaDown className="ml-2" />
                ) : (
                  <FaSortAlphaUp className="ml-2" />
                ))}
            </button>
          </div>
        </div>
      </div>

      {/* Categories table */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-10 h-10 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 font-medium text-gray-600">
              Loading categories...
            </p>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
              <FaFilter className="text-xl text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-800">
              No categories found
            </h3>
            <p className="mb-6 text-gray-500">
              {searchTerm
                ? "Try adjusting your search criteria."
                : "Create your first category to get started."}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm("")}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear search
              </button>
            ) : (
              <Link
                to="/categories/create"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaPlus className="mr-2 -ml-1" /> Create Category
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th
                      scope="col"
                      className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                    >
                      Created
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-xs font-medium tracking-wider text-right text-gray-500 uppercase"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((category) => (
                    <tr
                      key={category._id}
                      className="transition-colors duration-150 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-md text-sm text-gray-500 line-clamp-2">
                          {category.description || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(category.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-3">
                          {/* <Link
                                                        to={`/categories/view/${category._id}`}
                                                        className="p-2 text-gray-500 transition-colors duration-200 bg-gray-100 rounded-md hover:text-gray-700 hover:bg-gray-200"
                                                        title="View Details"
                                                    >
                                                        <FaEye />
                                                    </Link> */}
                          <Link
                            to={`/categories/edit/${category._id}`}
                            className="p-2 text-blue-500 transition-colors duration-200 rounded-md hover:text-blue-700 bg-blue-50 hover:bg-blue-100"
                            title="Edit Category"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            className="p-2 text-red-500 transition-colors duration-200 rounded-md hover:text-red-700 bg-red-50 hover:bg-red-100"
                            onClick={() => confirmDelete(category)}
                            title="Delete Category"
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
              <div className="flex flex-col items-center justify-between px-6 py-4 border-t border-gray-200 sm:flex-row bg-gray-50">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, sortedCategories.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {sortedCategories.length}
                    </span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        paginate(currentPage > 1 ? currentPage - 1 : 1)
                      }
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:bg-gray-50"
                        }`}
                    >
                      Previous
                    </button>

                    {getPageNumbers().map((number, index) =>
                      number === "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={`page-${number}`}
                          onClick={() => paginate(number)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === number
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                        >
                          {number}
                        </button>
                      )
                    )}

                    <button
                      onClick={() =>
                        paginate(
                          currentPage < totalPages
                            ? currentPage + 1
                            : totalPages
                        )
                      }
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:bg-gray-50"
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
      <DeleteDialog
        isOpen={showDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete ${categoryToDelete?.name}?`}
      />
    </div>
  );
};

export default CategoryList;
