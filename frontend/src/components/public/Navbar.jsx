import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart, getCartCount, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [showCartDropdown, setShowCartDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRemoveFromCart = async (itemId) => {
    await removeFromCart(itemId);
  };

  const calculateTotal = () => {
    return cart?.items?.reduce((total, item) => {
      const price = item.course?.price || item.internship?.price || 0;
      return total + price;
    }, 0) || 0;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              WEintegrity
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <span className="text-gray-700">
                  Hello, {user.name}
                </span>
                {user.role === 'candidate' && (
                  <>
                    <Link
                      to="/candidate/dashboard"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/courses"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Courses
                    </Link>
                    <Link
                      to="/internships"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Internships
                    </Link>
                    <Link
                      to="/my-applications"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      My Applications
                    </Link>
                    
                    {/* Cart Icon with Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowCartDropdown(!showCartDropdown)}
                        className="relative p-2 text-gray-700 hover:text-primary-600 rounded-md"
                      >
                        <ShoppingCart className="w-6 h-6" />
                        {getCartCount() > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                            {getCartCount()}
                          </span>
                        )}
                      </button>

                      {/* Cart Dropdown */}
                      {showCartDropdown && (
                        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">
                              Shopping Cart ({getCartCount()})
                            </h3>
                            <button
                              onClick={() => setShowCartDropdown(false)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="max-h-96 overflow-y-auto">
                            {cart?.items?.length === 0 ? (
                              <div className="p-8 text-center text-gray-500">
                                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p>Your cart is empty</p>
                              </div>
                            ) : (
                              <div className="divide-y divide-gray-200">
                                {cart?.items?.map((item) => {
                                  const courseOrInternship = item.course || item.internship;
                                  return (
                                    <div key={item._id} className="p-4 hover:bg-gray-50 transition">
                                      <div className="flex gap-3">
                                        {courseOrInternship?.thumbnail && (
                                          <img
                                            src={courseOrInternship.thumbnail}
                                            alt={courseOrInternship.title}
                                            className="w-20 h-20 object-cover rounded-lg"
                                          />
                                        )}
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-gray-800 mb-1">
                                            {courseOrInternship?.title}
                                          </h4>
                                          <p className="text-sm text-gray-500 mb-2">
                                            {item.type === 'course' ? 'Course' : 'Internship'}
                                          </p>
                                          <div className="flex items-center justify-between">
                                            <div className="text-lg font-bold text-primary-600">
                                              ₹{courseOrInternship?.price || 0}
                                            </div>
                                            <button
                                              onClick={() => handleRemoveFromCart(item._id)}
                                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {cart?.items?.length > 0 && (
                            <div className="p-4 border-t border-gray-200 bg-gray-50">
                              <div className="flex justify-between items-center mb-3">
                                <span className="font-semibold text-gray-800">Total:</span>
                                <span className="text-2xl font-bold text-primary-600">
                                  ₹{calculateTotal()}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setShowCartDropdown(false);
                                  navigate('/cart');
                                }}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition"
                              >
                                View Cart & Checkout
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
                {user.role === 'manager' && (
                  <Link
                    to="/manager/dashboard"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
