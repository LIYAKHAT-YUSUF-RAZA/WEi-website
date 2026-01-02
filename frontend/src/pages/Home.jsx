import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, X, Menu, ChevronLeft, ChevronRight, Briefcase, Users, Award, TrendingUp, LogOut, User, ShoppingCart, Trash2, BookOpen, Sun, Moon, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { featuredInternships, topPartners } from '../data/featuredData.js';

const Home = () => {
  const [companyInfo, setCompanyInfo] = useState(null);
  const [courses, setCourses] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState({});
  const [applicationStatuses, setApplicationStatuses] = useState({});
  const { user, logout } = useAuth();
  const { cart, addToCart, removeFromCart, isInCart, getCartCount } = useCart();
  const navigate = useNavigate();
  
  // Demo homepage state
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState({ courses: [], internships: [] });
  const coursesScrollRef = useRef(null);
  const internshipsScrollRef = useRef(null);

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
      title: user?.role === 'candidate' ? `Welcome Back, ${user?.name || 'Student'}` : 'Transform Your Future',
      description: user?.role === 'candidate' 
        ? 'Continue your journey towards achieving your career goals with our expert-led courses and internships.'
        : 'Join thousands of students in achieving their career goals with our expert-led courses and internships.'
    },
    {
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
      title: 'Learn From Industry Experts',
      description: 'Get hands-on experience with real-world projects and personalized mentorship from professionals.'
    },
    {
      image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=600&fit=crop',
      title: 'Build Your Career',
      description: 'Access exclusive internship opportunities and launch your dream career with confidence.'
    }
  ];

  const careerStats = [
    {
      icon: <Users className="w-8 h-8 sm:w-10 sm:h-10" />,
      number: '10,000+',
      label: 'Students Placed'
    },
    {
      icon: <Briefcase className="w-8 h-8 sm:w-10 sm:h-10" />,
      number: '500+',
      label: 'Partner Companies'
    },
    {
      icon: <Award className="w-8 h-8 sm:w-10 sm:h-10" />,
      number: '95%',
      label: 'Success Rate'
    },
    {
      icon: <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10" />,
      number: '40%',
      label: 'Avg. Salary Hike'
    }
  ];

  const testimonials = [
    { name: 'Priya Sharma', role: 'Software Engineer', text: 'The courses are exceptional! I landed my dream job within 3 months.' },
    { name: 'Rahul Kumar', role: 'Data Analyst', text: 'Best learning experience ever. Highly recommended!' },
    { name: 'Ananya Reddy', role: 'Marketing Manager', text: 'The internship program gave me real-world experience.' },
    { name: 'Vikram Singh', role: 'Full Stack Developer', text: 'Outstanding curriculum and support.' },
    { name: 'Sneha Patel', role: 'ML Engineer', text: 'This platform transformed my career completely.' },
    { name: 'Arjun Mehta', role: 'Digital Marketer', text: 'The practical approach makes all the difference!' }
  ];

  useEffect(() => {
    // Only redirect managers, not candidates
    if (user && user.role === 'manager') {
      navigate('/manager/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const timestamp = Date.now();
        const promises = [
          axios.get(`/api/company?t=${timestamp}`),
          axios.get(`/api/courses?t=${timestamp}`),
          axios.get(`/api/internships?t=${timestamp}`)
        ];
        
        // Add enrollment/application statuses if logged in as candidate
        if (user && user.role === 'candidate') {
          promises.push(
            axios.get(`/api/enrollments/my-enrollments?t=${timestamp}`),
            axios.get(`/api/applications/my-applications?t=${timestamp}`)
          );
        }
        
        const results = await Promise.all(promises);
        const [companyRes, coursesRes, internshipsRes, enrollmentsRes, applicationsRes] = results;
        
        setCompanyInfo(companyRes.data);
        
        // Use only database courses
        const dbCourses = coursesRes.data || [];
        console.log('Fetched courses from database:', dbCourses.length, dbCourses);
        const sortedDbCourses = dbCourses.sort((a, b) => 
          new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );
        setCourses(sortedDbCourses);
        
        // Use only database internships
        const dbInternships = internshipsRes.data || [];
        const sortedDbInternships = dbInternships.sort((a, b) => 
          new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );
        setInternships(sortedDbInternships);
        
        // Process enrollments if available
        if (enrollmentsRes) {
          const enrollmentMap = {};
          enrollmentsRes.data.forEach(enrollment => {
            const courseId = enrollment.course?._id || enrollment.course;
            enrollmentMap[courseId] = {
              status: enrollment.status,
              enrollmentId: enrollment._id,
              appliedAt: enrollment.appliedAt
            };
          });
          setEnrollments(enrollmentMap);
        }
        
        // Process applications if available
        if (applicationsRes) {
          const statusMap = {};
          applicationsRes.data
            .filter(app => app.type === 'internship')
            .forEach(app => {
              statusMap[app.referenceId] = {
                status: app.status,
                applicationId: app._id,
                appliedAt: app.appliedAt
              };
            });
          setApplicationStatuses(statusMap);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setCourses([]);
        setInternships(featuredInternships);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Auto-refresh data every 30 seconds to get latest updates
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [user, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 2);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Removed intersection observer for performance

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  // Scroll functions for courses
  const scrollCourses = (direction) => {
    if (coursesScrollRef.current) {
      const scrollAmount = 400; // Scroll by ~1.5 cards
      coursesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Scroll functions for internships
  const scrollInternships = (direction) => {
    if (internshipsScrollRef.current) {
      const scrollAmount = 400; // Scroll by ~1.5 cards
      internshipsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Enrollment and application statuses now fetched in parallel

  // Handle course enrollment - add to cart and navigate to payment (only when logged in)
  const handleEnroll = async (courseId) => {
    if (!user || user.role !== 'candidate') {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    const course = courses.find(c => c._id === courseId);
    if (!course) {
      alert('Course not found');
      return;
    }
    
    // Check if already enrolled
    const enrollment = enrollments[courseId];
    if (enrollment && (enrollment.status === 'pending' || enrollment.status === 'accepted')) {
      alert('You are already enrolled in this course!');
      return;
    }
    
    // Add to cart and navigate to payment page
    try {
      const result = await addToCart(courseId, 'course');
      if (result.success) {
        navigate('/cart');
      } else {
        alert(result.message || 'Failed to add course to cart');
      }
    } catch (error) {
      alert('Error adding course to cart');
    }
  };

  // Get enrollment button state (only when logged in as candidate)
  const getEnrollmentButton = (courseId) => {
    if (!user || user.role !== 'candidate') {
      return { text: 'Enroll Now', color: 'blue', action: () => handleEnroll(courseId) };
    }
    
    const enrollment = enrollments[courseId];
    
    if (!enrollment) {
      return { text: 'Enroll Now', color: 'blue', action: () => handleEnroll(courseId) };
    }
    if (enrollment.status === 'pending') {
      return { text: 'Payment Pending...', color: 'orange', action: null, disabled: true };
    }
    if (enrollment.status === 'payment_pending') {
      return { text: 'Pay Now 💳', color: 'blue', action: () => navigate('/cart') };
    }
    if (enrollment.status === 'accepted') {
      return { text: 'Enrolled ✓', color: 'green', action: null, disabled: true };
    }
    if (enrollment.status === 'rejected') {
      return { text: 'Enroll Again', color: 'blue', action: () => handleEnroll(courseId) };
    }
    return { text: 'Enroll Now', color: 'blue', action: () => handleEnroll(courseId) };
  };

  // Search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.trim().length > 0) {
      const lowerQuery = query.toLowerCase();
      
      // Search in courses
      const filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes(lowerQuery) ||
        course.description.toLowerCase().includes(lowerQuery) ||
        (course.category && course.category.toLowerCase().includes(lowerQuery)) ||
        (course.level && course.level.toLowerCase().includes(lowerQuery))
      );
      
      // Search in internships
      const filteredInternships = internships.filter(internship => 
        internship.title.toLowerCase().includes(lowerQuery) ||
        internship.description.toLowerCase().includes(lowerQuery) ||
        (internship.department && internship.department.toLowerCase().includes(lowerQuery)) ||
        (internship.location && internship.location.toLowerCase().includes(lowerQuery)) ||
        (internship.type && internship.type.toLowerCase().includes(lowerQuery))
      );
      
      setSearchResults({ courses: filteredCourses, internships: filteredInternships });
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
      setSearchResults({ courses: [], internships: [] });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults({ courses: [], internships: [] });
  };

  // Don't render homepage for managers (they're redirected)
  if (user && user.role === 'manager') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      {/* Navbar */}
      <nav className={`fixed top-0 w-full shadow-lg z-50 transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">WE</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                WEintegrity Technologies
              </span>
            </div>

            <div className="hidden lg:flex items-center space-x-1 flex-1 justify-end">
              {!searchOpen ? (
                <>
                  <a href="#home" className={`px-3 xl:px-4 py-2 rounded-lg transition-all duration-300 font-medium ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-blue-50 text-gray-700 hover:text-blue-600'}`}>Home</a>
                  <a href="#services" className={`px-3 xl:px-4 py-2 rounded-lg transition-all duration-300 font-medium ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-blue-50 text-gray-700 hover:text-blue-600'}`}>Services</a>
                  <a href="#contact" className={`px-3 xl:px-4 py-2 rounded-lg transition-all duration-300 font-medium ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-blue-50 text-gray-700 hover:text-blue-600'}`}>Contact</a>
                  <button onClick={() => setSearchOpen(true)} className={`p-2 rounded-lg transition-all duration-300 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-blue-50 text-gray-700'}`}>
                    <Search className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2 flex-1 animate-fadeIn">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search courses, internships..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'border-blue-200 focus:border-blue-500'}`}
                      autoFocus
                    />
                  </div>
                  <button onClick={() => { setSearchOpen(false); clearSearch(); }} className={`p-2 rounded-lg transition-all duration-300 ${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-red-400' : 'hover:bg-red-50 text-gray-700 hover:text-red-600'}`}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              {!user ? (
                <>
                  <button onClick={() => navigate('/login')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all ml-2">
                    Login
                  </button>
                  <button onClick={() => navigate('/register')} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all">
                    Register
                  </button>
                </>
              ) : user.role === 'candidate' ? (
                <>
                  <button
                    onClick={() => navigate('/application-history')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <BookOpen className="w-5 h-5" />
                    <span className="hidden xl:inline">My Applications</span>
                  </button>

                  {/* Cart Icon with Dropdown */}
                  <div className="relative ml-2">
                    <button
                      onClick={() => setShowCartDropdown(!showCartDropdown)}
                      className={`relative p-2 rounded-lg transition-all duration-300 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-blue-50 text-gray-700'}`}
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
                                            onClick={async () => {
                                              const result = await removeFromCart(item._id);
                                              if (result.success) {
                                                alert('Removed from cart!');
                                              }
                                            }}
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
                                ₹{cart?.items?.reduce((total, item) => {
                                  const price = item.course?.price || item.internship?.price || 0;
                                  return total + price;
                                }, 0) || 0}
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
                  
                  <div className={`flex items-center gap-2 ml-4 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <User className="w-5 h-5 text-blue-600" />
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{user?.name}</span>
                  </div>
                  
                  <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all ml-2">
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : null}
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg transition-all duration-300 ${darkMode ? 'text-yellow-400' : 'text-gray-700'}`}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg ${darkMode ? 'text-yellow-400' : 'text-gray-700'}`}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`p-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className={`lg:hidden py-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <a href="#home" className={`block px-4 py-3 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'hover:bg-blue-50'}`}>Home</a>
              <a href="#services" className={`block px-4 py-3 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'hover:bg-blue-50'}`}>Services</a>
              <a href="#contact" className={`block px-4 py-3 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'hover:bg-blue-50'}`}>Contact</a>
              <div className="px-4 py-2 flex flex-col gap-2">
                {!user ? (
                  <>
                    <button onClick={() => navigate('/login')} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg">Login</button>
                    <button onClick={() => navigate('/register')} className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg">Register</button>
                  </>
                ) : user.role === 'candidate' ? (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/application-history');
                      }}
                      className={`w-full text-left px-4 py-3 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'hover:bg-blue-50'}`}
                    >
                      My Applications
                    </button>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <User className="w-5 h-5 text-blue-600" />
                      <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{user?.name}</span>
                    </div>
                    <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg">
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Search Results Dropdown */}
      {showSearchResults && (
        <div className="fixed top-20 left-0 right-0 z-40 max-w-4xl mx-auto px-4">
          <div className={`rounded-lg shadow-2xl max-h-96 overflow-y-auto ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Search Results ({searchResults.courses.length + searchResults.internships.length} found)
                </h3>
                <button onClick={clearSearch} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {searchResults.courses.length === 0 && searchResults.internships.length === 0 && (
                <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No results found for "{searchQuery}"
                </p>
              )}

              {/* Courses Results */}
              {searchResults.courses.length > 0 && (
                <div className="mb-6">
                  <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    Courses ({searchResults.courses.length})
                  </h4>
                  <div className="space-y-2">
                    {searchResults.courses.map((course, idx) => (
                      <div
                        key={course._id || `search-course-${idx}`}
                        onClick={() => { navigate('/register'); clearSearch(); }}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'}`}
                      >
                        <div className="flex items-start gap-3">
                          {course.image && (
                            <img src={course.image} alt={course.title} className="w-16 h-16 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <h5 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{course.title}</h5>
                            <p className={`text-sm line-clamp-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{course.description}</p>
                            <div className="flex gap-2 mt-1 text-xs flex-wrap">
                              {course.category && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{course.category}</span>}
                              {course.level && <span className="px-2 py-1 bg-green-100 text-green-700 rounded">{course.level}</span>}
                              {course.discountPrice && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-semibold">₹{course.discountPrice}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Internships Results */}
              {searchResults.internships.length > 0 && (
                <div>
                  <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    Internships ({searchResults.internships.length})
                  </h4>
                  <div className="space-y-2">
                    {searchResults.internships.map((internship, idx) => (
                      <div
                        key={internship._id || `search-internship-${idx}`}
                        onClick={() => { navigate('/register'); clearSearch(); }}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-purple-50'}`}
                      >
                        <div className="flex items-start gap-3">
                          {internship.image && (
                            <img src={internship.image} alt={internship.title} className="w-16 h-16 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <h5 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{internship.title}</h5>
                            <p className={`text-sm line-clamp-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{internship.description}</p>
                            <div className="flex gap-2 mt-1 text-xs flex-wrap">
                              {internship.type && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">{internship.type}</span>}
                              {internship.location && <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">📍 {internship.location}</span>}
                              {internship.stipend && <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">{internship.stipend}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className={`pt-20 min-h-screen flex items-center ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-full lg:w-1/2 relative group">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                {heroSlides.map((slide, idx) => (
                  <img
                    key={idx}
                    src={slide.image}
                    alt={slide.title}
                    className={`w-full h-96 object-cover transition-all duration-700 ${idx === currentSlide ? 'opacity-100' : 'opacity-0 absolute top-0 left-0'}`}
                  />
                ))}
              </div>
              <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="flex justify-center gap-2 mt-4">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all ${idx === currentSlide ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>

            <div className="w-full lg:w-1/2 space-y-6">
              {heroSlides.map((slide, idx) => (
                <div key={idx} className={`transition-all duration-700 ${idx === currentSlide ? 'opacity-100' : 'opacity-0 absolute'}`}>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{slide.title}</h1>
                  <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{slide.description}</p>
                  <div className="flex gap-4">
                    <button onClick={() => navigate('/register')} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all">
                      Get Started
                    </button>
                    <button onClick={() => navigate('/login')} className={`px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'} transition-all`}>
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Career Stats */}
      <section className={`py-20 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Build Your Career With Us
          </h2>
          <p className={`text-center mb-16 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Join thousands of professionals who have transformed their careers
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {careerStats.map((stat, idx) => (
              <div key={idx} className={`rounded-xl p-8 text-center hover:shadow-2xl hover:-translate-y-2 transition-all ${darkMode ? 'bg-gradient-to-br from-green-900 to-blue-900' : 'bg-gradient-to-br from-green-50 to-blue-50'}`}>
                <div className={`flex justify-center mb-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{stat.icon}</div>
                <div className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.number}</div>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses & Internships */}
      <section id="services" className={`py-20 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Featured Courses</h2>
              
              {/* View All Courses Link */}
              {courses.length > 3 && (
                <button
                  onClick={() => navigate('/courses')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                >
                  View All {courses.length} Courses
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
            <p className={`text-center mb-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Unlock your potential with our expert-led programs</p>
            
            {/* Horizontal Scrolling Container */}
            <div className="relative group">
              {/* Left Scroll Button */}
              <button
                onClick={() => scrollCourses('left')}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-800'}`} />
              </button>

              {/* Right Scroll Button */}
              <button
                onClick={() => scrollCourses('right')}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-800'}`} />
              </button>

              <div ref={coursesScrollRef} className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {courses.map((course, idx) => {
                // Use the actual image from database
                const imageUrl = course.thumbnail || course.image;
                console.log(`Course ${course.title}: thumbnail=${course.thumbnail}, image=${course.image}`);
                
                return (
                <div 
                  key={course._id || `course-${idx}`}
                  className={`flex-shrink-0 w-80 snap-start rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all ${darkMode ? 'bg-gray-900' : 'bg-white'}`}
                >
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={course.title} 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        console.error(`Failed to load image for ${course.title}:`, imageUrl);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                  )}
                  <div className="p-6">
                  <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{course.title}</h3>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-3">
                    {course.category || 'Programming'}
                  </span>
                  <p className={`mb-4 line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{course.description}</p>
                  
                  {/* Instructor Info */}
                  {(course.instructor?.name || course.instructorDetails?.name) && (
                    <div className={`mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm">
                        Instructor: 
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (course._id) navigate(`/instructor/${course._id}`);
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-700 font-semibold underline"
                        >
                          {course.instructor?.name || course.instructorDetails?.name}
                        </button>
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>⏰ {course.duration || '8 weeks'}</span>
                    <span className="text-blue-600 font-semibold text-sm">{course.level || 'Beginner'}</span>
                  </div>
                  
                  {/* Pricing Section with Full Animation */}
                  {(course.price > 0 || course.discountPrice > 0) && (
                    <div className="mb-4 animate-pricing">
                      {course.originalPrice > 0 && (course.discountPrice > 0 || course.price > 0) && course.originalPrice > (course.discountPrice || course.price) ? (
                        // With Discount - Show full pricing layout with animations
                        <>
                          {/* Pricing - Side by Side Layout */}
                          <div className="flex items-center justify-between gap-4 mb-3">
                            {/* Left: Prices */}
                            <div className="flex flex-col gap-1">
                              {/* Original Price with Strikethrough Animation */}
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Regular Price:</span>
                                <div className="relative inline-block">
                                  <span className={`text-xl font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>₹{course.originalPrice}</span>
                                  <div className="absolute inset-0 flex items-center overflow-hidden">
                                    <div className="w-full h-0.5 bg-gradient-to-r from-red-600 to-red-500 animate-strike-price"></div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Special Price with Animation */}
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-green-600">Special Price:</span>
                                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-price-reveal">
                                  ₹{course.discountPrice || course.price}
                                </span>
                              </div>
                            </div>
                            
                            {/* Right: Discount Badge with Animation */}
                            <div className="relative inline-block flex-shrink-0">
                              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg blur opacity-75 animate-pulse"></div>
                              <div className="relative bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-4 py-3 rounded-lg shadow-lg transform hover:scale-110 transition-transform animate-badge-glow">
                                <div className="flex flex-col items-center">
                                  <svg className="w-6 h-6 animate-spin-slow mb-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="text-2xl font-extrabold">
                                    {course.discountPercentage || Math.round(((course.originalPrice - (course.discountPrice || course.price)) / course.originalPrice) * 100)}%
                                  </span>
                                  <span className="text-sm font-semibold">OFF</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Savings Amount with Animation */}
                          <div className="flex justify-center">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full animate-bounce-in border border-green-200 shadow-md">
                              <span className="text-xl animate-bounce">🎉</span>
                              <span className="text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                You Save ₹{course.originalPrice - (course.discountPrice || course.price)}!
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        // Without Discount - Show simple price with animation
                        <div className="mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Price:</span>
                            <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-price-reveal">
                              ₹{course.discountPrice || course.price}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                    <div className="flex flex-col gap-2">
                      {course._id && (() => {
                        const enrollBtn = user?.role === 'candidate' ? getEnrollmentButton(course._id) : { text: 'Enroll Now', color: 'blue', action: () => navigate('/login') };
                        return (
                          <>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  if (!user || user.role !== 'candidate') {
                                    localStorage.setItem('redirectAfterLogin', window.location.pathname);
                                    navigate('/login', { state: { from: window.location.pathname } });
                                    return;
                                  }
                                  if (enrollBtn.action) enrollBtn.action();
                                }}
                                disabled={user?.role === 'candidate' && enrollBtn.disabled}
                                className={`flex-1 px-4 py-3 bg-gradient-to-r ${
                                  enrollBtn.color === 'green' ? 'from-green-600 to-green-700' :
                                  enrollBtn.color === 'orange' ? 'from-orange-600 to-orange-700' :
                                  'from-blue-600 to-purple-600'
                                } text-white rounded-lg font-semibold hover:shadow-lg transition-all ${
                                  user?.role === 'candidate' && enrollBtn.disabled ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {enrollBtn.text}
                              </button>
                              <button onClick={() => course._id ? navigate(`/courses/${course._id}`) : navigate('/register')} className={`flex-1 px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold transition-all ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50'}`}>
                                View Details
                              </button>
                            </div>
                            <button 
                              onClick={async () => {
                                if (!user || user.role !== 'candidate') {
                                  localStorage.setItem('redirectAfterLogin', window.location.pathname);
                                  navigate('/login', { state: { from: window.location.pathname } });
                                  return;
                                }
                                const enrollment = enrollments[course._id];
                                if (enrollment && (enrollment.status === 'pending' || enrollment.status === 'accepted')) {
                                  alert('You are already enrolled in this course!');
                                  return;
                                }
                                if (isInCart(course._id, 'course')) {
                                  const cartItem = cart.items?.find(item => item.course?._id === course._id);
                                  if (cartItem) {
                                    const result = await removeFromCart(cartItem._id);
                                    if (result.success) {
                                      alert('Removed from cart!');
                                    } else {
                                      alert(result.message);
                                    }
                                  }
                                } else {
                                  const result = await addToCart(course._id, 'course');
                                  if (result.success) {
                                    alert('Added to cart!');
                                  } else {
                                    alert(result.message);
                                  }
                                }
                              }}
                              disabled={user?.role === 'candidate' && enrollments[course._id] && (enrollments[course._id].status === 'pending' || enrollments[course._id].status === 'accepted')}
                              className={`w-full px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                user?.role === 'candidate' && enrollments[course._id] && (enrollments[course._id].status === 'pending' || enrollments[course._id].status === 'accepted')
                                  ? 'bg-gray-400 text-white cursor-not-allowed opacity-50'
                                  : user?.role === 'candidate' && isInCart(course._id, 'course')
                                  ? 'bg-red-500 text-white hover:bg-red-600'
                                  : 'bg-green-500 text-white hover:bg-green-600'
                              }`}
                            >
                              <ShoppingCart className="w-4 h-4" />
                              {user?.role === 'candidate' && enrollments[course._id] && (enrollments[course._id].status === 'pending' || enrollments[course._id].status === 'accepted')
                                ? 'Already Enrolled'
                                : user?.role === 'candidate' && isInCart(course._id, 'course') ? 'Remove from Cart' : 'Add to Cart'}
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Internship Opportunities</h2>
              
              {/* View All Internships Link */}
              {internships.length > 3 && (
                <button
                  onClick={() => navigate('/internships')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                >
                  View All {internships.length} Internships
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
            <p className={`text-center mb-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Launch your career with hands-on experience</p>
            
            {/* Horizontal Scrolling Container */}
            <div className="relative group">
              {/* Left Scroll Button */}
              <button
                onClick={() => scrollInternships('left')}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-800'}`} />
              </button>

              {/* Right Scroll Button */}
              <button
                onClick={() => scrollInternships('right')}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-800'}`} />
              </button>

              <div ref={internshipsScrollRef} className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {internships.slice(0, 3).map((internship, idx) => (
                <div key={internship._id || `internship-${idx}`} className={`flex-shrink-0 w-80 snap-start rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                  {internship.image ? (
                    <img src={internship.image} alt={internship.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-r from-purple-400 to-pink-500"></div>
                  )}
                  <div className="p-6">
                    <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{internship.title}</h3>
                    <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mb-3">
                      {internship.type || 'Internship'}
                    </span>
                    <p className={`mb-4 line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{internship.description}</p>
                    
                    {/* Company/Department Info */}
                    {(internship.company || internship.department) && (
                      <div className={`mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-sm font-medium">{internship.company || internship.department}</span>
                      </div>
                    )}
                    
                    <div className={`space-y-2 text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {internship.location && (
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span>{internship.location}</span>
                        </div>
                      )}
                      {internship.duration && (
                        <div className="flex items-center gap-2">
                          <span>⏰</span>
                          <span>{internship.duration}</span>
                        </div>
                      )}
                      {internship.stipend && (
                        <div className="flex items-center gap-2">
                          <span>💰</span>
                          <span className="font-semibold text-green-600">{internship.stipend}</span>
                        </div>
                      )}
                    </div>

                    {/* Skills Tags */}
                    {internship.skills && internship.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {internship.skills.slice(0, 3).map((skill, skillIdx) => (
                            <span key={skillIdx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                          {internship.skills.length > 3 && (
                            <span className="text-xs text-gray-500">+{internship.skills.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-2">
                      {internship._id && (() => {
                        const isAccepted = user?.role === 'candidate' && applicationStatuses[internship._id]?.status === 'accepted';
                        const isPending = user?.role === 'candidate' && applicationStatuses[internship._id]?.status === 'pending';
                        const isRejected = user?.role === 'candidate' && applicationStatuses[internship._id]?.status === 'rejected';
                        
                        return (
                          <>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  if (!user || user.role !== 'candidate') {
                                    localStorage.setItem('redirectAfterLogin', window.location.pathname);
                                    navigate('/login', { state: { from: window.location.pathname } });
                                    return;
                                  }
                                  navigate(`/internships/${internship._id}`);
                                }}
                                disabled={user?.role === 'candidate' && (isAccepted || isPending)}
                                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                                  isAccepted
                                    ? 'bg-green-500 text-white cursor-default opacity-50'
                                    : isPending
                                    ? 'bg-yellow-500 text-white cursor-default opacity-50'
                                    : isRejected
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                                }`}
                              >
                                {isAccepted
                                  ? 'Accepted ✓'
                                  : isPending
                                  ? 'Pending...'
                                  : isRejected
                                  ? 'Reapply'
                                  : 'Apply Now'}
                              </button>
                              <button 
                                onClick={() => navigate(`/internships/${internship._id}`)} 
                                className={`flex-1 px-4 py-3 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold transition-all ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-purple-50'}`}
                              >
                                View Details
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className={`py-16 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className={`text-4xl font-bold text-center mb-12 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Our Top Partners</h2>
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-12">
              {[...topPartners, ...topPartners].map((partner, idx) => (
                <div key={idx} className="flex-shrink-0 w-48 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center p-4 hover:shadow-xl transition-all">
                  <img src={partner} alt={`Partner ${idx + 1}`} className="max-w-full max-h-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-20 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">What Our Students Say</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.slice(currentTestimonial * 3, currentTestimonial * 3 + 3).map((testimonial, idx) => (
              <div key={idx} className={`p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all ${darkMode ? 'bg-gradient-to-br from-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Heart key={i} className="w-5 h-5 fill-red-500 text-red-500" />
                  ))}
                </div>
                <p className={`mb-6 italic ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>"{testimonial.text}"</p>
                <div>
                  <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{testimonial.name}</p>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className={`py-20 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
        <div className="max-w-2xl mx-auto px-6">
          <div className={`p-8 rounded-xl shadow-lg ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Get In Touch</h2>
            <div className="space-y-6">
              <input type="text" placeholder="Name" className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500" />
              <input type="email" placeholder="Email" className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500" />
              <textarea rows="4" placeholder="Message" className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500"></textarea>
              <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all">
                Send Message
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 text-center">
        <p>&copy; 2025 WEintegrity Technologies. All rights reserved.</p>
      </footer>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes pricing-fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-pricing {
          animation: pricing-fade-in 0.6s ease-out forwards;
        }
        @keyframes strike-price {
          0% { width: 0; opacity: 0; }
          50% { opacity: 1; }
          100% { width: 100%; opacity: 1; }
        }
        .animate-pricing .animate-strike-price {
          animation: strike-price 0.8s ease-out 0.3s forwards;
          width: 0;
        }
        @keyframes price-reveal {
          0% { opacity: 0; transform: translateY(10px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-pricing .animate-price-reveal {
          animation: price-reveal 0.6s ease-out 1.2s forwards;
          opacity: 0;
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-pricing .animate-bounce-in {
          animation: bounce-in 0.5s ease-out 1.8s forwards;
          opacity: 0;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        @keyframes badge-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.5); }
          50% { box-shadow: 0 0 30px rgba(239, 68, 68, 0.8); }
        }
        .animate-badge-glow {
          animation: badge-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
