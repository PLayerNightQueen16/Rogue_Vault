import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import {
  fetchCart,
  addToCartApi,
  updateCartQuantityApi,
  removeFromCartApi
} from '../services/api';

const CART_STORAGE_KEY = 'shopkart_cart_cache';

const initialState = {
  items: (() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })(),
  loading: false,
  error: null
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, items: action.payload, error: null };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'SET_ITEMS':
      return { ...state, items: action.payload, error: null };
    case 'CLEAR_CART':
      return { ...state, items: [], loading: false, error: null };
    default:
      return state;
  }
};

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Sync to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch (e) {
      console.error('Failed to persist cart to localStorage', e);
    }
  }, [state.items]);

  // Fetch cart from backend
  const loadCart = useCallback(async () => {
    try {
      dispatch({ type: 'FETCH_START' });
      const data = await fetchCart();
      if (data && Array.isArray(data.cart)) {
        dispatch({ type: 'FETCH_SUCCESS', payload: data.cart });
      } else {
        dispatch({ type: 'FETCH_SUCCESS', payload: [] });
      }
    } catch (err) {
      // If 401 unauthenticated, keep local empty or cached without hard error
      if (err?.response?.status === 401) {
        dispatch({ type: 'FETCH_SUCCESS', payload: [] });
      } else {
        dispatch({
          type: 'FETCH_FAILURE',
          payload: err?.response?.data?.message || 'Unable to load your cart.'
        });
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Add product to cart
  const addToCart = useCallback(async (productId) => {
    try {
      const data = await addToCartApi(productId);
      if (data && Array.isArray(data.cart)) {
        dispatch({ type: 'SET_ITEMS', payload: data.cart });
        return data;
      }
      await loadCart();
      return data;
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Failed to add product to cart';
      throw new Error(errMsg);
    }
  }, [loadCart]);

  // Update item quantity
  const updateQuantity = useCallback(async (productId, quantity) => {
    try {
      const data = await updateCartQuantityApi(productId, quantity);
      if (data && Array.isArray(data.cart)) {
        dispatch({ type: 'SET_ITEMS', payload: data.cart });
        return data;
      }
      await loadCart();
      return data;
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Failed to update item quantity';
      throw new Error(errMsg);
    }
  }, [loadCart]);

  // Remove item from cart
  const removeFromCart = useCallback(async (productId) => {
    try {
      const data = await removeFromCartApi(productId);
      if (data && Array.isArray(data.cart)) {
        dispatch({ type: 'SET_ITEMS', payload: data.cart });
        return data;
      }
      await loadCart();
      return data;
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Failed to remove item from cart';
      throw new Error(errMsg);
    }
  }, [loadCart]);

  // Clear cart on backend confirmation
  const clearCart = useCallback(() => {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  // Derived totals
  const totalUnits = useMemo(() => {
    return (state.items || []).reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  }, [state.items]);

  const subtotal = useMemo(() => {
    return (state.items || []).reduce((acc, item) => {
      const price = typeof item.product?.price === 'number' ? item.product.price : 0;
      const qty = Number(item.quantity) || 0;
      return acc + (price * qty);
    }, 0);
  }, [state.items]);

  const value = useMemo(
    () => ({
      cart: state.items,
      loading: state.loading,
      error: state.error,
      totalUnits,
      subtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      fetchCart: loadCart
    }),
    [state.items, state.loading, state.error, totalUnits, subtotal, addToCart, updateQuantity, removeFromCart, clearCart, loadCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
