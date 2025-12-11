import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch cart
  const fetchCart = async () => {
    if (!user) {
      setCart({ items: [] });
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get('/api/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  // Add to cart
  const addToCart = async (itemId, type) => {
    try {
      const response = await axios.post('/api/cart/add', { itemId, type });
      setCart(response.data.cart);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to add to cart' 
      };
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId) => {
    try {
      const response = await axios.delete(`/api/cart/remove/${itemId}`);
      setCart(response.data.cart);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to remove from cart' 
      };
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      const response = await axios.delete('/api/cart/clear');
      setCart(response.data.cart);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to clear cart' 
      };
    }
  };

  // Get cart count
  const getCartCount = () => {
    return cart.items?.length || 0;
  };

  // Check if item is in cart
  const isInCart = (itemId, type) => {
    return cart.items?.some(item => 
      (type === 'course' && item.course?._id === itemId) ||
      (type === 'internship' && item.internship?._id === itemId)
    ) || false;
  };

  // Fetch cart on mount and when user changes
  useEffect(() => {
    fetchCart();
  }, [user]);

  const value = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    fetchCart,
    getCartCount,
    isInCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
