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
    <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-violet-500/30 transition-all duration-300">
                W
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 font-heading">
                WEintegrity
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            {!user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-violet-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                <Link to={user.role === 'candidate' ? "/candidate/dashboard" : "/"} className="flex items-center gap-2 group">
                  <img
                    src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-gray-200 group-hover:border-violet-400 transition-colors object-cover"
                  />
                  <span className="text-gray-700 font-medium hidden sm:block group-hover:text-violet-600 transition-colors">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>

                {user.role === 'candidate' && (
                  <>
                    <div className="hidden md:flex items-center space-x-1">
                      <Link to="/candidate/dashboard" className="px-4 py-2 text-gray-600 hover:text-violet-600 font-medium rounded-lg hover:bg-violet-50 transition-all">Dashboard</Link>
                      <Link to="/courses" className="px-4 py-2 text-gray-600 hover:text-violet-600 font-medium rounded-lg hover:bg-violet-50 transition-all">Courses</Link>
                      <Link to="/services" className="px-4 py-2 text-gray-600 hover:text-violet-600 font-medium rounded-lg hover:bg-violet-50 transition-all">Services</Link>
                      <Link to="/internships" className="px-4 py-2 text-gray-600 hover:text-violet-600 font-medium rounded-lg hover:bg-violet-50 transition-all">Internships</Link>
                    </div>

                    {/* Cart Icon */}
                    <div className="relative">
                      <button
                        onClick={() => setShowCartDropdown(!showCartDropdown)}
                        className="relative p-2 text-gray-600 hover:text-violet-600 transition-colors"
                      >
                        <ShoppingCart className="w-6 h-6" />
                        {getCartCount() > 0 && (
                          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-lg">
                            {getCartCount()}
                          </span>
                        )}
                      </button>

                      {/* Cart Dropdown */}
                      {showCartDropdown && (
                        <div className="absolute right-0 mt-4 w-96 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl z-50 border border-white/20 animate-fade-in-up">
                          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                            <h3 className="text-lg font-bold text-gray-800 font-heading">
                              Shopping Cart ({getCartCount()})
                            </h3>
                            <button
                              onClick={() => setShowCartDropdown(false)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="max-h-96 overflow-y-auto p-2">
                            {cart?.items?.length === 0 ? (
                              <div className="p-8 text-center text-gray-500">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="font-medium">Your cart is empty</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {cart?.items?.map((item) => {
                                  const courseOrInternship = item.course || item.internship;
                                  return (
                                    <div key={item._id} className="p-3 hover:bg-violet-50/50 rounded-xl transition-colors group border border-transparent hover:border-violet-100">
                                      <div className="flex gap-3">
                                        {courseOrInternship?.thumbnail && (
                                          <img
                                            src={courseOrInternship.thumbnail}
                                            alt={courseOrInternship.title}
                                            className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                          />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-gray-800 truncate">
                                            {courseOrInternship?.title}
                                          </h4>
                                          <p className="text-xs text-violet-600 font-medium mb-1 uppercase tracking-wider">
                                            {item.type === 'course' ? 'Course' : 'Internship'}
                                          </p>
                                          <div className="flex items-center justify-between">
                                            <div className="text-sm font-bold text-gray-900">
                                              ₹{courseOrInternship?.price?.toLocaleString() || 0}
                                            </div>
                                            <button
                                              onClick={() => handleRemoveFromCart(item._id)}
                                              className="text-red-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
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
                            <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                              <div className="flex justify-between items-center mb-4">
                                <span className="font-medium text-gray-600">Total</span>
                                <span className="text-xl font-bold text-gray-900">
                                  ₹{calculateTotal().toLocaleString()}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setShowCartDropdown(false);
                                  navigate('/cart');
                                }}
                                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 transform hover:-translate-y-0.5 transition-all duration-300"
                              >
                                Checkout
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
                    className="bg-violet-100 text-violet-700 px-4 py-2 rounded-lg font-medium hover:bg-violet-200 transition-colors"
                  >
                  </Link>
                )}

                {user.role === 'service_provider' && (
                  <div className="flex items-center space-x-1">
                    <Link
                      to="/service-provider/dashboard"
                      className="px-4 py-2 text-gray-600 hover:text-violet-600 font-medium rounded-lg hover:bg-violet-50 transition-all"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/service-provider/services"
                      className="px-4 py-2 text-gray-600 hover:text-violet-600 font-medium rounded-lg hover:bg-violet-50 transition-all"
                    >
                      My Services
                    </Link>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-500 hover:text-red-600 font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
