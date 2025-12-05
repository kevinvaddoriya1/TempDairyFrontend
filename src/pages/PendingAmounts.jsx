import React, { useEffect, useState, useCallback } from 'react';
import { FaUsers, FaRupeeSign, FaSearch } from 'react-icons/fa';
import Pagination from '../components/common/Pagination';
import { getDueCustomers, searchDueCustomers } from '../services/invoiceService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import { formatCurrency } from '../utils/formatters';

const PendingAmounts = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [customers, setCustomers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [grandTotalDue, setGrandTotalDue] = useState(0);
    const [baseGrandTotalDue, setBaseGrandTotalDue] = useState(0);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchPage, setSearchPage] = useState(1);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const params = { page: currentPage, limit: 10 };
            const data = await getDueCustomers(params);
            setCustomers(data.customers || []);
            setTotalPages(data.totalPages || 1);
            setTotalCustomers(data.totalCustomers || 0);
            const totalDue = data.grandTotalDue || 0;
            setGrandTotalDue(totalDue);
            setBaseGrandTotalDue(totalDue);
        } catch (err) {
            setError(err.message || 'Failed to load pending amounts');
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Perform full-data search when search string is present
    useEffect(() => {
        const run = async () => {
            if (!search.trim()) {
                setSearchResults([]);
                setSearchPage(1);
                setGrandTotalDue(baseGrandTotalDue);
                return;
            }
            try {
                setLoading(true);
                const data = await searchDueCustomers(search.trim());
                setSearchResults(data.customers || []);
                // Keep grandTotalDue reflective of search results for header
                setGrandTotalDue(data.grandTotalDue || 0);
            } catch (err) {
                setError(err.message || 'Search failed');
            } finally {
                setLoading(false);
            }
        };
        // Debounce
        const t = setTimeout(run, 300);
        return () => clearTimeout(t);
    }, [search, baseGrandTotalDue]);

    // Determine rows and pagination source
    const isSearching = !!search.trim();
    const rows = isSearching ? searchResults.slice((searchPage - 1) * 10, searchPage * 10) : customers;
    const pages = isSearching ? Math.max(1, Math.ceil(searchResults.length / 10)) : totalPages;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pending Amounts</h1>
                        <p className="text-sm text-gray-600 mt-1">Customers with outstanding due amounts</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-lg">
                        <FaRupeeSign className="text-gray-600" />
                        <span className="text-sm text-gray-700 font-medium">Total Due: {formatCurrency(grandTotalDue)}</span>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2 text-gray-700">
                            <FaUsers />
                            <span className="text-sm">Total Customers: {totalCustomers}</span>
                        </div>
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                value={search}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setSearch(v);
                                    setSearchPage(1);
                                    if (v && /\D/.test(v)) {
                                        setError('Please enter numbers only');
                                    } else {
                                        setError('');
                                    }
                                }}
                                placeholder="Search by customer no..."
                                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="text"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-8 flex justify-center"><LoadingSpinner /></div>
                        ) : error ? (
                            <div className="p-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Due</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Invoices</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {rows.map((row) => (
                                        <tr key={row.customerId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.customerNo}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.phoneNo}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(row.totalDue)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{row.invoiceCount}</td>
                                        </tr>
                                    ))}
                                    {rows.length === 0 && (
                                        <tr>
                                            <td className="px-6 py-6 text-center text-sm text-gray-500" colSpan="5">No results</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {!loading && !error && pages > 1 && (
                        <div className="p-4 border-t border-gray-200">
                            <Pagination
                                currentPage={isSearching ? searchPage : currentPage}
                                totalPages={pages}
                                onPageChange={isSearching ? setSearchPage : setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PendingAmounts;


