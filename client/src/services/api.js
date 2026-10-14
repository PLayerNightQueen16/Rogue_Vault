import { axiosInstance } from '../axiosCalls/axios.js';
import { CATEGORY_GROUPS, DUMMY_CATEGORIES } from '../constants/categories.js';

// Transform DummyJSON product into normalized application model
export const transformProduct = (item) => {
  if (!item) return null;
  const pId = item.id !== undefined && item.id !== null ? item.id.toString() : (item._id || '');
  const numericId = typeof item.id === 'number' ? item.id : parseInt(pId, 10) || item._id;
  const priceVal = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
  const discountVal = typeof item.discountPercentage === 'number' && item.discountPercentage > 0
    ? item.discountPercentage
    : (typeof item.discount === 'number' && item.discount > 0 ? item.discount : 0);

  const origPriceVal = typeof item.originalPrice === 'number' && item.originalPrice > priceVal
    ? item.originalPrice
    : (discountVal > 0 && priceVal > 0
        ? Math.round(priceVal / (1 - (discountVal / 100)))
        : null);

  const mainImage = item.thumbnail || (Array.isArray(item.images) && item.images[0]) || item.image || '';
  const imagesList = Array.isArray(item.images) && item.images.length > 0 ? item.images : (mainImage ? [mainImage] : []);

  return {
    _id: pId,
    id: numericId,
    name: item.title || item.name || 'Untitled Product',
    title: item.title || item.name || 'Untitled Product',
    description: item.description || '',
    price: priceVal,
    category: (item.category || 'general').toLowerCase(),
    image: mainImage,
    thumbnail: item.thumbnail || mainImage,
    images: imagesList,
    stock: typeof item.stock === 'number' ? item.stock : 45,
    rating: typeof item.rating === 'number' ? item.rating : 4.5,
    discountPercentage: discountVal,
    discount: discountVal > 0 ? `-${Math.round(discountVal)}%` : '',
    originalPrice: origPriceVal,
    brand: item.brand || 'Vault Exclusive',
    sku: item.sku || `VK-${numericId}`,
    warrantyInformation: item.warrantyInformation || '1 year official vault warranty',
    shippingInformation: item.shippingInformation || 'Ships in 2-4 business days',
    availabilityStatus: item.availabilityStatus || (item.stock > 0 ? 'In Stock' : 'Limited Vault Stock'),
    returnPolicy: item.returnPolicy || '30 days hassle-free return policy',
    reviews: Array.isArray(item.reviews) ? item.reviews : []
  };
};

// Product APIs powered by https://dummyjson.com/products
export const fetchProducts = async ({ search = '', category = '' } = {}) => {
  try {
    const rawCat = category ? category.trim() : '';
    const trimmedCat = rawCat.toLowerCase() !== 'all' ? rawCat : '';
    const trimmedSearch = search ? search.trim().toLowerCase() : '';

    // Check if category is a main group name
    let mainGroupKey = null;
    if (trimmedCat) {
      if (CATEGORY_GROUPS[trimmedCat]) {
        mainGroupKey = trimmedCat;
      } else {
        const matched = Object.keys(CATEGORY_GROUPS).find(
          (key) => key.toLowerCase() === trimmedCat.toLowerCase()
        );
        if (matched && !DUMMY_CATEGORIES.includes(trimmedCat.toLowerCase())) {
          mainGroupKey = matched;
        }
      }
    }

    let url = 'https://dummyjson.com/products?limit=0';
    if (mainGroupKey) {
      url = 'https://dummyjson.com/products?limit=0';
    } else if (trimmedCat) {
      url = `https://dummyjson.com/products/category/${encodeURIComponent(trimmedCat.toLowerCase())}?limit=0`;
    } else if (trimmedSearch) {
      url = `https://dummyjson.com/products/search?q=${encodeURIComponent(trimmedSearch)}&limit=0`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`DummyJSON HTTP error: ${response.status}`);
    }

    const data = await response.json();
    let products = (data.products || []).map(transformProduct);

    // If main group, filter by its mapped subcategories
    if (mainGroupKey) {
      const allowedSubcategories = CATEGORY_GROUPS[mainGroupKey].map((s) => s.toLowerCase());
      products = products.filter((p) =>
        allowedSubcategories.includes((p.category || '').toLowerCase())
      );
    }

    // If search term was supplied, refine results client-side
    if (trimmedSearch) {
      products = products.filter((p) => {
        const titleMatch = (p.name || '').toLowerCase().includes(trimmedSearch);
        const descMatch = (p.description || '').toLowerCase().includes(trimmedSearch);
        const brandMatch = (p.brand || '').toLowerCase().includes(trimmedSearch);
        return titleMatch || descMatch || brandMatch;
      });
    }

    return {
      success: true,
      message: 'Products found',
      products,
      count: products.length,
      total: products.length
    };
  } catch (err) {
    console.warn('Direct fetch from dummyjson.com failed, attempting server fallback:', err);
    // Graceful fallback to backend /products in case of client network restrictions
    const params = {};
    if (search && search.trim() !== '') params.search = search.trim();

    const rawCat = category ? category.trim() : '';
    const trimmedCat = rawCat.toLowerCase() !== 'all' ? rawCat : '';
    let mainGroupKey = null;
    if (trimmedCat) {
      if (CATEGORY_GROUPS[trimmedCat]) {
        mainGroupKey = trimmedCat;
      } else {
        const matched = Object.keys(CATEGORY_GROUPS).find(
          (key) => key.toLowerCase() === trimmedCat.toLowerCase()
        );
        if (matched && !DUMMY_CATEGORIES.includes(trimmedCat.toLowerCase())) {
          mainGroupKey = matched;
        }
      }
    }

    if (trimmedCat && !mainGroupKey) {
      params.category = trimmedCat;
    }

    const response = await axiosInstance.get('/products', { params });
    let products = (response.data.products || []).map(transformProduct);

    if (mainGroupKey) {
      const allowedSubcategories = CATEGORY_GROUPS[mainGroupKey].map((s) => s.toLowerCase());
      products = products.filter((p) =>
        allowedSubcategories.includes((p.category || '').toLowerCase())
      );
    }

    return { ...response.data, products };
  }
};

export const fetchProductById = async (id) => {
  try {
    const response = await fetch(`https://dummyjson.com/products/${id}`);
    if (!response.ok) {
      throw new Error(`Product not found: ${response.status}`);
    }
    const data = await response.json();
    const transformed = transformProduct(data);
    return {
      success: true,
      message: 'Product Found!!',
      product: transformed,
      ...transformed
    };
  } catch (err) {
    console.warn(`Direct fetch from dummyjson.com for product ${id} failed, attempting server fallback:`, err);
    const response = await axiosInstance.get(`/products/${id}`);
    const product = transformProduct(response.data.product || response.data);
    return {
      ...response.data,
      product,
      ...product
    };
  }
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

export const addToCartApi = async (productId, quantity = 1) => {
  const response = await axiosInstance.post(`/cart/${productId}`, { quantity });
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

