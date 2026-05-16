import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import SellerLayout from './pages/seller/SellerLayout';
import AdminLayout from './pages/admin/AdminLayout';

// Public Pages
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OTPLoginPage from './pages/OTPLoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import AdvancedSearchPage from './pages/AdvancedSearchPage';

// Customer Pages
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import WishlistPage from './pages/WishlistPage';
import NotificationsPage from './pages/NotificationsPage';
import ReviewsPage from './pages/ReviewsPage';

// Seller Pages
import SellerDashboard from './pages/seller/Dashboard';
import SellerRegistration from './pages/seller/SellerRegistration';
import SellerInventory from './pages/seller/Inventory';
import SellerOrders from './pages/seller/Orders';
import SellerMessages from './pages/seller/Messages';
import SellerDisputes from './pages/seller/Disputes';
import SellerReports from './pages/seller/Reports';
import SellerProducts from './pages/seller/Products';
import SellerAnalytics from './pages/seller/Analytics';
import SellerSettings from './pages/seller/Settings';
import AddProduct from './pages/seller/AddProduct';
import EditProduct from './pages/seller/EditProduct';
import SellerShipping from './pages/seller/SellerShipping';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminSellers from './pages/admin/Sellers';
import AdminCoupons from './pages/admin/Coupons';
import AdminBanners from './pages/admin/Banners';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminCommission from './pages/admin/Commission';
import AdminAuditLogs from './pages/admin/AuditLogs';
import AdminSettings from './pages/admin/Settings';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/search" element={<AdvancedSearchPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<OTPLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['customer', 'seller', 'admin']} />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/order-success/:id" element={<OrderSuccessPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
          </Route>

          {/* Seller Registration - Separate route */}
          <Route path="/seller/register" element={
            <ProtectedRoute>
              <SellerRegistration />
            </ProtectedRoute>
          } />

          {/* Seller Dashboard Routes - With SellerLayout */}
          <Route element={<ProtectedRoute allowedRoles={['seller', 'admin']} />}>
            <Route path="/seller" element={<SellerLayout />}>
              {/* Main Dashboard */}
              <Route index element={<SellerDashboard />} />
              <Route path="dashboard" element={<SellerDashboard />} />

              {/* Product Management */}
              <Route path="products" element={<SellerProducts />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/edit/:id" element={<EditProduct />} />

              {/* Inventory Management */}
              <Route path="inventory" element={<SellerInventory />} />

              {/* Order Management */}
              <Route path="orders" element={<SellerOrders />} />

              {/* Analytics & Reports */}
              <Route path="analytics" element={<SellerAnalytics />} />
              <Route path="reports" element={<SellerReports />} />

              {/* Communication */}
              <Route path="messages" element={<SellerMessages />} />
              <Route path="disputes" element={<SellerDisputes />} />
              
              <Route path="shipping" element={<SellerShipping />} />
              {/* Settings */}
              <Route path="settings" element={<SellerSettings />} />
            </Route>
          </Route>

          {/* Admin Dashboard Routes - With AdminLayout */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="sellers" element={<AdminSellers />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="commission" element={<AdminCommission />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* 404 Route - Always last */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;