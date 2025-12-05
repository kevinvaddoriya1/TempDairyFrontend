import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaHome } from 'react-icons/fa';
import logo from '../assets/logo.svg';

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <img src={logo} alt="Company Logo" className="h-16 w-auto mb-8" />

            <motion.div
                className="text-center max-w-lg"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, type: 'spring' }}
                    className="inline-block"
                >
                    <div className="text-9xl font-bold text-[#2E7CE6] mb-4 opacity-10 relative">
                        404
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-24 h-24 text-[#2E7CE6]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </motion.div>

                <h1 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h1>
                <p className="text-gray-600 mb-8">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                    <Link to="/dashboard">
                        <motion.button
                            className="flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-[#2E7CE6] text-white rounded-lg shadow-md hover:bg-[#2468C2] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2E7CE6] focus:ring-opacity-50"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FaHome className="mr-2" />
                            Back to Dashboard
                        </motion.button>
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                    >
                        <FaArrowLeft className="mr-2" />
                        Go Back
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFound;