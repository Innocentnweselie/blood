import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx';
import { useAuth } from './context/AuthContext.jsx';

// Main pages
import Home from './home-page/Home.jsx';
import Dashboard from './dashboard/Dashboard.jsx';
import Settings from './components/Settings.jsx';
import Supplier from './components/Suppliers.jsx';
import Categories from './components/Categories.jsx';
import Purchases from './components/Purchases.jsx';
import Report from './components/Report.jsx';
import Inventory from './components/Inventory.jsx';
import CreateItem from './components/CreateItem.jsx';
import EditItem from './components/EditItem.jsx';
import SalesTeam from './components/SalesTeam.jsx';
import SalesDashboard from './components/SalesDashboard.jsx';
import Reviews from './components/Reviews.jsx';
import PrivacyPolicy from './components/PrivacyPolicy.jsx';
import NotFound from './components/NotFound.jsx';

// Auth pages
import Login from './components/Login.jsx';
import SignUp from './components/Sign-up.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import Logout from './components/Logout.jsx';

// Info pages
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import Services from './components/Services.jsx';
// import { ThemeProvider } from './components/theme-provider.jsx';

const ThemedToastContainer = () => {
  const { theme } = useTheme();
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      limit={1}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme}
    />
  );
};

const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading || isAuthenticated) return;
    const redirectPath = `${location.pathname}${location.search}${location.hash}`;
    try {
      const toastKey = `authBlockToast:${redirectPath}`;
      if (!sessionStorage.getItem(toastKey)) {
        toast.error('Please log in to access this page.');
        sessionStorage.setItem(toastKey, '1');
      }
      sessionStorage.setItem('postLoginRedirect', redirectPath);
    } catch (err) {
      // ignore storage issues
    }
  }, [isAuthenticated, loading, location.pathname, location.search, location.hash]);

  if (loading) {
    return <div className="p-6">Checking session...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
};

const RoleRoute = ({ allow }) => {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useAuth();
  const role = user?.role || 'storekeeper';

  if (loading) {
    return <div className="p-6">Checking session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allow.includes(role)) {
    const isSalesRole = role === 'sales' || role === 'storekeeper';
    const fallback = isSalesRole ? '/sales-dashboard' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <ThemeProvider>
    <Router>
      {/* ToastContainer available globally for all CRUD notifications */}
      <ThemedToastContainer />
      {/* <ThemeProvider>
        
      </ThemeProvider> */}
      <Routes>
        {/* Main Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allow={['admin']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/suppliers" element={<Supplier />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/report" element={<Report />} />
          </Route>
          <Route element={<RoleRoute allow={['admin']} />}>
            <Route path="/settings" element={<Settings />} />
            <Route path="/create-item" element={<CreateItem />} />
            <Route path="/edit-item/:id" element={<EditItem />} />
            <Route path="/sales-team" element={<SalesTeam />} />
          </Route>
          <Route element={<RoleRoute allow={['sales', 'storekeeper']} />}>
            <Route path="/sales-dashboard" element={<SalesDashboard />} />
          </Route>
          <Route path="/logout" element={<Logout />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Info Pages */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services" element={<Services />} />

        {/* Add more routes for other components if needed */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;
