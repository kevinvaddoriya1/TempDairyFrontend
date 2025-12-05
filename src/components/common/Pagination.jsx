import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ currentPage, totalPages, onPageChange, showNumbers = 5 }) => {
    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const halfShow = Math.floor(showNumbers / 2);

        let startPage = Math.max(1, currentPage - halfShow);
        let endPage = Math.min(totalPages, currentPage + halfShow);

        // Adjust if at the beginning or end
        if (currentPage <= halfShow) {
            endPage = Math.min(totalPages, showNumbers);
        }
        if (currentPage > totalPages - halfShow) {
            startPage = Math.max(1, totalPages - showNumbers + 1);
        }

        // Add first page and ellipsis if needed
        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) {
                pages.push('...');
            }
        }

        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Add last page and ellipsis if needed
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push('...');
            }
            pages.push(totalPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <nav className="flex items-center justify-between px-4 sm:px-0">
            <div className="flex w-0 flex-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium ${currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    <FaChevronLeft className="h-3 w-3" />
                    Previous
                </button>
            </div>

            <div className="hidden sm:flex sm:items-center sm:gap-1">
                {pageNumbers.map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <span className="px-3 py-2 text-gray-500">...</span>
                        ) : (
                            <button
                                onClick={() => onPageChange(page)}
                                className={`rounded-md px-3 py-2 text-sm font-medium ${currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Mobile: Current page indicator */}
            <div className="flex sm:hidden">
                <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                </span>
            </div>

            <div className="flex w-0 flex-1 justify-end">
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium ${currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    Next
                    <FaChevronRight className="h-3 w-3" />
                </button>
            </div>
        </nav>
    );
};

export default Pagination;