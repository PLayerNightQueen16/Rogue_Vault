import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useState } from 'react';
import {
  fetchCart,
  addToCartApi,
  updateCartQuantityApi,
  removeFromCartApi
} from '../services/api';
import AuthRequiredModal from '../components/AuthRequiredModal';

const CART_STORAGE_KEY = 'shopkart_cart_cache';

const initialState = {
  items: [],
  loading: false,
  error: null,
  isAuthError: false
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, items: action.payload, error: null, isAuthError: false };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: action.payload, isAuthError: false };
    case 'AUTH_ERROR':
      return { ...state, loading: false, items: [], error: action.payload, isAuthError: true };
    case 'SET_ITEMS':
      return { ...state, items: action.payload, error: null, isAuthError: false };
    case 'CLEAR_CART':
      return { ...state, items: [], loading: false, error: null, isAuthError: false };
    default:
      return state;
  }
};

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    message: ''
  });

  // Clean up any stale unauthenticated guest cache on initialization
  useEffect(() => {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }, []);

  const openAuthPrompt = useCallback((message = 'Please log in to your account to add items to your shopping cart.') => {
    setAuthModal({
      isOpen: true,
      message
    });
  }, []);

  const closeAuthPrompt = useCallback(() => {
    setAuthModal({
      isOpen: false,
      message: ''
    });
  }, []);

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
      if (err?.response?.status === 401) {
        dispatch({
          type: 'AUTH_ERROR',
          payload: 'Please sign in to view and manage your shopping cart.'
        });
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

  // Add product to cart with backend authentication enforcement
  const addToCart = useCallback(async (productOrId, quantity = 1) => {
    const isObject = typeof productOrId === 'object' && productOrId !== null;
    const productId = isObject ? (productOrId._id || productOrId.id) : productOrId;

    if (!productId) {
      throw new Error('Product ID is required');
    }

    try {
      const data = await addToCartApi(productId, quantity);
      if (data && Array.isArray(data.cart)) {
        dispatch({ type: 'SET_ITEMS', payload: data.cart });
        return data;
      }
      await loadCart();
      return data;
    } catch (err) {
      if (err?.response?.status === 401) {
        // Mark auth error in state
        dispatch({
          type: 'AUTH_ERROR',
          payload: 'Please sign in to add items to your shopping cart.'
        });

        // Preserve intended action so user can optionally complete after logging in
        try {
          sessionStorage.setItem('rouge_pending_cart_item', JSON.stringify({
            productId,
            product: isObject ? productOrId : null,
            quantity: quantity || 1,
            returnUrl: window.location.pathname + window.location.search
          }));
        } catch (storageErr) {
          console.warn('Failed to store pending cart item:', storageErr);
        }

        // Trigger authentication-required prompt consistent with Wishlist design
        openAuthPrompt('Please log in to your account to add items to your shopping cart.');

        const authError = new Error('Please log in to add items to your cart.');
        authError.isAuth = true;
        authError.status = 401;
        throw authError;
      }

      // Non-auth error (e.g. stock limit, server error)
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to add item to cart.';
      dispatch({ type: 'FETCH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, [loadCart, openAuthPrompt]);

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
      if (err?.response?.status === 401) {
        dispatch({
          type: 'AUTH_ERROR',
          payload: 'Please sign in to manage your shopping cart.'
        });
        openAuthPrompt('Please log in to your account to manage your shopping cart.');
        const authError = new Error('Authentication required');
        authError.isAuth = true;
        authError.status = 401;
        throw authError;
      }
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to update quantity.';
      throw new Error(errorMessage);
    }
  }, [loadCart, openAuthPrompt]);

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
      if (err?.response?.status === 401) {
        dispatch({
          type: 'AUTH_ERROR',
          payload: 'Please sign in to manage your shopping cart.'
        });
        openAuthPrompt('Please log in to your account to manage your shopping cart.');
        const authError = new Error('Authentication required');
        authError.isAuth = true;
        authError.status = 401;
        throw authError;
      }
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to remove item from cart.';
      throw new Error(errorMessage);
    }
  }, [loadCart, openAuthPrompt]);

  // Clear cart on backend confirmation or logout
  const clearCart = useCallback(() => {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      sessionStorage.removeItem('rouge_pending_cart_item');
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
      isAuthError: state.isAuthError,
      authPromptOpen: authModal.isOpen,
      totalUnits,
      subtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      fetchCart: loadCart,
      openAuthPrompt,
      closeAuthPrompt
    }),
    [state.items, state.loading, state.error, state.isAuthError, authModal.isOpen, totalUnits, subtotal, addToCart, updateQuantity, removeFromCart, clearCart, loadCart, openAuthPrompt, closeAuthPrompt]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <AuthRequiredModal
        isOpen={authModal.isOpen}
        message={authModal.message}
        onClose={closeAuthPrompt}
      />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
