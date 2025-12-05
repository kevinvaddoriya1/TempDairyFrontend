import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import { LoadingSpinner } from './components';
import DashboardHeader from './components/Dashboard/DashboardHeader';
import Sidebar from './components/Dashboard/Sidebar';

// Category and Subcategory Components
import CategoryList from './pages/CategoryList';
import CategoryForm from './pages/CategoryForm';
import SubcategoryList from './pages/SubcategoriesPage';
import CustomersPage from './pages/CustomersPage';
import CustomerForm from './pages/CustomerForm';
import CustomerDetail from './pages/CustomerDetail';
import StockManagement from './pages/StockManagement';
import HolidayManagement from './pages/HolidayManagement';
import RecordsPage from './pages/RecordsPage';
import InvoicesPage from './pages/InvoicesPage';
import GenerateInvoice from './pages/GenerateInvoice';
import InvoiceDetail from './pages/InvoiceDetail';
import AddPayment from './pages/AddPayment';
import AdvancePayments from './pages/AdvancePayments';
import SystemConfiguration from './pages/SystemConfiguration';
import PendingAmounts from './pages/PendingAmounts';

// Layout Component to include Sidebar and Header
const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public route component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes with DashboardLayout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Category Routes */}
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CategoryList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories/create"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CategoryForm />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories/edit/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CategoryForm />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />


        {/* Subcategory Routes */}
        <Route
          path="/subcategories"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SubcategoryList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Customer Routes */}
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CustomersPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/create"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CustomerForm />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/edit/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CustomerForm />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/view/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CustomerDetail />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <StockManagement />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/holidays"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <HolidayManagement />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Records Route */}
        <Route
          path="/records"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <RecordsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Pending Amounts Route */}
        <Route
          path="/pending-amounts"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PendingAmounts />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Invoice Routes */}
        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <InvoicesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/generate"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <GenerateInvoice />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/view/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <InvoiceDetail />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/payment/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AddPayment />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Advance Payments Route */}
        <Route
          path="/advance-payments"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AdvancePayments />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* System Configuration Route */}
        <Route
          path="/system-config"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SystemConfiguration />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
