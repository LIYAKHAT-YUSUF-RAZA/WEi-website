import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search, X, Briefcase, User, BookOpen, Clock, Calendar,
  MapPin, DollarSign, CheckCircle, AlertCircle, ArrowRight, BarChart, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { featuredInternships } from '../data/featuredData.js';

const CandidateDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState({});
  const [applicationStatuses, setApplicationStatuses] = useState({});
  const { user, logout } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Dashboard state
  const [activeTab, setActiveTab] = useState('overview'); // overview, courses, internships

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timestamp = Date.now();
        const promises = [
          axios.get(`/api/courses?t=${timestamp}`),
          axios.get(`/api/internships?t=${timestamp}`),
          axios.get(`/api/enrollments/my-enrollments?t=${timestamp}`),
          axios.get(`/api/applications/my-applications?t=${timestamp}`)
        ];

        const [coursesRes, internshipsRes, enrollmentsRes, applicationsRes] = await Promise.all(promises);

        // Process Courses
        let dbCourses = [];
        if (coursesRes.data && Array.isArray(coursesRes.data)) {
          dbCourses = coursesRes.data;
        } else if (coursesRes.data && coursesRes.data.courses && Array.isArray(coursesRes.data.courses)) {
          dbCourses = coursesRes.data.courses;
        }
        setCourses(dbCourses);

        // Process Internships
        let dbInternships = [];
        if (internshipsRes.data && Array.isArray(internshipsRes.data)) {
          dbInternships = internshipsRes.data;
        } else if (internshipsRes.data && internshipsRes.data.internships && Array.isArray(internshipsRes.data.internships)) {
          dbInternships = internshipsRes.data.internships;
        }
        setInternships(dbInternships);

        // Process Enrollments
        if (enrollmentsRes) {
          const enrollmentMap = {};
          enrollmentsRes.data.forEach(enrollment => {
            const courseId = enrollment.course?._id || enrollment.course;
            enrollmentMap[courseId] = {
              status: enrollment.status,
              enrollmentId: enrollment._id,
              appliedAt: enrollment.appliedAt,
              course: enrollment.course
            };
          });
          setEnrollments(enrollmentMap);
        }

        // Process Applications
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
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const handleEnroll = async (courseId) => {
    const enrollment = enrollments[courseId];
    if (enrollment && (enrollment.status === 'pending' || enrollment.status === 'accepted')) {
      alert('You are already involved with this course.');
      return;
    }

    try {
      const result = await addToCart(courseId, 'course');
      if (result.success) navigate('/cart');
      else alert(result.message || 'Failed to add to cart');
    } catch (error) {
      alert('Error adding course to cart');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin-slow rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  // Calculate stats
  const enrolledCount = Object.values(enrollments).filter(e => e.status === 'accepted').length;
  const applicationCount = Object.keys(applicationStatuses).length;


  return (
    <div className="min-h-screen bg-gray-50 font-body pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Manage your courses, internships, and applications.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase">Enrolled Courses</p>
                <p className="text-3xl font-bold text-gray-900">{enrolledCount}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase">Applications</p>
                <p className="text-3xl font-bold text-gray-900">{applicationCount}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden border border-gray-200">
          <div className="flex border-b border-gray-200">
            {['overview', 'courses', 'internships'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium capitalize transition-colors ${activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* My Enrollments */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">My Enrollments</h2>
                <button onClick={() => setActiveTab('courses')} className="text-blue-600 text-sm font-medium hover:underline">
                  View All Courses
                </button>
              </div>

              {Object.values(enrollments).length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.values(enrollments).map((enrollment) => {
                    const course = typeof enrollment.course === 'object' ? enrollment.course : courses.find(c => c._id === enrollment.course);
                    if (!course) return null;

                    return (
                      <div key={enrollment.enrollmentId} className="bg-white rounded-lg shadow p-5 border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-900">{course.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(enrollment.status)}`}>
                            {enrollment.status}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{course.description}</p>
                        <div className="text-xs text-gray-400">
                          Applied: {new Date(enrollment.appliedAt).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500 border border-dashed border-gray-300">
                  <p>You haven't enrolled in any courses yet.</p>
                  <button onClick={() => setActiveTab('courses')} className="mt-2 text-blue-600 font-bold hover:underline">Browse Courses</button>
                </div>
              )}
            </div>

            {/* Recent Applications */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Recent Applications</h2>
                <button onClick={() => setActiveTab('internships')} className="text-blue-600 text-sm font-medium hover:underline">
                  Find Internships
                </button>
              </div>

              {Object.values(applicationStatuses).length > 0 ? (
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(applicationStatuses).map(([refId, status], idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{refId.substring(0, 8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(status.appliedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status.status)}`}>
                              {status.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500 border border-dashed border-gray-300">
                  <p>No internship applications found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => {
                const enrollment = enrollments[course._id];
                // Calculate savings
                const savings = course.originalPrice - course.price;
                const discount = course.discountPercentage;

                return (
                  <div key={course._id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full transform hover:-translate-y-1">

                    {/* Image Section */}
                    <div className="relative h-52 overflow-hidden bg-gray-100">
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
                      <img
                        src={course.thumbnail || 'https://via.placeholder.com/400x200'}
                        alt={course.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* Category Pill */}
                      <span className="absolute top-4 left-4 z-20 px-3 py-1 bg-blue-100/90 backdrop-blur text-blue-700 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm">
                        {course.category || 'Development'}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col flex-grow relative bg-white">

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 font-heading leading-tight">{course.title}</h3>

                      {/* Instructor */}
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                        <User className="w-4 h-4 text-blue-500" />
                        <span>Instructor: <span className="text-blue-600 font-semibold uppercase hover:underline cursor-pointer">Liyakhat</span></span>
                      </div>

                      {/* Meta Row */}
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-4 border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-red-500" />
                          <span>{course.duration || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-auto">
                          <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">{course.level || 'Beginner'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-gray-700">4.8</span>
                        </div>
                      </div>

                      {/* Impressive Price Section */}
                      <div className="flex justify-between items-start mb-6 relative min-h-[70px]">
                        <div className="flex flex-col justify-center">
                          {/* Original Price with Sequential Strike Animation */}
                          <div className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
                            Regular Price:
                            <span className="text-gray-400 text-sm animate-strike relative inline-block">
                              ₹{course.originalPrice}
                            </span>
                          </div>

                          {/* Discount Price with Pop-in Animation */}
                          <div className="flex items-end gap-2 mt-0.5 animate-price-pop">
                            <div className="flex flex-col leading-none justify-end pb-1">
                              <span className="text-[10px] uppercase font-bold text-green-600">Special</span>
                              <span className="text-[10px] uppercase font-bold text-green-600">Price:</span>
                            </div>
                            <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 leading-none tracking-tight drop-shadow-sm">
                              ₹{course.price}
                            </span>
                          </div>
                        </div>

                        {/* Discount Badge - Animated */}
                        {discount > 0 && (
                          <div className="bg-gradient-to-br from-rose-500 via-red-500 to-pink-600 text-white rounded-lg p-1.5 flex flex-col items-center justify-center w-[65px] h-[75px] shadow-lg shadow-rose-200/50 absolute -top-4 right-0 animate-discount-swing">
                            <div className="mb-0.5"><Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse" /></div>
                            <div className="text-xl font-black leading-none tracking-tighter filter drop-shadow-md">{discount}%</div>
                            <div className="text-[9px] font-bold uppercase mt-0.5 tracking-wider">OFF</div>
                          </div>
                        )}
                      </div>

                      {/* Savings Pill */}
                      {savings > 0 && (
                        <div className="bg-green-50 text-green-700 text-xs font-bold py-2 px-3 rounded-lg text-center mb-5 flex items-center justify-center gap-2 border border-green-200 w-full shadow-sm animate-fade-in-up delay-300">
                          <span>🎉</span> You Save ₹{savings}!
                        </div>
                      )}

                      {/* Action Buttons Group */}
                      <div className="flex gap-3 mb-3">
                        <button
                          onClick={() => handleEnroll(course._id)}
                          disabled={!!enrollment}
                          className={`flex-1 py-2.5 rounded-lg font-bold text-sm text-white shadow-md transition-all active:scale-95 ${enrollment
                            ? 'bg-indigo-400 cursor-not-allowed'
                            : 'bg-[#6366f1] hover:bg-indigo-700 hover:shadow-indigo-200'
                            }`}
                        >
                          {enrollment ? 'Enrolled' : 'Enroll Now'}
                        </button>
                        <button className="flex-1 py-2.5 rounded-lg font-bold text-sm text-blue-600 border-2 border-blue-600 hover:bg-blue-50 transition-all active:scale-95">
                          View Details
                        </button>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => !enrollment && addToCart(course)}
                        disabled={!!enrollment}
                        className={`w-full py-3 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${enrollment
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-[#22c55e] hover:bg-green-600 hover:shadow-green-200'
                          }`}
                      >
                        {enrollment ? (
                          <>Already Enrolled</>
                        ) : (
                          <>
                            <DollarSign className="w-5 h-5" /> Add to Cart
                          </>
                        )}
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Internships Tab */}
        {activeTab === 'internships' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Open Internships</h2>
            <div className="grid gap-6">
              {internships.map(internship => (
                <div key={internship._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition-shadow">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-bold text-gray-900">{internship.title}</h3>
                    <p className="text-gray-600 font-medium">{internship.company?.name || 'WEintegrity'}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {internship.location}</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {internship.stipend}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {internship.duration}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/internships/${internship._id}`)}
                    className="px-6 py-2 border border-blue-600 text-blue-600 font-medium rounded hover:bg-blue-50 transition-colors whitespace-nowrap"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );

};

export default CandidateDashboard;
