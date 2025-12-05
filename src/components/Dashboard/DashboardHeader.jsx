import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { FaSignOutAlt, FaUser, FaBell, FaSearch, FaQuestionCircle } from 'react-icons/fa';
import { Button } from '../';
import AuthContext from '../../context/AuthContext';
import logo from '../../assets/logo.svg';

const DashboardHeader = () => {
  const { admin, logout } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <motion.header
      className="bg-white shadow-sm py-3 px-6 flex justify-between items-center"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        <img src={logo} alt="AdminPro Logo" className="h-10 w-auto" />
      </div>

      {/* <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 flex-1 max-w-md mx-10">
        <FaSearch className="text-gray-400 mr-2" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="bg-transparent border-none outline-none flex-1 text-sm"
        />
      </div> */}

      <div className="flex items-center">
        {/* Help */}
        {/* <button className="text-gray-600 hover:text-[#2E7CE6] p-2 relative">
          <FaQuestionCircle className="text-xl" />
        </button> */}

        {/* Notifications */}
        {/* <div className="relative mx-2">
          <button 
            className="text-gray-600 hover:text-[#2E7CE6] p-2 relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FaBell className="text-xl" />
            <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
          </button>
          
          {showNotifications && (
            <motion.div 
              className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="px-4 py-2 border-b border-gray-200">
                <h3 className="font-medium">Notifications</h3>
              </div>
              
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                  <p className="text-sm font-medium">New update available</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              ))}
              
              <div className="px-4 py-2 text-center">
                <button className="text-[#2E7CE6] text-sm font-medium hover:underline">
                  View all notifications
                </button>
              </div>
            </motion.div>
          )}
        </div> */}

        {/* Profile */}
        <div className="flex items-center ml-2 pl-2 border-l border-gray-200">
          <div className="h-8 w-8 rounded-full bg-[#2E7CE6] text-white flex items-center justify-center mr-2">
            <FaUser className="text-sm" />
          </div>
          <div className="mr-4 hidden md:block">
            <p className="text-sm font-medium text-gray-700">{admin?.username}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <Button
            variant="ghost"
            onClick={logout}
            className="text-gray-600 hover:text-gray-900 p-2"
          >
            <FaSignOutAlt />
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;