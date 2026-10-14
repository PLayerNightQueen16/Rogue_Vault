import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import MatrixRainBackground from './components/MatrixRainBackground';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Deals from "./pages/Deals";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import { CartProvider } from './context/CartContext';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        {/* Red Matrix Rain Background with Custom Discount & Sale Stream Tokens */}
        <MatrixRainBackground opacity={0.6} />

        {/* Main Application Shell with Centralized Navbar Content Offset */}
        <div className="relative z-10 min-h-screen flex flex-col bg-transparent text-white font-['Outfit',sans-serif]">
          <Navbar />

          <main className="flex-grow pt-32 sm:pt-36 flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
              <Route path="/orders" element={<Orders />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
