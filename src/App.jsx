import React, { lazy, Suspense, useEffect, useRef } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store';
import { getCurrentUser } from './store/slices/authSlice';
import { fetchCart } from './store/slices/cartSlice';
import Cookies from 'js-cookie';
import { HelmetProvider } from 'react-helmet-async';
import ReactGA from 'react-ga4';

import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import TopBar from './components/TopOffersBar';
import Navbar from './components/Navbar';;
import Footer from './components/Footer';
import ProductsPage from './pages/ProductsPage';
import ProtectedRoute from './components/admin/ProtectedRoute';
import { MaintenanceGuard } from './components/MaintenanceGuard';
import PageTracker from './components/PageTracker';
import ScrollToTop from './components/ScrollToTop';
import ForgotPassword from './pages/ForgotPassword';
import VerifyResetOTP from './pages/VerifyResetOTP';
import ResetPassword from './pages/ResetPassword';

import AdminLayout from './pages/admin/AdminLayout';        
import AdminDashboard from './pages/admin/AdminDashboard'; 
import AdminProducts from './pages/admin/Products'; 
import ProductDetail from './components/admin/products/ProductDetail';
import ProductForm from './components/admin/products/ProductForm'; 
import AdminCategories from './pages/admin/Categories'
import CategoryDetail from './components/admin/categories/CategoryDetail';
import CategoryForm from './components/admin/categories/CategoryForm';
import AdminOrders from './pages/admin/Orders'
import OrderDetail from './components/admin/orders/OrderDetail';
import OrderForm from './components/admin/orders/OrderForm';
import AdminCustomDesigns from './pages/admin/CustomProducts'

import AdminUsers from './pages/admin/Users'
import AdminAnalytics from './pages/admin/Analytics'
import AdminBroadcast from './pages/admin/AdminBroadcast';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import UserProfile from './pages/UserProfile';
import AdminProfile from './pages/admin/AdminProfile';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminBanners from './pages/admin/AdminBanners';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminContacts from './pages/admin/AdminContacts';

import OrderPrint from './components/admin/orders/OrderPrint';
import CustomProductForm from './components/admin/customization/CustomProductForm';
import CustomProductDetail from './components/admin/customization/CustomProductDetail';
import BroadcastForm from './components/admin/broadcast/BroadcastForm';
import { usePushNotifications, useRemovePushToken } from './hooks/usePushNotifications';

// ─── USER DASHBOARD IMPORTS ────────────────────────
import UserDashboard from './pages/UserDashboard';
import Overview from './pages/dashboard/Overview';
import DashboardOrders from './pages/UserOrders'; // use existing or new
import DashboardOrderDetail from './pages/OrderDetail'; // use existing or new
import Addresses from './pages/dashboard/Addresses';
import Wishlist from './pages/WishlistPage';
import Profile from './pages/dashboard/Profile';
import TrackOrder from './pages/dashboard/TrackOrder';
import ChangePassword from './pages/dashboard/ChangePassword';
import Coupons from './pages/dashboard/Coupons';
import Notifications from './pages/dashboard/Notifications';
import Support from './pages/dashboard/Support';
import Maintenance from './pages/Maintenance';


// Lazy load pages
import Home from './pages/Home';
const CustomizePage = lazy(() => import('./pages/CustomizePage'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/signup'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetails'));
const CartPage = lazy(() => import('./pages/CartPage'));
const Checkout  = lazy(() => import('./pages/Checkout'));
const OrderSuccess  = lazy(() => import('./pages/OrderSuccess'));


// ─── Google Analytics Setup ──────────────────────────────
const GA4_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (GA4_ID && GA4_ID !== 'YOUR_GA_ID' && GA4_ID !== '') {
  ReactGA.initialize(GA4_ID);
  console.log('✅ Google Analytics initialized');
} else {
  console.log('ℹ️ Google Analytics ID not provided. Tracking disabled.');
}


// Layout components
const PublicLayout = () => (
  <>
    <ScrollToTop />
    <PageTracker />
    <TopBar />
    <Navbar />
    <Outlet />
    <Footer />
  </>
);

const AuthLayout = () => (
  <div className="min-h-screen">
    <ScrollToTop />
    <PageTracker />
    <Navbar />
    <Outlet />
    <Footer />
  </div>
);

const LazyComponent = ({ Component }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  // ─── MAINTENANCE (Standalone, No Layout) ──────────
  {
    path: "/maintenance",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Maintenance />
      </Suspense>
    ),
  },
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/customize/:productId?",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CustomizePage />
          </Suspense>
        ),
      },
      {
        path: "/allproducts",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProductsPage />
          </Suspense>
        ),
      },
      {
        path: "/product/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProductDetailPage />
          </Suspense>
        ),
      },
      {
        path: "/cart",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CartPage />
          </Suspense>
        ),
      },
      {
        path: "/about",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AboutUs />
          </Suspense>
        ),
      },
      {
        path: "/contact",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Contact />
          </Suspense>
        ),
      },
      { path: "/track/order/:id", element: <TrackOrder /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "/signup",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Signup />
          </Suspense>
        ),
      },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/verify-reset-otp", element: <VerifyResetOTP /> },
      { path: "/reset-password", element: <ResetPassword /> },
    ],
  },

  {
    element: <ProtectedRoute allowedRoles={["user", "admin"]} />,
    children: [
      // Checkout & Order Success (standalone pages)
      {
        path: "/checkout",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Checkout />
          </Suspense>
        ),
      },
      {
        path: "/order-success/:orderId",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <OrderSuccess />
          </Suspense>
        ),
      },
      // ── USER DASHBOARD ROUTES (authenticated) ──
      {
        element: <UserDashboard />,
        children: [
          {
            path: "/dashboard",
            element: <Navigate to="/dashboard/overview" replace />,
          },
          { path: "/dashboard/overview", element: <Overview /> },
          { path: "/dashboard/orders", element: <DashboardOrders /> },
          {
            path: "/dashboard/orders/:orderId",
            element: <DashboardOrderDetail />,
          },
          { path: "/dashboard/addresses", element: <Addresses /> },
          { path: "/dashboard/wishlist", element: <Wishlist /> },
          { path: "/dashboard/profile", element: <Profile /> },
          { path: "/dashboard/password", element: <ChangePassword /> },
          { path: "/dashboard/track/:orderNumber", element: <TrackOrder /> },
          { path: "/dashboard/coupons", element: <Coupons /> },
          { path: "/dashboard/notifications", element: <Notifications /> },
          { path: "/dashboard/support", element: <Support /> },
        ],
      },
    ],
  },

  // Admin routes – protected by role check
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      { path: "/admin/orders/:id/print/:type", element: <OrderPrint /> },
      { path: "/admin/orders/:id/print", element: <OrderPrint /> },
      {
        element: <AdminLayout />,
        children: [
          {
            path: "/admin",
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: "/admin/profile",
            element: (
              <Suspense>
                <AdminProfile />
              </Suspense>
            ),
          },
          {
            path: "/admin/dashboard",
            element: <LazyComponent Component={AdminDashboard} />,
          },
          {
            path: "/admin/products",
            element: <LazyComponent Component={AdminProducts} />,
          },
          { path: "/admin/products/add", element: <ProductForm /> },
          { path: "/admin/products/:id", element: <ProductDetail /> },
          { path: "/admin/products/:id/edit", element: <ProductForm /> },
          {
            path: "/admin/categories",
            element: <LazyComponent Component={AdminCategories} />,
          },
          { path: "/admin/categories/add", element: <CategoryForm /> },
          { path: "/admin/categories/:id", element: <CategoryDetail /> },
          { path: "/admin/categories/:id/edit", element: <CategoryForm /> },
          {
            path: "/admin/orders",
            element: <LazyComponent Component={AdminOrders} />,
          },
          {
            path: "/admin/orders/add",
            element: <LazyComponent Component={OrderForm} />,
          },
          { path: "/admin/orders/:id", element: <OrderDetail /> },
          { path: "/admin/orders/:id/edit", element: <OrderForm /> },
          {
            path: "/admin/custom-products",
            element: <LazyComponent Component={AdminCustomDesigns} />,
          },
          {
            path: "/admin/custom-products/add",
            element: <CustomProductForm />,
          },
          {
            path: "/admin/custom-products/:id",
            element: <CustomProductDetail />,
          },
          {
            path: "/admin/custom-products/:id/edit",
            element: <CustomProductForm />,
          },
          {
            path: "/admin/users",
            element: <LazyComponent Component={AdminUsers} />,
          },
          {
            path: "/admin/analytics",
            element: <LazyComponent Component={AdminAnalytics} />,
          },
          {
            path: "/admin/broadcast",
            element: <LazyComponent Component={AdminBroadcast} />,
          },
          { path: "/admin/broadcast/create", element: <BroadcastForm /> },
          { path: "/admin/broadcast/:id/edit", element: <BroadcastForm /> },
          {
            path: "/admin/coupons",
            element: <LazyComponent Component={AdminCoupons} />,
          },
          {
            path: "/admin/banners",
            element: <LazyComponent Component={AdminBanners} />,
          },
          {
            path: "/admin/reviews",
            element: <LazyComponent Component={AdminReviews} />,
          },
          {
            path: "/admin/settings",
            element: <LazyComponent Component={AdminSettings} />,
          },
          {
            path: "/admin/notifications",
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <AdminNotifications />
              </Suspense>
            ),
          },
          {
            path: "/admin/contacts",
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <AdminContacts />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  // 404 fallback (optional)
  // { path: '*', element: <NotFound /> },
]);


// ─── App Wrapper ──────────────────────────────────
const AppContent = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const hasCalled = useRef(false);
  
  useEffect(() => {
    if (!hasCalled.current) {
      hasCalled.current = true;
      dispatch(getCurrentUser());
    }
  }, [dispatch]);
  
   useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, user, dispatch]);

    usePushNotifications();
    useRemovePushToken();

  return <RouterProvider router={router} />;
};


function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <MaintenanceGuard>
          <HelmetProvider>
            <AppContent />
          </HelmetProvider>
        </MaintenanceGuard>
        <Toaster position="top-right" />
      </Provider>
    </ErrorBoundary>
  );
}

export default App;