import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Menu, X, ChevronDown, ChevronUp, Heart, Star, Clock, Users, Award, BookOpen } from 'lucide-react';
import Footer from '../components/public/Footer.jsx';
import { featuredCourses } from '../data/featuredData';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedModule, setExpandedModule] = useState(null);
  const [darkMode] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${id}`);
        const dbCourse = response.data;

        // Use database course data directly
        setCourse(dbCourse);
      } catch (error) {
        console.error('Error fetching course:', error);
        setMessage({ type: 'error', text: 'Course not found' });
      } finally {
        setLoading(false);
      }
    };

    const checkStatus = async () => {
      try {
        const response = await axios.get(`/api/enrollments/status/${id}`);
        console.log('Enrollment status response:', response.data);
        setEnrollmentStatus(response.data.status);
      } catch (error) {
        setEnrollmentStatus(null);
      }
    };

    fetchCourse();
    checkStatus();
  }, [id]);

  const handleEnroll = async () => {
    // Check if user is logged in
    if (!user || user.role !== 'candidate') {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    // Check if already enrolled
    if (enrollmentStatus === 'accepted' || enrollmentStatus === 'pending') {
      alert('You are already enrolled in this course!');
      return;
    }

    setEnrolling(true);
    setMessage({ type: '', text: '' });

    try {
      // Navigate directly to payment page with course data
      const courseItem = {
        _id: course._id,
        type: 'course',
        course: course
      };

      const subtotal = course.price || 0;
      const originalTotal = course.originalPrice || 0;
      const savings = originalTotal - subtotal;

      navigate('/payment', {
        state: {
          items: [courseItem],
          subtotal: subtotal,
          originalTotal: originalTotal,
          savings: savings
        }
      });
    } catch (error) {
      console.error('Enrollment error:', error);
      setMessage({
        type: 'error',
        text: 'Failed to proceed to payment. Please try again.'
      });
    } finally {
      setEnrolling(false);
    }
  };

  const getEnrollButton = () => {
    // Check if already enrolled
    if (enrollmentStatus === 'accepted') {
      return (
        <button
          className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold cursor-default flex items-center gap-2"
          disabled
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Already Enrolled
        </button>
      );
    }

    // Check if pending approval
    if (enrollmentStatus === 'pending') {
      return (
        <button
          className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold cursor-default flex items-center gap-2"
          disabled
        >
          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Pending
        </button>
      );
    }

    // Check if course is in cart
    if (isInCart(id, 'course')) {
      return (
        <button
          onClick={() => navigate('/cart')}
          className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all duration-300 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
          Item in Cart
        </button>
      );
    }

    // Default: Show Enroll Now button
    return (
      <button
        onClick={handleEnroll}
        disabled={enrolling}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
      >
        {enrolling ? 'Processing...' : 'Enroll Now'}
      </button>
    );
  };

  const handleSubmitCourseRequest = async () => {
    if (!user || user.role !== 'candidate') {
      navigate('/login');
      return;
    }

    try {
      await axios.post('/api/course-requests', {
        courseId: id,
        message: requestMessage
      });

      setMessage({
        type: 'success',
        text: 'Course enrollment request submitted successfully! Managers will review your request soon.'
      });
      setShowRequestModal(false);
      setRequestMessage('');
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit course request'
      });
    }
  };

  const toggleModule = (index) => {
    setExpandedModule(expandedModule === index ? null : index);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading course details...</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-red-600">Course not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      {/* Navbar handled globally in App.jsx */}

      <section id="overview" className="pb-20 pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
              {message.text}
            </div>
          )}

          <div className="flex flex-col lg:flex-row items-start gap-12">
            {/* Course Image */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
              {course.thumbnail || course.image ? (
                <img
                  src={course.thumbnail || course.image}
                  alt={course.title}
                  className="w-full max-w-md h-auto object-contain rounded-2xl shadow-2xl"
                />
              ) : (
                <div className="w-full max-w-md h-96 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl"></div>
              )}

              {/* Course Price */}
              {course.originalPrice > 0 && course.price >= 0 ? (
                <div className="mt-6 flex flex-col items-center">
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-bold text-blue-600">₹{course.price}</span>
                    <span className="text-xl line-through text-gray-400">₹{course.originalPrice}</span>
                    {course.discountPercentage > 0 && (
                      <span className="text-lg font-semibold text-green-600">
                        {course.discountPercentage}% OFF
                      </span>
                    )}
                  </div>
                </div>
              ) : course.price > 0 ? (
                <div className="mt-6">
                  <span className="text-4xl font-bold text-blue-600">₹{course.price}</span>
                </div>
              ) : (
                <div className="mt-6">
                  <span className="text-4xl font-bold text-green-600">Free</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="w-full lg:w-1/2 space-y-6">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {course.title}
              </h1>

              <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {course.description}
              </p>

              {/* Course Stats */}
              <div className="grid grid-cols-2 gap-4">
                {course.duration && (
                  <div className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <p className="text-sm text-gray-500">Duration</p>
                    </div>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{course.duration}</p>
                  </div>
                )}

                {(course.enrolled !== undefined || course.maxStudents) && (
                  <div className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-5 h-5 text-purple-600" />
                      <p className="text-sm text-gray-500">Students</p>
                    </div>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {course.enrolled || 0}/{course.maxStudents || 'N/A'}
                    </p>
                  </div>
                )}

                {course.level && (
                  <div className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-gray-500">Level</p>
                    </div>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{course.level}</p>
                  </div>
                )}

                {course.category && (
                  <div className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <p className="text-sm text-gray-500">Category</p>
                    </div>
                    <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{course.category}</p>
                  </div>
                )}
              </div>

              {/* Call to Action */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
                >
                  {enrolling ? 'Enrolling...' : 'Start Learning Now'}
                </button>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="flex-1 px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold transition-all duration-300 hover:bg-purple-50"
                >
                  Request Enrollment
                </button>
                <button
                  onClick={() => navigate('/courses')}
                  className={`flex-1 px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold transition-all duration-300 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50'}`}
                >
                  Browse More Courses
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn Section */}
      {course.learningOutcomes && course.learningOutcomes.length > 0 && (
        <section className={`py-20 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-6 max-w-7xl">
            <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              What You'll Learn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {course.learningOutcomes.map((outcome, index) => (
                <div key={index} className={`flex items-start gap-4 p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md hover:shadow-xl transition-shadow duration-300`}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{outcome}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Curriculum Section */}
      {course.curriculum && course.curriculum.length > 0 && (
        <section className={`py-20 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Course Curriculum
              </h2>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Comprehensive modules designed to take you from beginner to expert
              </p>
            </div>

            <div className="space-y-4">
              {course.curriculum.map((module, index) => (
                <div key={index} className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} shadow-md hover:shadow-lg transition-all duration-300`}>
                  <button
                    onClick={() => toggleModule(index)}
                    className={`w-full px-6 py-5 flex items-center justify-between ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors duration-200`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                      <div className="text-left">
                        <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {module.module}
                        </h3>
                        {module.duration && (
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {module.duration}
                          </p>
                        )}
                      </div>
                    </div>
                    {expandedModule === index ? (
                      <ChevronUp className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    ) : (
                      <ChevronDown className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    )}
                  </button>

                  {expandedModule === index && module.topics && (
                    <div className={`px-6 pb-6 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                      <ul className="space-y-3 ml-16">
                        {module.topics.map((topic, topicIndex) => (
                          <li key={topicIndex} className="flex items-start gap-3">
                            <BookOpen className={`w-5 h-5 mt-0.5 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Prerequisites Section */}
      {course.prerequisites && course.prerequisites.length > 0 && (
        <section className={`py-20 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-6 max-w-7xl">
            <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Prerequisites
            </h2>
            <div className={`max-w-3xl mx-auto p-8 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <ul className="space-y-4">
                {course.prerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{prereq}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Instructor Section */}
      {course.instructor && (
        <section className={`py-20 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="container mx-auto px-6 max-w-7xl">
            <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Meet Your Instructor
            </h2>
            <div className={`max-w-4xl mx-auto p-8 rounded-2xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} shadow-xl`}>
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-shrink-0">
                  {course.instructor.image ? (
                    <img
                      src={course.instructor.image}
                      alt={course.instructor.name}
                      className="w-32 h-32 rounded-full object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                      <span className="text-5xl font-bold text-white">
                        {course.instructor.name?.charAt(0) || 'I'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {course.instructor.name}
                  </h3>

                  {/* Experience and Rating */}
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    {course.instructor.experience && (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {course.instructor.experience} Experience
                        </span>
                      </div>
                    )}

                    {course.instructor.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-5 h-5 ${star <= Math.round(course.instructor.rating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                                }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {course.instructor.rating}/5
                        </span>
                      </div>
                    )}
                  </div>

                  {course.instructor.designation && (
                    <p className={`text-xl mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {course.instructor.designation}
                    </p>
                  )}
                  {course.instructor.bio && (
                    <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {course.instructor.bio}
                    </p>
                  )}

                  {/* View Instructor Details Button */}
                  <button
                    onClick={() => navigate(`/instructor/${course._id}`)}
                    className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    View Instructor Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Additional Info Section */}
      <section className={`py-20 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {course.certificate && (
              <div className={`p-8 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl text-center`}>
                <Award className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Certificate
                </h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Earn a certificate upon completion
                </p>
              </div>
            )}

            {course.support && (
              <div className={`p-8 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl text-center`}>
                <Users className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Support
                </h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {course.support}
                </p>
              </div>
            )}

            {course.projectsIncluded && (
              <div className={`p-8 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl text-center`}>
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Projects
                </h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {course.projectsIncluded}+ hands-on projects included
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Course Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Request Course Enrollment</h3>
              <p className="text-sm text-gray-600 mt-1">{course?.title}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Tell the managers why you want to enroll in this course..."
                  rows="4"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Your request will be sent to managers for approval. You'll receive an email when they respond.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestMessage('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCourseRequest}
                className="flex-1 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
