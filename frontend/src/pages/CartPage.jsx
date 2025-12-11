import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Trash2, ArrowLeft, CreditCard } from 'lucide-react';
import axios from 'axios';

const CartPage = () => {
  const { cart, loading, removeFromCart, clearCart, getCartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleRemoveItem = async (itemId) => {
    const result = await removeFromCart(itemId);
    if (result.success) {
      alert('Item removed from cart!');
    } else {
      alert(result.message);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      const result = await clearCart();
      if (result.success) {
        alert('Cart cleared!');
      } else {
        alert(result.message);
      }
    }
  };

  const calculateSubtotal = () => {
    return cart?.items?.reduce((total, item) => {
      const price = item.course?.price || item.internship?.price || 0;
      return total + price;
    }, 0) || 0;
  };

  const calculateOriginalTotal = () => {
    return cart?.items?.reduce((total, item) => {
      const originalPrice = item.course?.originalPrice || item.internship?.originalPrice || 0;
      return total + originalPrice;
    }, 0) || 0;
  };

  const calculateSavings = () => {
    return calculateOriginalTotal() - calculateSubtotal();
  };
  
  // Handle checkout - submit enrollment requests without payment
  const handleCheckout = async () => {
    if (getCartCount() === 0) {
      alert('Your cart is empty');
      return;
    }

    setProcessingPayment(true);

    try {
      // Process all cart items as enrollment requests (no payment required)
      const enrollmentPromises = cart.items.map(item => {
        if (item.course) {
          return axios.post('/api/enrollments', {
            courseId: item.course._id,
            message: ''
          });
        }
        return null;
      }).filter(Boolean);

      await Promise.all(enrollmentPromises);

      // Clear cart after successful enrollment requests
      await clearCart();

      setProcessingPayment(false);

      alert('✅ Enrollment requests submitted successfully! You will receive an email when the manager reviews your requests.');
      navigate('/candidate/dashboard');
    } catch (error) {
      setProcessingPayment(false);
      alert(error.response?.data?.message || 'Error submitting enrollment requests. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/candidate/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Shopping Cart
            </h1>
            {getCartCount() > 0 && (
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 font-semibold hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
          <p className="text-gray-600 mt-2">{getCartCount()} items in your cart</p>
        </div>

        {/* Cart Content */}
        {cart?.items?.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <ShoppingCart className="w-24 h-24 mx-auto mb-6 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any courses or internships yet.
            </p>
            <button
              onClick={() => navigate('/candidate/dashboard')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart?.items?.map((item) => {
                const courseOrInternship = item.course || item.internship;
                const originalPrice = courseOrInternship?.originalPrice || 0;
                const discountPrice = courseOrInternship?.price || 0;
                const discountPercentage = courseOrInternship?.discountPercentage || 0;

                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-6"
                  >
                    <div className="flex gap-6">
                      {/* Thumbnail */}
                      {courseOrInternship?.thumbnail && (
                        <img
                          src={courseOrInternship.thumbnail}
                          alt={courseOrInternship.title}
                          className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                        />
                      )}

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">
                              {courseOrInternship?.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {item.type === 'course' ? '📚 Course' : '💼 Internship'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                            title="Remove from cart"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {courseOrInternship?.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {courseOrInternship.description}
                          </p>
                        )}

                        {/* Pricing */}
                        <div className="flex items-center gap-4">
                          {originalPrice > discountPrice && (
                            <>
                              <span className="text-gray-400 line-through text-lg">
                                ₹{originalPrice}
                              </span>
                              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                ₹{discountPrice}
                              </span>
                              {discountPercentage > 0 && (
                                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                  {discountPercentage}% OFF
                                </span>
                              )}
                            </>
                          )}
                          {originalPrice === 0 || originalPrice === discountPrice ? (
                            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              ₹{discountPrice}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({getCartCount()} items)</span>
                    <span className="font-semibold">₹{calculateSubtotal()}</span>
                  </div>

                  {calculateSavings() > 0 && (
                    <>
                      <div className="flex justify-between text-gray-600">
                        <span>Original Price</span>
                        <span className="line-through">₹{calculateOriginalTotal()}</span>
                      </div>
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>You Save</span>
                        <span>- ₹{calculateSavings()}</span>
                      </div>
                    </>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>Total</span>
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ₹{calculateSubtotal()}
                      </span>
                    </div>
                  </div>
                </div>

                {calculateSavings() > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-green-700 font-semibold text-center">
                      🎉 You're saving ₹{calculateSavings()} on this order!
                    </p>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={processingPayment}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting Requests...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6" />
                      Submit Enrollment Requests
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Secure checkout powered by WEintegrity
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
