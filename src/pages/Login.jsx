import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { FaLock, FaUser, FaFileInvoice, FaUsers, FaChartLine, FaDatabase } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

// Import logo (you'll need to add this file to your assets folder)
import logo from '../assets/logo.svg';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setError('Please enter both username and password');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            const result = await login(username, password);

            if (!result.success) {
                setError(result.message);
                return;
            }
        }
        catch (error) {
            setError('Login failed. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-screen flex">
            {/* Left Panel - Feature Showcase */}
            <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-[#2F80ED] to-[#87CEEB] relative overflow-hidden">
                {/* Background pattern */}
                <motion.div
                    className="absolute inset-0 opacity-20"
                    animate={{
                        backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: 'reverse'
                    }}
                    style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z" fill="%23ffffff" fill-opacity="1" fill-rule="evenodd"/%3E%3C/svg%3E")',
                    }}
                ></motion.div>

                {/* Content container */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                    {/* Welcome text */}
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl font-bold text-white mb-2">Welcome to Admin Dashboard</h1>
                        <p className="text-xl text-white/90">Manage your business with ease</p>
                    </motion.div>

                    {/* Feature grid */}
                    <motion.div
                        className="grid grid-cols-2 gap-4 w-full max-w-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        {/* Feature 1 - Invoice Generation */}
                        <motion.div
                            className="bg-white/20 backdrop-blur-sm rounded-lg p-4 shadow-lg"
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex items-center mb-2">
                                <FaFileInvoice className="h-6 w-6 text-white mr-3" />
                                <h3 className="text-lg font-semibold text-white">Easy Invoicing</h3>
                            </div>
                            <p className="text-white/90 text-sm">Generate professional invoices in seconds</p>
                        </motion.div>

                        {/* Feature 2 - Customer Management */}
                        <motion.div
                            className="bg-white/20 backdrop-blur-sm rounded-lg p-4 shadow-lg"
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex items-center mb-2">
                                <FaUsers className="h-6 w-6 text-white mr-3" />
                                <h3 className="text-lg font-semibold text-white">Customer Management</h3>
                            </div>
                            <p className="text-white/90 text-sm">Organize customer data effortlessly</p>
                        </motion.div>

                        {/* Feature 3 - Analytics */}
                        <motion.div
                            className="bg-white/20 backdrop-blur-sm rounded-lg p-4 shadow-lg"
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex items-center mb-2">
                                <FaChartLine className="h-6 w-6 text-white mr-3" />
                                <h3 className="text-lg font-semibold text-white">Real-time Analytics</h3>
                            </div>
                            <p className="text-white/90 text-sm">Track business metrics instantly</p>
                        </motion.div>

                        {/* Feature 4 - Inventory */}
                        <motion.div
                            className="bg-white/20 backdrop-blur-sm rounded-lg p-4 shadow-lg"
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex items-center mb-2">
                                <FaDatabase className="h-6 w-6 text-white mr-3" />
                                <h3 className="text-lg font-semibold text-white">Inventory Control</h3>
                            </div>
                            <p className="text-white/90 text-sm">Manage stock levels efficiently</p>
                        </motion.div>
                    </motion.div>


                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="mb-6 inline-block"
                        >
                            {/* Company Logo */}
                            <img src={logo} alt="Ramdev Logo" className="h-16 w-auto mx-auto" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
                        <p className="text-gray-500 mt-2">Sign in to access your dashboard</p>
                    </div>

                    {error && (
                        <motion.div
                            className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <p className="font-medium">Error</p>
                            <p>{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                                    <FaUser className="h-5 w-5 text-gray-400" />
                                </div>
                                <motion.input
                                    whileFocus={{ scale: 1.005 }}
                                    transition={{ duration: 0.2 }}
                                    type="text"
                                    id="username"
                                    className="pl-10 block w-full rounded-lg border border-gray-300 py-3 shadow-sm focus:border-[#2F80ED] focus:ring focus:ring-[#2F80ED] focus:ring-opacity-50"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                                    <FaLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <motion.input
                                    whileFocus={{ scale: 1.005 }}
                                    transition={{ duration: 0.2 }}
                                    type="password"
                                    id="password"
                                    className="pl-10 block w-full rounded-lg border border-gray-300 py-3 shadow-sm focus:border-[#2F80ED] focus:ring focus:ring-[#2F80ED] focus:ring-opacity-50"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            className="w-full py-3 px-4 bg-[#2F80ED] hover:bg-[#4B93F1] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:ring-opacity-50 disabled:opacity-70"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p>© 2025 Ramdev. All rights reserved.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;