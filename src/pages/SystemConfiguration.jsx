import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCog, FaPlus, FaEdit, FaTrash, FaSave, FaUsers, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Modal } from 'antd';
import {
    getSystemConfig,
    updateSystemConfig,
    addMilkman,
    updateMilkman,
    deleteMilkman,
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin
} from '../services/systemConfigApi';
import CryptoJS from 'crypto-js';

const SystemConfiguration = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [admins, setAdmins] = useState([]);

    // Form states
    const [configForm, setConfigForm] = useState({
        morningTime: '',
        eveningTime: ''
    });

    // Milkman form states
    const [showMilkmanForm, setShowMilkmanForm] = useState(false);
    const [editingMilkman, setEditingMilkman] = useState(null);
    const [milkmanForm, setMilkmanForm] = useState({
        name: '',
        phoneNumber: ''
    });

    // Admin form states
    const [showAdminForm, setShowAdminForm] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [adminForm, setAdminForm] = useState({
        username: '',
        password: '',
        isAdmin: true
    });
    const [showPassword, setShowPassword] = useState(false);

    // Delete confirmation modal states
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [milkmanToDelete, setMilkmanToDelete] = useState(null);
    const [adminToDelete, setAdminToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(''); // 'milkman' or 'admin'

    useEffect(() => {
        fetchConfig();
        fetchAdmins();
    }, []);
    function decryptPassword(cipherText, secretKey) {
        const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
    const fetchConfig = async () => {
        try {
            setLoading(true);
            const data = await getSystemConfig();
            setConfig(data);
            setConfigForm({
                morningTime: data.morningTime || '',
                eveningTime: data.eveningTime || ''
            });
        } catch (error) {
            toast.error('Failed to fetch configuration');
        } finally {
            setLoading(false);
        }
    };

    const fetchAdmins = async () => {
        try {
            const data = await getAllAdmins();
            setAdmins(data);
        } catch (error) {
            toast.error('Failed to fetch admins');
        }
    };

    const handleConfigSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await updateSystemConfig(configForm);
            setConfig(result.config);
            toast.success('Times updated successfully');
        } catch (error) {
            toast.error('Failed to update times');
        }
    };

    const handleMilkmanSubmit = async (e) => {
        e.preventDefault();
        try {
            let result;
            if (editingMilkman) {
                result = await updateMilkman(editingMilkman._id, milkmanForm);
                toast.success('Milkman updated successfully');
            } else {
                result = await addMilkman(milkmanForm);
                toast.success('Milkman added successfully');
            }
            setConfig(result.config);
            resetMilkmanForm();
        } catch (error) {
            toast.error('Failed to save milkman');
        }
    };

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAdmin) {
                await updateAdmin(editingAdmin._id, adminForm);
                toast.success('Admin updated successfully');
            } else {
                await createAdmin(adminForm);
                toast.success('Admin created successfully');
            }
            fetchAdmins();
            resetAdminForm();
        } catch (error) {
            toast.error('Failed to save admin');
        }
    };

    const handleEditMilkman = (milkman) => {
        setEditingMilkman(milkman);
        setMilkmanForm({
            name: milkman.name,
            phoneNumber: milkman.phoneNumber
        });
        setShowMilkmanForm(true);
    };

    const handleEditAdmin = (admin) => {
        setEditingAdmin(admin);
        setAdminForm({
            username: admin.username,
            password: decryptPassword(admin.password, "Ramdev-Dairy-2025"),
            isAdmin: admin.isAdmin
        });
        setShowAdminForm(true);
    };

    // Show delete confirmation modal
    const showDeleteConfirm = (item, type) => {
        if (type === 'milkman') {
            setMilkmanToDelete(item);
            setDeleteType('milkman');
        } else {
            setAdminToDelete(item);
            setDeleteType('admin');
        }
        setDeleteModalVisible(true);
    };

    // Confirm delete action
    const confirmDelete = async () => {
        try {
            if (deleteType === 'milkman') {
                const result = await deleteMilkman(milkmanToDelete._id);
                setConfig(result.config);
                toast.success('Milkman deleted successfully');
            } else {
                await deleteAdmin(adminToDelete._id);
                fetchAdmins();
                toast.success('Admin deleted successfully');
            }
            setDeleteModalVisible(false);
        } catch (error) {
            toast.error(`Failed to delete ${deleteType}`);
        }
    };

    const handleDeleteMilkman = async (milkman) => {
        showDeleteConfirm(milkman, 'milkman');
    };

    const handleDeleteAdmin = async (admin) => {
        showDeleteConfirm(admin, 'admin');
    };

    const resetMilkmanForm = () => {
        setMilkmanForm({
            name: '',
            phoneNumber: ''
        });
        setEditingMilkman(null);
        setShowMilkmanForm(false);
    };

    const resetAdminForm = () => {
        setAdminForm({
            username: '',
            password: '',
            isAdmin: true
        });
        setEditingAdmin(null);
        setShowAdminForm(false);
        setShowPassword(false);
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center mb-4">
                    <FaCog className="text-blue-500 text-2xl mr-3" />
                    <h1 className="text-2xl font-semibold">System Configuration</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Time Configuration */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Delivery Times</h2>
                    <form onSubmit={handleConfigSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Morning Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                value={configForm.morningTime}
                                onChange={(e) => setConfigForm({ ...configForm, morningTime: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Evening Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                value={configForm.eveningTime}
                                onChange={(e) => setConfigForm({ ...configForm, eveningTime: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center"
                        >
                            <FaSave className="mr-2" />
                            Save Times
                        </button>
                    </form>
                </div>

                {/* Milkmen Management */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Milkmen</h2>
                        <button
                            onClick={() => setShowMilkmanForm(!showMilkmanForm)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
                        >
                            <FaPlus className="mr-2" />
                            Add
                        </button>
                    </div>

                    {/* Add/Edit Form */}
                    {showMilkmanForm && (
                        <form onSubmit={handleMilkmanSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={milkmanForm.name}
                                        onChange={(e) => setMilkmanForm({ ...milkmanForm, name: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={milkmanForm.phoneNumber}
                                        onChange={(e) => setMilkmanForm({ ...milkmanForm, phoneNumber: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        type="submit"
                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                                    >
                                        <FaSave className="mr-2 inline" />
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetMilkmanForm}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Milkmen List */}
                    <div className="space-y-3">
                        {config?.milkmen?.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No milkmen added</p>
                        ) : (
                            config?.milkmen?.map((milkman) => (
                                <div key={milkman._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{milkman.name}</p>
                                        <p className="text-sm text-gray-600">{milkman.phoneNumber}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditMilkman(milkman)}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteMilkman(milkman)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Admin Management */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Admins</h2>
                        <button
                            onClick={() => setShowAdminForm(!showAdminForm)}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md flex items-center"
                        >
                            <FaUsers className="mr-2" />
                            Add
                        </button>
                    </div>

                    {/* Add/Edit Form */}
                    {showAdminForm && (
                        <form onSubmit={handleAdminSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Username <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={adminForm.username}
                                        onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Password {editingAdmin ? '' : <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={adminForm.password}
                                            onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required={!editingAdmin}
                                            placeholder={editingAdmin ? "Leave blank to keep current password" : ""}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={adminForm.isAdmin}
                                            onChange={(e) => setAdminForm({ ...adminForm, isAdmin: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium">Admin privileges</span>
                                    </label>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        type="submit"
                                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md"
                                    >
                                        <FaSave className="mr-2 inline" />
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetAdminForm}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Admins List */}
                    <div className="space-y-3">
                        {admins.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No admins found</p>
                        ) : (
                            admins.map((admin) => (
                                console.log(admin),
                                <div key={admin._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{admin.username}</p>
                                        <p className="text-sm text-gray-600">
                                            {admin.isAdmin ? 'Admin' : 'User'}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditAdmin(admin)}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAdmin(admin)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Confirm Delete"
                open={deleteModalVisible}
                onOk={confirmDelete}
                onCancel={() => setDeleteModalVisible(false)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{
                    style: { backgroundColor: '#f5222d', borderColor: '#f5222d', color: '#fff' }
                }}
                cancelButtonProps={{
                    style: { color: '#000' }
                }}
            >
                <div className="p-4">
                    <p>Are you sure you want to delete this {deleteType}?</p>
                    {deleteType === 'milkman' && milkmanToDelete && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                            <p className="font-medium">{milkmanToDelete.name}</p>
                            <p className="text-sm text-gray-600">{milkmanToDelete.phoneNumber}</p>
                        </div>
                    )}
                    {deleteType === 'admin' && adminToDelete && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                            <p className="font-medium">{adminToDelete.username}</p>
                            <p className="text-sm text-gray-600">
                                {adminToDelete.isAdmin ? 'Admin' : 'User'}
                            </p>
                        </div>
                    )}
                    <p className="mt-4 text-red-500">This action cannot be undone.</p>
                </div>
            </Modal>
        </div>
    );
};

export default SystemConfiguration;
