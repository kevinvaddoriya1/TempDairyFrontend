import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaBars,
  FaTimes,
  FaList,
  FaLayerGroup,
  FaUsers,
  FaBoxes,
  FaCalendarAlt,
  FaClipboardList,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaCog,
  FaExclamationTriangle
} from "react-icons/fa";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const mainMenuItems = [
    { icon: <FaHome />, label: "Dashboard", path: "/dashboard" },
  ];

  const sidebarVariants = {
    expanded: { width: "250px" },
    collapsed: { width: "80px" },
  };

  // Check if the current path matches or starts with the item path
  const isActive = (path) => {
    if (path === "/dashboard" && location.pathname === "/") {
      return true;
    }
    return location.pathname.startsWith(path);
  };


  return (
    <motion.div
      className="relative h-screen overflow-y-auto bg-white border-r border-gray-200 shadow-sm"
      initial={false}
      animate={collapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-end p-4 border-b border-gray-100">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-[#2E7CE6] transition-colors"
        >
          {collapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      <div className="px-3 mt-6">
        <p
          className={`text-xs font-medium text-gray-400 mb-4 uppercase tracking-wider ml-2 ${collapsed ? "opacity-0" : "opacity-100"
            } transition-opacity duration-300`} 
        >
          Main Menu
        </p>

        {mainMenuItems.map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            label={item.label}
            path={item.path}
            active={isActive(item.path)}
            collapsed={collapsed}
          />
        ))}

        {/* Customers Menu Item */}
        <Link to="/customers">
          <motion.div
            className={`flex items-center px-3 py-3 mb-1 rounded-lg cursor-pointer transition-colors ${location.pathname.startsWith("/customers")
              ? "bg-[#2E7CE6]/10 text-[#2E7CE6]"
              : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`text-xl ${location.pathname.startsWith("/customers")
                ? "text-[#2E7CE6]"
                : ""
                }`}
            >
              <FaUsers />
            </div>
            {!collapsed && (
              <motion.span
                className={`ml-4 font-medium text-sm ${location.pathname.startsWith("/customers")
                  ? "text-[#2E7CE6]"
                  : ""
                  }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                Customers
              </motion.span>
            )}
            {location.pathname.startsWith("/customers") && (
              <motion.div
                className="ml-auto h-2 w-2 rounded-full bg-[#2E7CE6]"
                layoutId="activeIndicator"
              ></motion.div>
            )}
          </motion.div>
        </Link>

        {/* Pending Amounts */}
        <Link to="/pending-amounts">
          <motion.div
            className={`flex items-center px-3 py-3 mb-1 rounded-lg cursor-pointer transition-colors ${location.pathname.startsWith("/pending-amounts")
              ? "bg-[#2E7CE6]/10 text-[#2E7CE6]"
              : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`text-xl ${location.pathname.startsWith("/pending-amounts")
                ? "text-[#2E7CE6]"
                : ""
                }`}
            >
              <FaExclamationTriangle />
            </div>
            {!collapsed && (
              <motion.span
                className={`ml-4 font-medium text-sm ${location.pathname.startsWith("/pending-amounts")
                  ? "text-[#2E7CE6]"
                  : ""
                  }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                Pending Amounts
              </motion.span>
            )}
            {location.pathname.startsWith("/pending-amounts") && (
              <motion.div
                className="ml-auto h-2 w-2 rounded-full bg-[#2E7CE6]"
                layoutId="activeIndicator"
              ></motion.div>
            )}
          </motion.div>
        </Link>

        {/* Milk Categories */}
        <Link to="/categories">
          <motion.div
            className={`flex items-center px-3 py-3 mb-1 rounded-lg cursor-pointer transition-colors ${location.pathname.startsWith("/categories")
              ? "bg-[#2E7CE6]/10 text-[#2E7CE6]"
              : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`text-xl ${location.pathname.startsWith("/categories")
                ? "text-[#2E7CE6]"
                : ""
                }`}
            >
              <FaList />
            </div>
            {!collapsed && (
              <motion.span
                className={`ml-4 font-medium text-sm ${location.pathname.startsWith("/categories")
                  ? "text-[#2E7CE6]"
                  : ""
                  }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                Milk Categories
              </motion.span>
            )}
            {location.pathname.startsWith("/categories") && (
              <motion.div
                className="ml-auto h-2 w-2 rounded-full bg-[#2E7CE6]"
                layoutId="activeIndicator"
              ></motion.div>
            )}
          </motion.div>
        </Link>

        {/* Subcategories Menu Item */}
        <Link to="/subcategories">
          <motion.div
            className={`flex items-center px-3 py-3 mb-1 rounded-lg cursor-pointer transition-colors ${location.pathname.startsWith("/subcategories")
              ? "bg-[#2E7CE6]/10 text-[#2E7CE6]"
              : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`text-xl ${location.pathname.startsWith("/subcategories")
                ? "text-[#2E7CE6]"
                : ""
                }`}
            >
              <FaLayerGroup />
            </div>
            {!collapsed && (
              <motion.span
                className={`ml-4 font-medium text-sm ${location.pathname.startsWith("/subcategories")
                  ? "text-[#2E7CE6]"
                  : ""
                  }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                Subcategories
              </motion.span>
            )}
            {location.pathname.startsWith("/subcategories") && (
              <motion.div
                className="ml-auto h-2 w-2 rounded-full bg-[#2E7CE6]"
                layoutId="activeIndicator"
              ></motion.div>
            )}
          </motion.div>
        </Link>
        {/* Stock Management Menu Item */}
        <Link to="/stock">
          <motion.div
            className={`flex items-center px-3 py-3 mb-1 rounded-lg cursor-pointer transition-colors ${location.pathname.startsWith("/stock")
              ? "bg-[#2E7CE6]/10 text-[#2E7CE6]"
              : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`text-xl ${location.pathname.startsWith("/stock") ? "text-[#2E7CE6]" : ""
                }`}
            >
              <FaBoxes />
            </div>
            {!collapsed && (
              <motion.span
                className={`ml-4 font-medium text-sm ${location.pathname.startsWith("/stock") ? "text-[#2E7CE6]" : ""
                  }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                Stock Management
              </motion.span>
            )}
            {location.pathname.startsWith("/stock") && (
              <motion.div
                className="ml-auto h-2 w-2 rounded-full bg-[#2E7CE6]"
                layoutId="activeIndicator"
              ></motion.div>
            )}
          </motion.div>
        </Link>

        {/* Holiday Management Menu Item */}
        <Link to="/holidays">
          <motion.div
            className={`flex items-center px-3 py-3 mb-1 rounded-lg cursor-pointer transition-colors ${location.pathname.startsWith("/holidays")
              ? "bg-[#2E7CE6]/10 text-[#2E7CE6]"
              : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`text-xl ${location.pathname.startsWith("/holidays") ? "text-[#2E7CE6]" : ""
                }`}
            >
              <FaCalendarAlt />
            </div>
            {!collapsed && (
              <motion.span
                className={`ml-4 font-medium text-sm ${location.pathname.startsWith("/holidays") ? "text-[#2E7CE6]" : ""
                  }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                Holiday Management
              </motion.span>
            )}
            {location.pathname.startsWith("/holidays") && (
              <motion.div
                className="ml-auto h-2 w-2 rounded-full bg-[#2E7CE6]"
                layoutId="activeIndicator"
              ></motion.div>
            )}
          </motion.div>
        </Link>

        {/* Records Menu Item */}
        <Link to="/records">
          <motion.div
            className={`flex items-center px-3 py-3 mb-1 rounded-lg cursor-pointer transition-colors ${location.pathname.startsWith("/records")
              ? "bg-[#2E7CE6]/10 text-[#2E7CE6]"
              : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`text-xl ${location.pathname.startsWith("/records") ? "text-[#2E7CE6]" : ""
                }`}
            >
              <FaClipboardList />
            </div>
            {!collapsed && (
              <motion.span
                className={`ml-4 font-medium text-sm ${location.pathname.startsWith("/records") ? "text-[#2E7CE6]" : ""
                  }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                Records
              </motion.span>
            )}
            {location.pathname.startsWith("/records") && (
              <motion.div
                className="ml-auto h-2 w-2 rounded-full bg-[#2E7CE6]"
                layoutId="activeIndicator"
              ></motion.div>
            )}
          </motion.div>
        </Link>

        {/* Invoices Menu Item */}
        <Link to="/invoices">
          <motion.div
            className={`flex items-center px-3 py-3 mb-1 rounded-lg cursor-pointer transition-colors ${location.pathname.startsWith("/invoices")
              ? "bg-[#2E7CE6]/10 text-[#2E7CE6]"
              : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`text-xl ${location.pathname.startsWith("/invoices") ? "text-[#2E7CE6]" : ""
                }`}
            >
              <FaFileInvoiceDollar />
            </div>
            {!collapsed && (
              <motion.span
                className={`ml-4 font-medium text-sm ${location.pathname.startsWith("/invoices") ? "text-[#2E7CE6]" : ""
                  }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                Invoices
              </motion.span>
            )}
            {location.pathname.startsWith("/invoices") && (
              <motion.div
                className="ml-auto h-2 w-2 rounded-full bg-[#2E7CE6]"
                layoutId="activeIndicator"
              ></motion.div>
            )}
          </motion.div>
        </Link>

        {/* Advance Payments Menu Item */}
        <Link to="/advance-payments">
          <motion.div
            className={`flex items-center px-3 py-3 mb-1 rounded-lg cursor-pointer transition-colors ${location.pathname.startsWith("/advance-payments")
              ? "bg-[#2E7CE6]/10 text-[#2E7CE6]"
              : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`text-xl ${location.pathname.startsWith("/advance-payments") ? "text-[#2E7CE6]" : ""
                }`}
            >
              <FaMoneyBillWave />
            </div>
            {!collapsed && (
              <motion.span
                className={`ml-4 font-medium text-sm ${location.pathname.startsWith("/advance-payments") ? "text-[#2E7CE6]" : ""
                  }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                Advance Payments
              </motion.span>
            )}
            {location.pathname.startsWith("/advance-payments") && (
              <motion.div
                className="ml-auto h-2 w-2 rounded-full bg-[#2E7CE6]"
                layoutId="activeIndicator"
              ></motion.div>
            )}
          </motion.div>
        </Link>

        {/* System Configuration Menu Item */}
        <Link to="/system-config">
          <motion.div
            className={`flex items-center px-3 py-3 mb-1 rounded-lg cursor-pointer transition-colors ${location.pathname.startsWith("/system-config")
              ? "bg-[#2E7CE6]/10 text-[#2E7CE6]"
              : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`text-xl ${location.pathname.startsWith("/system-config") ? "text-[#2E7CE6]" : ""
                }`}
            >
              <FaCog />
            </div>
            {!collapsed && (
              <motion.span
                className={`ml-4 font-medium text-sm ${location.pathname.startsWith("/system-config") ? "text-[#2E7CE6]" : ""
                  }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                System Configuration
              </motion.span>
            )}
            {location.pathname.startsWith("/system-config") && (
              <motion.div
                className="ml-auto h-2 w-2 rounded-full bg-[#2E7CE6]"
                layoutId="activeIndicator"
              ></motion.div>
            )}
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
};

const SidebarItem = ({ icon, label, path, active, collapsed }) => {
  return (
    <Link to={path}>
      <motion.div
        className={`flex items-center px-3 py-3 mb-1 rounded-lg cursor-pointer transition-colors ${active
          ? "bg-[#2E7CE6]/10 text-[#2E7CE6]"
          : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
          }`}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
      >
        <div className={`text-xl ${active ? "text-[#2E7CE6]" : ""}`}>
          {icon}
        </div>
        {!collapsed && (
          <motion.span
            className={`ml-4 font-medium text-sm ${active ? "text-[#2E7CE6]" : ""
              }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.span>
        )}
        {active && (
          <motion.div
            className="ml-auto h-2 w-2 rounded-full bg-[#2E7CE6]"
            layoutId="activeIndicator"
          ></motion.div>
        )}
      </motion.div>
    </Link>
  );
};

export default Sidebar;
