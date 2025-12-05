import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCustomerById } from '../services/customerApi';
import { LoadingSpinner } from '../components';
import { toast } from 'react-toastify';

const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCustomerDetails = async () => {
            try {
                setLoading(true);
                const data = await getCustomerById(id);
                setCustomer(data);
            } catch (error) {
                setError(error.message || 'Failed to fetch customer details');
                toast.error(error.message || 'Failed to fetch customer details');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerDetails();
    }, [id]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="container px-6 py-4 mx-auto">
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
                    {error}
                </div>
                <button
                    onClick={() => navigate('/customers')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Back to Customers
                </button>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="container px-6 py-4 mx-auto">
                <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded mb-4">
                    Customer not found
                </div>
                <button
                    onClick={() => navigate('/customers')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Back to Customers
                </button>
            </div>
        );
    }

    return (
        <div className="container px-6 py-4 mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Customer Details</h1>
                <div className="flex space-x-2">
                    <Link
                        to={`/customers/edit/${customer._id}`}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                    >
                        Edit Customer
                    </Link>
                    <button
                        onClick={() => navigate('/customers')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Back to List
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {/* Customer Status Badge */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-xl font-semibold text-gray-800 mr-3">
                                Customer #{customer.customerNo}
                            </span>
                            <span
                                className={`px-3 py-1 text-xs rounded-full ${customer.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}
                            >
                                {customer.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="text-sm text-gray-500 flex gap-4">
                            <div>Joined: {customer.joinedDate || 'N/A'}</div>
                            <div>Created: {new Date(customer.createdAt).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>

                {/* Customer Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    {/* Personal Information Section */}
                    <div className="md:col-span-2">
                        <h2 className="text-lg font-medium text-gray-800 mb-3">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4 bg-gray-50">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium">{customer.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone Number</p>
                                <p className="font-medium">{customer.phoneNo}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Join Date</p>
                                <p className="font-medium">{customer.joinedDate || 'Not available'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="font-medium">{customer.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Milk Subscription Details */}
                    <div className="md:col-span-2">
                        <h2 className="text-lg font-medium text-gray-800 mb-3">Milk Subscription Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                            {customer.deliverySchedule && customer.deliverySchedule.length > 0 ? (
                                customer.deliverySchedule.map((ds, idx) => (
                                    <div key={ds.time} className="border rounded-lg p-4 bg-gray-50 mb-4">
                                        <h3 className="text-md font-semibold mb-2 capitalize flex items-center gap-2">
                                            {ds.time === 'morning' ? (
                                                <span role="img" aria-label="morning">☀️</span>
                                            ) : (
                                                <span role="img" aria-label="evening">🌙</span>
                                            )}
                                            {ds.time.charAt(0).toUpperCase() + ds.time.slice(1)} Delivery
                                        </h3>
                                        <table className="w-full text-sm border">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="p-2 border">Milk Type</th>
                                                    <th className="p-2 border">Subcategory</th>
                                                    <th className="p-2 border">Quantity</th>
                                                    <th className="p-2 border">Price/Unit</th>
                                                    <th className="p-2 border">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ds.milkItems && ds.milkItems.length > 0 ? (
                                                    ds.milkItems.map((item, i) => (
                                                        <tr key={i}>
                                                            <td className="p-2 border">{item.milkType?.name || 'N/A'}</td>
                                                            <td className="p-2 border">{item.subcategory?.name || 'N/A'}</td>
                                                            <td className="p-2 border">{item.quantity}</td>
                                                            <td className="p-2 border">₹{item.pricePerUnit}</td>
                                                            <td className="p-2 border">₹{item.totalPrice}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="5" className="p-2 text-center">No milk items</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                        <div className="mt-2 text-right text-sm text-gray-700 font-medium">
                                            Total: {ds.totalQuantity} liter(s), ₹{ds.totalPrice}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 text-center text-gray-500">No delivery schedule found.</div>
                            )}
                        </div>
                    </div>

                    {/* Login Information */}
                    <div className="md:col-span-2">
                        <h2 className="text-lg font-medium text-gray-800 mb-3">Account Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4 bg-gray-50">
                            <div>
                                <p className="text-sm text-gray-500">Username</p>
                                <p className="font-medium">{customer.username}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Password</p>
                                <p className="font-medium">••••••••<span className="text-xs text-gray-500 ml-2">(Phone number)</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="md:col-span-2">
                        <h2 className="text-lg font-medium text-gray-800 mb-3">Financial Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-lg p-4 bg-gray-50">
                            <div>
                                <p className="text-sm text-gray-500">Total Daily Quantity</p>
                                <p className="font-medium">{customer.totalDailyQuantity} liter(s)</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Daily Price</p>
                                <p className="font-medium">₹{customer.totalDailyPrice}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Monthly Cost (approx)</p>
                                <p className="font-medium">₹{(customer.totalDailyPrice * 30).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail;