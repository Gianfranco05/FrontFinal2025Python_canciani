import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { CartProvider } from './context/CartContext';

// Layouts
import { StoreLayout } from './layouts/StoreLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Store Pages
import { Home } from './pages/store/Home';
import { Shop } from './pages/store/Shop';
import { ProductDetail } from './pages/store/ProductDetail';
import { Cart } from './pages/store/Cart';
import { Checkout } from './pages/store/Checkout';
import { Profile } from './pages/store/Profile';

// Admin Pages
import { Dashboard } from './pages/admin/Dashboard';
import { Products } from './pages/admin/Products';
import { Categories } from './pages/admin/Categories';
import { Clients } from './pages/admin/Clients';
import { Addresses } from './pages/admin/Addresses';
import { Orders } from './pages/admin/Orders';
import { OrderDetails } from './pages/admin/OrderDetails';
import { Bills } from './pages/admin/Bills';
import { Reviews } from './pages/admin/Reviews';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Router>
          <Routes>
            {/* Store Routes */}
            <Route path="/" element={<StoreLayout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="shop/:id" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="clients" element={<Clients />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:orderId/items" element={<OrderDetails />} />
              <Route path="bills" element={<Bills />} />
              <Route path="reviews" element={<Reviews />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
