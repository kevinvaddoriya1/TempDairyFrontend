import { createContext, useState, useEffect } from 'react';
import { login as loginApi } from '../services/api';
import { secureStorage } from '../utils/encryption';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in - using encrypted storage
    const adminFromStorage = secureStorage.getItem('adminInfo');

    setAdmin(adminFromStorage);
    setLoading(false);
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      // setLoading(true);
      const data = await loginApi(username, password);

      // Filter out _id before storing
      const { _id, ...adminData } = data;

      // Save to encrypted localStorage (without _id)
      const stored = secureStorage.setItem('adminInfo', adminData);

      if (stored) {
        setAdmin(adminData);
        return { success: true };
      } else {
        throw new Error('Failed to store authentication data');
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    secureStorage.removeItem('adminInfo');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;