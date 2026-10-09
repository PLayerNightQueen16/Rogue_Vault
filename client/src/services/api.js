import { axiosInstance } from '../axiosCalls/axios';

// Product APIs
export const fetchProducts = async ({ search = '', category = '' } = {}) => {
  const params = {};
  if (search && search.trim() !== '') {
    params.search = search.trim();
  }
  if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
    params.category = category.trim();
  }
  const response = await axiosInstance.get('/products', { params });
  return response.data;
};

export const fetchProductById = async (id) => {
  const response = await axiosInstance.get(`/products/${id}`);
  return response.data;
};

// Customer Auth APIs
export const getCurrentCustomer = async () => {
  const response = await axiosInstance.get('/customers/me');
  return response.data;
};

export const loginCustomer = async (credentials) => {
  const response = await axiosInstance.post('/customers/login', credentials);
  return response.data;
};

export const registerCustomer = async (userData) => {
  const response = await axiosInstance.post('/customers/register', userData);
  return response.data;
};

export const logoutCustomer = async () => {
  const response = await axiosInstance.post('/customers/logout');
  return response.data;
};

// Wishlist APIs
export const fetchWishlist = async () => {
  const response = await axiosInstance.get('/wishlist');
  return response.data;
};

export const addToWishlist = async (productId) => {
  const response = await axiosInstance.post(`/wishlist/${productId}`);
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await axiosInstance.delete(`/wishlist/${productId}`);
  return response.data;
};

export const toggleWishlistApi = async (productId) => {
  const response = await axiosInstance.patch(`/wishlist/${productId}/toggle`);
  return response.data;
};

// Cart APIs
export const fetchCart = async () => {
  const response = await axiosInstance.get('/cart');
  return response.data;
};

export const addToCartApi = async (productId) => {
  const response = await axiosInstance.post(`/cart/${productId}`);
  return response.data;
};

export const updateCartQuantityApi = async (productId, quantity) => {
  const response = await axiosInstance.patch(`/cart/${productId}`, { quantity });
  return response.data;
};

export const removeFromCartApi = async (productId) => {
  const response = await axiosInstance.delete(`/cart/${productId}`);
  return response.data;
};

// Order & Payment APIs
export const createPaymentOrderApi = async (shippingAddress) => {
  const response = await axiosInstance.post('/orders/create-payment-order', {
    shippingAddress
  });
  return response.data;
};

export const verifyPaymentApi = async (paymentData) => {
  const response = await axiosInstance.post('/orders/verify-payment', paymentData);
  return response.data;
};

export const fetchOrdersApi = async () => {
  const response = await axiosInstance.get('/orders');
  return response.data;
};

export const fetchOrderByIdApi = async (id) => {
  const response = await axiosInstance.get(`/orders/${id}`);
  return response.data;
};

