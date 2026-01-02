import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';

const EnrollmentHistory = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await axios.get('/api/enrollments/my-enrollments');
      setEnrollments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch enrollment history:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'payment_pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      case 'payment_pending':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'accepted':
        return 'Enrolled';
      case 'pending':
        return 'Pending Approval';
      case 'rejected':
        return 'Rejected';
      case 'payment_pending':
        return 'Payment Pending';
      default:
        return status;
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    if (filter === 'all') return true;
    return enrollment.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading enrollment history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <button
            onClick={() => navigate('/candidate/dashboard')}
            className="flex items-center gap-2 mb-6 hover:text-blue-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Enrollment History</h1>
          <p className="text-xl text-blue-100">View all your course enrollment requests and their status</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Status</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({enrollments.length})
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                filter === 'accepted'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Enrolled ({enrollments.filter(e => e.status === 'accepted').length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                filter === 'pending'
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({enrollments.filter(e => e.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                filter === 'rejected'
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected ({enrollments.filter(e => e.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* Enrollments List */}
        {filteredEnrollments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Enrollments Found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You haven't enrolled in any courses yet."
                : `No ${filter} enrollments found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEnrollments.map((enrollment) => (
              <div
                key={enrollment._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Course Image */}
                    <div className="flex-shrink-0">
                      {enrollment.course?.thumbnail ? (
                        <img
                          src={enrollment.course.thumbnail}
                          alt={enrollment.course?.title}
                          className="w-full md:w-48 h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full md:w-48 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-4xl font-bold text-white opacity-50">
                            {enrollment.course?.title?.charAt(0) || 'C'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {enrollment.course?.title || 'Course Title'}
                          </h3>
                          <p className="text-gray-600 line-clamp-2">
                            {enrollment.course?.description || 'No description available'}
                          </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full border-2 flex items-center gap-2 ${getStatusColor(enrollment.status)} whitespace-nowrap`}>
                          {getStatusIcon(enrollment.status)}
                          <span className="font-semibold">{getStatusText(enrollment.status)}</span>
                        </div>
                      </div>

                      {/* Enrollment Details */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            Applied: {new Date(enrollment.appliedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {enrollment.respondedAt && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">
                              Responded: {new Date(enrollment.respondedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                        {enrollment.courseStartDate && enrollment.status === 'accepted' && (
                          <div className="flex items-center gap-2 text-green-600 font-semibold">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">
                              Course Started: {new Date(enrollment.courseStartDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Payment & Course Status */}
                      {enrollment.status === 'accepted' && enrollment.paymentStatus === 'completed' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-green-900">✅ Payment Completed & Course Active</p>
                              <p className="text-sm text-green-700 mt-1">
                                You have full access to all course materials and can start learning immediately.
                              </p>
                              {enrollment.paidAt && (
                                <p className="text-xs text-green-600 mt-2">
                                  Payment received: {new Date(enrollment.paidAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Course Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {enrollment.course?.duration || 'N/A'}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                          {enrollment.course?.level || 'Beginner'}
                        </span>
                        {enrollment.course?.price > 0 && (
                          <span className="font-semibold text-green-600">
                            ₹{enrollment.course.price}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => navigate(`/courses/${enrollment.course?._id}`)}
                          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                        >
                          View Course
                        </button>
                        {enrollment.status === 'accepted' && (
                          <button
                            onClick={() => navigate(`/instructor/${enrollment.course?._id}`)}
                            className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all"
                          >
                            View Instructor
                          </button>
                        )}
                      </div>
                    </div>
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

export default EnrollmentHistory;
