import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, X, Filter, BookOpen, Clock, BarChart, CheckCircle, AlertCircle } from 'lucide-react';
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
    const fetchData = async () => {
      try {
        const promises = [axios.get('/api/courses')];

        // Only fetch enrollments if user is logged in
        if (user) {
          promises.push(axios.get('/api/enrollments/my-enrollments').catch(() => ({ data: [] })));
        }

        const [coursesRes, enrollmentsRes] = await Promise.all(promises);

        let courseData = [];
        if (coursesRes.data && Array.isArray(coursesRes.data)) {
          courseData = coursesRes.data;
        } else if (coursesRes.data?.courses && Array.isArray(coursesRes.data.courses)) {
          courseData = coursesRes.data.courses;
        } else if (coursesRes.data?.data && Array.isArray(coursesRes.data.data)) {
          courseData = coursesRes.data.data;
        }
        setCourses(courseData);
        setFilteredCourses(courseData);

        const enrollmentMap = {};
        if (enrollmentsRes?.data && Array.isArray(enrollmentsRes.data)) {
          enrollmentsRes.data.forEach(enrollment => {
            const courseId = enrollment.course?._id || enrollment.course;
            enrollmentMap[courseId] = enrollment.status;
          });
        }
        setEnrollments(enrollmentMap);

      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    let filtered = courses;
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }
    if (selectedLevel !== 'All') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }
    setFilteredCourses(filtered);
  }, [searchQuery, selectedCategory, selectedLevel, courses]);

  const categories = ['All', ...new Set(courses.map(c => c.category))];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin-slow rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-body">

      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Courses</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Upgrade your skills with our premium selection of courses designed for modern careers.
          </p>
        </div>

        {/* Filters */}
        <div className="glass-panel p-4 rounded-2xl mb-12 flex flex-col md:flex-row gap-4 items-center animate-fade-in-up delay-100">
          <div className="relative flex-grow w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-violet-200 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-violet-200 transition-all font-medium appearance-none cursor-pointer"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="relative flex-1 md:flex-none">
              <BarChart className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-violet-200 transition-all font-medium appearance-none cursor-pointer"
              >
                {levels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up delay-200">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => {
              const enrollmentStatus = enrollments[course._id];
              const inCart = isInCart(course._id);

              return (
                <div key={course._id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <Link to={`/courses/${course._id}`} className="block relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <img
                      src={course.thumbnail || `https://source.unsplash.com/random/800x600?${course.category}`}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-violet-700 shadow-lg">
                        {course.category}
                      </span>
                    </div>
                    {(course.discountPercentage > 0) && (
                      <div className="absolute top-4 right-4 z-20 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg rotate-3">
                        {course.discountPercentage}% OFF
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 z-20 text-white">
                      <div className="flex items-center gap-2 text-xs font-medium opacity-90 mb-1">
                        <Clock className="w-3 h-3" /> {course.duration}
                      </div>
                      <h3 className="text-xl font-bold font-heading line-clamp-1">{course.title}</h3>
                    </div>
                  </Link>

                  <div className="p-6">
                    <p className="text-gray-500 text-sm line-clamp-2 mb-6 h-10">{course.description}</p>

                    <div className="flex items-end justify-between mb-6">
                      <div>
                        {course.originalPrice > course.price ? (
                          <>
                            <div className="text-xs text-gray-400 line-through">₹{course.originalPrice}</div>
                            <div className="text-2xl font-bold text-gray-900">₹{course.price}</div>
                          </>
                        ) : (
                          <div className="text-2xl font-bold text-gray-900">₹{course.price}</div>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-violet-600 bg-violet-50 px-3 py-1 rounded-lg">
                        {course.level}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => navigate(`/courses/${course._id}`)}
                        className="px-4 py-2.5 rounded-xl font-bold text-sm border-2 border-gray-100 text-gray-600 hover:border-violet-600 hover:text-violet-600 transition-all"
                      >
                        Details
                      </button>

                      {enrollmentStatus === 'accepted' ? (
                        <button disabled className="px-4 py-2.5 rounded-xl font-bold text-sm bg-green-100 text-green-700 flex items-center justify-center gap-2 cursor-default">
                          <CheckCircle className="w-4 h-4" /> Enrolled
                        </button>
                      ) : enrollmentStatus === 'pending' ? (
                        <button disabled className="px-4 py-2.5 rounded-xl font-bold text-sm bg-yellow-100 text-yellow-700 flex items-center justify-center gap-2 cursor-default">
                          <Clock className="w-4 h-4" /> Pending
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (!user) {
                              navigate('/login', { state: { from: '/courses' } });
                            } else if (!inCart) {
                              addToCart(course);
                            }
                          }}
                          disabled={user && inCart}
                          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-200 flex items-center justify-center gap-2 ${user && inCart
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90 hover:scale-105'
                            }`}
                        >
                          {user && inCart ? 'In Cart' : 'Enroll Now'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <BookOpen className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No courses found</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;
