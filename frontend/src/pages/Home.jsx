import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, X, Menu, Heart, ChevronLeft, ChevronRight, Sun, Moon, Briefcase, Users, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { featuredCourses, featuredInternships, topPartners } from '../data/featuredData.js';

const Home = () => {
  const [companyInfo, setCompanyInfo] = useState(null);
  const [courses, setCourses] = useState([]);
  const [internships, setInternships] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Demo homepage state
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState({ courses: [], internships: [] });
  const [visibleCards, setVisibleCards] = useState(new Set());
  const courseRefs = useRef([]);

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
      title: 'Transform Your Future',
      description: 'Join thousands of students in achieving their career goals with our expert-led courses and internships.'
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
    if (user) {
      if (user.role === 'candidate') {
        navigate('/candidate/dashboard');
      } else if (user.role === 'manager') {
        navigate('/manager/dashboard');
      }
    }

    const fetchData = async () => {
      try {
        const [companyRes, coursesRes, internshipsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/company'),
          axios.get('http://localhost:5000/api/courses'),
          axios.get('http://localhost:5000/api/internships')
        ]);
        
        setCompanyInfo(companyRes.data);
        
        // Combine database courses with featured courses from GitHub demo
        const dbCourses = coursesRes.data || [];
        const allCourses = [...featuredCourses, ...dbCourses];
        setCourses(allCourses);
        
        // Combine database internships with featured internships from GitHub demo
        const dbInternships = internshipsRes.data || [];
        const allInternships = [...featuredInternships, ...dbInternships];
        setInternships(allInternships);
      } catch (error) {
        console.error('Error fetching data:', error);
        // If API fails, use featured data as fallback
        setCourses(featuredCourses);
        setInternships(featuredInternships);
      }
    };

    if (!user) {
      fetchData();
    }
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = entry.target.dataset.index;
            setVisibleCards((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px' }
    );

    courseRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [courses]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

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

  if (user) {
    return null;
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
              <button onClick={() => navigate('/login')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all ml-2">
                Login
              </button>
              <button onClick={() => navigate('/register')} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all">
                Register
              </button>
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
                <button onClick={() => navigate('/login')} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg">Login</button>
                <button onClick={() => navigate('/register')} className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg">Register</button>
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
            <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Featured Courses</h2>
            <p className={`text-center mb-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Unlock your potential with our expert-led programs</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.slice(0, 3).map((course, idx) => (
                <div 
                  key={course._id || `course-${idx}`} 
                  ref={(el) => (courseRefs.current[idx] = el)}
                  data-index={idx}
                  className={`rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all ${darkMode ? 'bg-gray-900' : 'bg-white'}`}
                >
                  {course.image ? (
                    <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                  )}
                  <div className="p-6">
                    <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{course.title}</h3>
                    {course.reviews && (
                      <div className="flex gap-1 mb-3">
                        {[...Array(course.reviews)].map((_, i) => (
                          <Heart key={i} className="w-5 h-5 fill-red-500 text-red-500" />
                        ))}
                      </div>
                    )}
                    <p className={`mb-4 line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{course.description}</p>
                  {course.originalPrice && course.discountPrice && (
                    <div className={`mb-4 ${visibleCards.has(String(idx)) ? 'animate-pricing' : 'opacity-0'}`}>
                      {/* Pricing - Side by Side Layout */}
                      <div className="flex items-center justify-between gap-4 mb-3">
                          {/* Left: Prices */}
                          <div className="flex flex-col gap-1">
                            {/* Original Price with Strikethrough */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-500">Regular Price:</span>
                              <div className="relative inline-block">
                                <span className={`text-lg font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>₹{course.originalPrice}</span>
                                <div className="absolute inset-0 flex items-center overflow-hidden">
                                  <div className="w-full h-0.5 bg-gradient-to-r from-red-600 to-red-500 animate-strike-price"></div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Discount Price */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-green-600">Special Price:</span>
                              <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-price-reveal">
                                ₹{course.discountPrice}
                              </span>
                            </div>
                          </div>
                          
                          {/* Right: Discount Badge */}
                          <div className="relative inline-block flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg blur opacity-75 animate-pulse"></div>
                            <div className="relative bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-4 py-3 rounded-lg shadow-lg transform hover:scale-110 transition-transform">
                              <div className="flex flex-col items-center">
                                <svg className="w-6 h-6 animate-spin-slow mb-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-2xl font-extrabold">{Math.round(((course.originalPrice - course.discountPrice) / course.originalPrice) * 100)}%</span>
                                <span className="text-sm font-semibold">OFF</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Savings Amount */}
                        <div className="flex justify-center">
                          <div className="inline-flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full animate-bounce-in">
                            <span className="text-xl">🎉</span>
                            <span className="text-sm font-bold text-green-700">
                              You Save ₹{course.originalPrice - course.discountPrice}!
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => navigate('/register')} className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                        Enroll Now
                      </button>
                      <button onClick={() => navigate('/register')} className={`flex-1 px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold transition-all ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50'}`}>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Internship Opportunities</h2>
            <p className={`text-center mb-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Launch your career with hands-on experience</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {internships.slice(0, 3).map((internship, idx) => (
                <div key={internship._id || `internship-${idx}`} className={`rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all ${darkMode ? 'bg-gradient-to-br from-purple-900 to-pink-900' : 'bg-gradient-to-br from-purple-50 to-pink-50'}`}>
                  {internship.image ? (
                    <img src={internship.image} alt={internship.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-r from-purple-400 to-pink-500"></div>
                  )}
                  <div className="p-6">
                    <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{internship.title}</h3>
                    <p className={`mb-6 line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{internship.description}</p>
                    <div className="flex gap-2">
                      <button onClick={() => navigate('/register')} className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                        Apply Now
                      </button>
                      <button onClick={() => navigate('/register')} className={`flex-1 px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold transition-all ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-purple-50'}`}>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
        }
        @keyframes price-reveal {
          0% { opacity: 0; transform: translateY(10px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-pricing .animate-price-reveal {
          animation: price-reveal 0.6s ease-out 1.2s forwards;
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-pricing .animate-bounce-in {
          animation: bounce-in 0.5s ease-out 1.8s forwards;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
