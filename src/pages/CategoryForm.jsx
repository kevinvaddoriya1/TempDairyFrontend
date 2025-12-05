import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { getCategoryById, createCategory, updateCategory } from '../services/categoryApi';
import { Button, Card, Alert, LoadingSpinner } from '../components';

const CategoryForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            fetchCategory();
        }
    }, [id]);

    const fetchCategory = async () => {
        try {
            setLoading(true);
            const category = await getCategoryById(id);
            setFormData({
                name: category.name,
                description: category.description || '',
                isActive: category.isActive,
            });
        } catch (err) {
            setError('Failed to fetch category details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!formData.name.trim()) {
            setError('Name is required');
            return;
        }

        try {
            setLoading(true);

            if (isEditMode) {
                await updateCategory(id, formData);
                setSuccess('Category updated successfully');
            } else {
                await createCategory(formData);
                setSuccess('Category created successfully');
                setFormData({
                    name: '',
                    description: '',
                    isActive: true,
                });
            }

            // Redirect after short delay if successful
            setTimeout(() => {
                navigate('/categories');
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save category');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return <LoadingSpinner fullScreen text="Loading category..." />;
    }

    return (
        <div className="p-6">
            <div className="flex items-center mb-6">
                <Button
                    variant="light"
                    size="sm"
                    icon={<FaArrowLeft />}
                    onClick={() => navigate('/categories')}
                    className="mr-4"
                >
                    Back
                </Button>
                <h1 className="text-2xl font-bold text-gray-800">
                    {isEditMode ? 'Edit Category' : 'Create New Category'}
                </h1>
            </div>

            {error && (
                <Alert
                    type="error"
                    message={error}
                    onClose={() => setError(null)}
                    className="mb-6"
                />
            )}

            {success && (
                <Alert
                    type="success"
                    message={success}
                    onClose={() => setSuccess(null)}
                    className="mb-6"
                />
            )}

            <Card>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Category Name <><span className="text-red-500">*</span></>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="block w-full rounded-lg border border-gray-300 py-2 px-3 shadow-sm focus:border-[#2E7CE6] focus:ring focus:ring-[#2E7CE6] focus:ring-opacity-50"
                            placeholder="Enter category name (e.g., Cow, Buffalo)"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows="4"
                            className="block w-full rounded-lg border border-gray-300 py-2 px-3 shadow-sm focus:border-[#2E7CE6] focus:ring focus:ring-[#2E7CE6] focus:ring-opacity-50"
                            placeholder="Enter category description (optional)"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="mb-6 flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            className="h-4 w-4 text-[#2E7CE6] focus:ring-[#2E7CE6] border-gray-300 rounded"
                            checked={formData.isActive}
                            onChange={handleChange}
                        />
                        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                            Active
                        </label>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            icon={<FaSave />}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Category'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CategoryForm;