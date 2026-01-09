import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Calendar, Briefcase, BookOpen, GraduationCap } from 'lucide-react';

const ApplicationHistory = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, courses, internships
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, accepted, rejected
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enrollmentsRes, applicationsRes] = await Promise.all([
        axios.get('/api/enrollments/my-enrollments'),
        axios.get('/api/applications/my-applications')
      ]);

      setEnrollments(enrollmentsRes.data);
      setApplications(applicationsRes.data.filter(app => app.type === 'internship'));
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch history:', error);
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
        return 'Accepted';
      case 'pending':
        return 'Pending Review';
      case 'rejected':
        return 'Rejected';
      case 'payment_pending':
        return 'Payment Pending';
      default:
        return status;
    }
  };

  // Combine and filter data
  const getCombinedData = () => {
    let items = [];

    if (activeTab === 'all' || activeTab === 'courses') {
      items = [...items, ...enrollments.map(e => ({
        ...e,
        type: 'course',
        title: e.course?.title,
        description: e.course?.description,
        thumbnail: e.course?.thumbnail,
        level: e.course?.level,
        duration: e.course?.duration,
        price: e.course?.price,
        id: e._id,
        itemId: e.course?._id
      }))];
    }

    if (activeTab === 'all' || activeTab === 'internships') {
      items = [...items, ...applications.map(a => ({
        ...a,
        type: 'internship',
        title: a.internship?.title,
        description: a.internship?.description,
        thumbnail: a.internship?.image,
        company: a.internship?.company,
        location: a.internship?.location,
        duration: a.internship?.duration,
        stipend: a.internship?.stipend,
        id: a._id,
        itemId: a.internship?._id
      }))];
    }

    // Filter by status
    if (statusFilter !== 'all') {
      items = items.filter(item => item.status === statusFilter);
    }

    // Sort by date
    items.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    return items;
  };

  const combinedData = getCombinedData();

  // Count statistics
  const stats = {
    totalCourses: enrollments.length,
    totalInternships: applications.length,
    pendingCourses: enrollments.filter(e => e.status === 'pending').length,
    acceptedCourses: enrollments.filter(e => e.status === 'accepted').length,
    pendingInternships: applications.filter(a => a.status === 'pending').length,
    acceptedInternships: applications.filter(a => a.status === 'accepted').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading your application history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-24">
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Application History</h1>
          <p className="text-xl text-blue-100">Track all your course enrollments and internship applications</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Course Enrollments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Internship Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInternships}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.acceptedCourses + stats.acceptedInternships}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingCourses + stats.pendingInternships}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <GraduationCap className="w-5 h-5" />
              All ({enrollments.length + applications.length})
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'courses'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <BookOpen className="w-5 h-5" />
              Courses ({enrollments.length})
            </button>
            <button
              onClick={() => setActiveTab('internships')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'internships'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <Briefcase className="w-5 h-5" />
              Internships ({applications.length})
            </button>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-3">
            <span className="text-gray-700 font-medium self-center">Filter by Status:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('accepted')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'accepted'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Accepted
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Applications List */}
        {combinedData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-600">
              {statusFilter === 'all'
                ? "You haven't applied for any courses or internships yet."
                : `No ${statusFilter} applications found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {combinedData.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full md:w-48 h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className={`w-full md:w-48 h-32 bg-gradient-to-br ${item.type === 'course'
                            ? 'from-blue-500 to-purple-600'
                            : 'from-purple-500 to-pink-600'
                          } rounded-lg flex items-center justify-center`}>
                          {item.type === 'course' ? (
                            <BookOpen className="w-12 h-12 text-white opacity-50" />
                          ) : (
                            <Briefcase className="w-12 h-12 text-white opacity-50" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.type === 'course'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                              }`}>
                              {item.type === 'course' ? '📚 Course' : '💼 Internship'}
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {item.title || 'Title Not Available'}
                          </h3>
                          <p className="text-gray-600 line-clamp-2 mb-3">
                            {item.description || 'No description available'}
                          </p>

                          {/* Type-specific details */}
                          {item.type === 'course' && (
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {item.duration || 'N/A'}
                              </span>
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                {item.level || 'Beginner'}
                              </span>
                              {item.price > 0 && (
                                <span className="font-semibold text-green-600">
                                  ₹{item.price}
                                </span>
                              )}
                            </div>
                          )}

                          {item.type === 'internship' && (
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              {item.company && (
                                <span className="font-medium">{item.company}</span>
                              )}
                              {item.location && (
                                <span>📍 {item.location}</span>
                              )}
                              {item.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {item.duration}
                                </span>
                              )}
                              {item.stipend && (
                                <span className="font-semibold text-green-600">
                                  ₹{item.stipend}/month
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className={`px-4 py-2 rounded-full border-2 flex items-center gap-2 ${getStatusColor(item.status)} whitespace-nowrap`}>
                          {getStatusIcon(item.status)}
                          <span className="font-semibold">{getStatusText(item.status)}</span>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            Applied: {new Date(item.appliedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {item.reviewedAt && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">
                              Reviewed: {new Date(item.reviewedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => navigate(item.type === 'course'
                            ? `/courses/${item.itemId}`
                            : `/internships/${item.itemId}`
                          )}
                          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                        >
                          View {item.type === 'course' ? 'Course' : 'Internship'}
                        </button>
                        {item.status === 'accepted' && item.type === 'course' && (
                          <button
                            onClick={() => navigate(`/instructor/${item.itemId}`)}
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

export default ApplicationHistory;
