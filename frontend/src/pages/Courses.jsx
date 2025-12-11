import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [enrollments, setEnrollments] = useState({});
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchQuery, selectedCategory, selectedLevel, courses]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      setCourses(response.data);
      setFilteredCourses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await axios.get('/api/enrollments/my-enrollments');
      const enrollmentMap = {};
      response.data.forEach(enrollment => {
        const courseId = enrollment.course?._id || enrollment.course;
        enrollmentMap[courseId] = enrollment.status;
      });
      setEnrollments(enrollmentMap);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Filter by level
    if (selectedLevel !== 'All') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    setFilteredCourses(filtered);
  };

  const categories = ['All', ...new Set(courses.map(c => c.category))];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 hover:text-blue-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">All Courses</h1>
          <p className="text-xl text-blue-100">Explore our comprehensive course catalog</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No courses found matching your criteria</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all"
              >
                {/* Course Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl font-bold text-white opacity-50">
                        {course.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-blue-600">
                      {course.category}
                    </span>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Instructor Info */}
                  {(course.instructor?.name || course.instructorDetails?.name) && (
                    <div className="mb-4 flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm">
                        Instructor:{' '}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/instructor/${course._id}`);
                          }}
                          className="text-blue-600 hover:text-blue-700 font-semibold underline"
                        >
                          {course.instructor?.name || course.instructorDetails?.name}
                        </button>
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">⏰ {course.duration}</span>
                    <span className="text-blue-600 font-semibold text-sm">{course.level}</span>
                  </div>

                  {/* Pricing Section */}
                  {course.price > 0 && (
                    <div className="mb-4">
                      {course.originalPrice > 0 && course.originalPrice > course.price ? (
                        <>
                          <div className="flex items-center justify-between gap-4 mb-3">
                            <div className="flex flex-col">
                              <div className="flex items-baseline gap-2">
                                <span className="text-xs text-gray-400 line-through">₹{course.originalPrice}</span>
                              </div>
                              <div className="text-2xl font-bold text-green-600">₹{course.price}</div>
                            </div>
                            <div className="bg-gradient-to-br from-pink-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg transform -rotate-12">
                              <div className="text-xs font-bold">★</div>
                              <div className="text-lg font-black leading-none">{course.discountPercentage}%</div>
                              <div className="text-xs font-bold">OFF</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                            <span className="text-2xl">🎉</span>
                            <span className="text-sm font-semibold text-green-700">
                              You Save ₹{course.originalPrice - course.price}!
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-2xl font-bold text-gray-900">₹{course.price}</div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {enrollments[course._id] === 'accepted' ? (
                      // Already Enrolled (Accepted)
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold cursor-default flex items-center justify-center gap-2 text-sm"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Enrolled
                          </button>
                          <button
                            onClick={() => navigate(`/courses/${course._id}`)}
                            className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all text-sm"
                          >
                            View Details
                          </button>
                        </div>
                        <button
                          disabled
                          className="w-full px-4 py-2 rounded-lg font-semibold bg-gray-300 text-gray-600 cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Already Enrolled
                        </button>
                      </>
                    ) : enrollments[course._id] === 'pending' ? (
                      // Pending Approval
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold cursor-default flex items-center justify-center gap-2 text-sm"
                          >
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Pending
                          </button>
                          <button
                            onClick={() => navigate(`/courses/${course._id}`)}
                            className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all text-sm"
                          >
                            View Details
                          </button>
                        </div>
                        <button
                          disabled
                          className="w-full px-4 py-2 rounded-lg font-semibold bg-gray-300 text-gray-600 cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Awaiting Approval
                        </button>
                      </>
                    ) : (
                      // Not Enrolled
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => navigate(`/courses/${course._id}`)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all text-sm"
                          >
                            Enroll Now
                          </button>
                          <button
                            onClick={() => navigate(`/courses/${course._id}`)}
                            className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all text-sm"
                          >
                            View Details
                          </button>
                        </div>
                        <button
                          onClick={() => !isInCart(course._id) && addToCart(course)}
                          disabled={isInCart(course._id)}
                          className={`w-full px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                            isInCart(course._id)
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {isInCart(course._id) ? 'In Cart' : 'Add to Cart'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
