import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/public/Navbar.jsx';
import PermissionGuard from '../components/PermissionGuard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Badge component to show pending counts
const Badge = ({ count }) => {
  if (!count || count === 0) return null;
  return (
    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-y-0.5 bg-red-600 rounded-full">
      {count}
    </span>
  );
};

const ManagerDashboard = () => {
  const { hasPermission, hasFullAccess } = useAuth();
  const [applications, setApplications] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState(null);
  const [notificationSettings, setNotificationSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: 'all', status: 'all' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  
  // Pending counts for badge notifications
  const [pendingCounts, setPendingCounts] = useState({
    enrollments: 0,
    applications: 0,
    managerRequests: 0,
    courseRequests: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appsRes, enrollmentsRes, statsRes, settingsRes, requestsRes, courseRequestsRes] = await Promise.all([
        axios.get('/api/manager/applications'),
        axios.get('/api/manager/enrollments'),
        axios.get('/api/manager/stats'),
        axios.get('/api/manager/notification-settings'),
        axios.get('/api/manager-requests').catch(() => ({ data: [] })),
        axios.get('/api/course-requests').catch(() => ({ data: [] }))
      ]);
      
      setApplications(appsRes.data);
      setEnrollments(enrollmentsRes.data);
      setStats(statsRes.data);
      setNotificationSettings(settingsRes.data);
      
      // Calculate pending counts
      const pendingEnrollments = enrollmentsRes.data.filter(e => e.status === 'pending').length;
      const pendingApplications = appsRes.data.filter(a => a.status === 'pending').length;
      const pendingRequests = (requestsRes.data || []).filter(r => r.status === 'pending').length;
      const courseRequestsList = courseRequestsRes.data?.courseRequests || [];
      const pendingCourseRequests = courseRequestsList.filter(r => r.status === 'pending').length;
      
      setPendingCounts({
        enrollments: pendingEnrollments,
        applications: pendingApplications,
        managerRequests: pendingRequests,
        courseRequests: pendingCourseRequests
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId, status, notes = '') => {
    try {
      await axios.put(`/api/manager/applications/${applicationId}`, {
        status,
        notes
      });
      
      setMessage({ type: 'success', text: `Application ${status} successfully!` });
      fetchData(); // Refresh data
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update application status' });
    }
  };

  const handleAcceptEnrollment = async (enrollmentId) => {
    const messageText = prompt('Add a message for the candidate (optional):');
    try {
      await axios.put(`/api/manager/enrollments/${enrollmentId}/accept`, { 
        message: messageText || '' 
      });
      setMessage({ type: 'success', text: 'Enrollment accepted! Email sent to candidate.' });
      fetchData();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to accept enrollment' });
    }
  };

  const handleRejectEnrollment = async (enrollmentId) => {
    const messageText = prompt('Add a reason for rejection (optional):');
    try {
      await axios.put(`/api/manager/enrollments/${enrollmentId}/reject`, { 
        message: messageText || '' 
      });
      setMessage({ type: 'success', text: 'Enrollment rejected. Email sent to candidate.' });
      fetchData();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reject enrollment' });
    }
  };

  const handleUnenrollCandidate = async (enrollmentId) => {
    const confirmUnenroll = window.confirm('Are you sure you want to unenroll this candidate from the course?');
    if (!confirmUnenroll) return;

    const reason = prompt('Enter reason for unenrollment (optional):');
    
    try {
      await axios.delete(`/api/manager/enrollments/${enrollmentId}/unenroll`, {
        data: { message: reason }
      });
      
      setMessage({ type: 'success', text: 'Candidate unenrolled successfully. Email sent to candidate.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to unenroll candidate' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleToggleNotifications = async () => {
    try {
      const newSettings = {
        ...notificationSettings,
        emailNotifications: !notificationSettings.emailNotifications
      };
      
      await axios.put('/api/manager/notification-settings', newSettings);
      setNotificationSettings(newSettings);
      setMessage({ 
        type: 'success', 
        text: `Email notifications ${newSettings.emailNotifications ? 'enabled' : 'disabled'}` 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update notification settings' });
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter.type !== 'all' && app.type !== filter.type) return false;
    if (filter.status !== 'all' && app.status !== filter.status) return false;
    return true;
  });

  const filteredEnrollments = enrollments.filter(enrollment => {
    if (filter.type !== 'all' && filter.type !== 'course') return false;
    if (filter.status !== 'all' && enrollment.status !== filter.status) return false;
    return true;
  });

  // Combine applications and enrollments
  const allItems = [
    ...filteredApplications.map(app => ({ ...app, itemType: 'application' })),
    ...filteredEnrollments
      .filter(enrollment => enrollment.candidate && enrollment.course) // Filter out items with missing data
      .map(enrollment => ({ 
        ...enrollment, 
        itemType: 'enrollment',
        type: 'course',
        appliedFor: enrollment.course?.title || 'N/A',
        date: enrollment.appliedAt,
        candidate: enrollment.candidate
      }))
  ].sort((a, b) => new Date(b.date || b.appliedAt) - new Date(a.date || a.appliedAt));

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Manager Dashboard</h1>
          <div className="flex gap-3 flex-wrap">
            <PermissionGuard permission="canManageCourses">
              <Link
                to="/manager/add-course"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 text-sm"
              >
                ➕ Add Course
              </Link>
              <Link
                to="/manager/courses"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 text-sm"
              >
                📚 Manage Courses
              </Link>
            </PermissionGuard>
            
            <PermissionGuard permission="canManageInternships">
              <Link
                to="/manager/add-internship"
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 text-sm"
              >
                ➕ Add Internship
              </Link>
              <Link
                to="/manager/internships"
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 text-sm"
              >
                💼 Manage Internships
              </Link>
            </PermissionGuard>
            
            <PermissionGuard permission="canManageCourses">
              <Link
                to="/manager/instructors"
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 text-sm"
              >
                👨‍🏫 Manage Instructors
              </Link>
            </PermissionGuard>
            
            <PermissionGuard permission="fullAccess">
              <Link
                to="/manager/requests"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 relative"
              >
                👥 Manager Requests
                <Badge count={pendingCounts.managerRequests} />
              </Link>
              <Link
                to="/manager/manage-managers"
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                ⚙️ Manage Managers
              </Link>
              <Link
                to="/manager/manage-candidates"
                className="px-6 py-2 bg-gradient-to-r from-teal-600 to-green-600 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
              >
                👤 Manage Candidates
              </Link>
              <Link
                to="/manager/course-requests"
                className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 relative"
              >
                📋 Course Requests
                <Badge count={pendingCounts.courseRequests} />
              </Link>
            </PermissionGuard>
            
            <PermissionGuard permission="canManageCourses">
              <Link
                to="/manager/enrollments"
                className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 relative"
              >
                📝 Course Enrollments
                <Badge count={pendingCounts.enrollments} />
              </Link>
            </PermissionGuard>
            
            <PermissionGuard permission="canViewAllApplications">
              <Link
                to="/manager/applications"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 relative"
              >
                💼 Internship Applications
                <Badge count={pendingCounts.applications} />
              </Link>
            </PermissionGuard>
            
            <PermissionGuard permission="canManageNotifications">
              <button
                onClick={handleToggleNotifications}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  notificationSettings?.emailNotifications
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-400 text-white hover:bg-gray-500'
                }`}
              >
                {notificationSettings?.emailNotifications ? '🔔 Notifications ON' : '🔕 Notifications OFF'}
              </button>
            </PermissionGuard>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-sm text-gray-500 mb-1">Total Applications</p>
              <p className="text-3xl font-bold text-primary-600">{stats.applications.total}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-sm text-gray-500 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.applications.pending}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-sm text-gray-500 mb-1">Accepted</p>
              <p className="text-3xl font-bold text-green-600">{stats.applications.accepted}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-sm text-gray-500 mb-1">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{stats.applications.rejected}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Types</option>
                <option value="course">Courses</option>
                <option value="internship">Internships</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied For
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.itemType === 'application' 
                            ? item.candidateDetails?.name || 'N/A'
                            : item.candidate?.name || 'N/A'
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.itemType === 'application' 
                            ? item.candidateDetails?.email || 'N/A'
                            : item.candidate?.email || 'N/A'
                          }
                        </div>
                        {item.itemType === 'enrollment' && item.candidate?.phone && (
                          <div className="text-sm text-gray-500">
                            📞 {item.candidate.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {item.itemType === 'application' 
                          ? (item.referenceDetails?.title || 'N/A')
                          : item.appliedFor
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {item.itemType === 'enrollment' && item.course?.price 
                          ? `₹${item.course.price}`
                          : item.itemType === 'application' && item.referenceDetails?.price
                          ? `₹${item.referenceDetails.price}`
                          : <span className="text-gray-400">N/A</span>
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.itemType === 'application' ? item.appliedAt : item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(item.status)}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.itemType === 'enrollment' && item.paymentScreenshot ? (
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              setSelectedScreenshot(item.paymentScreenshot);
                              setShowScreenshotModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 font-medium flex items-center gap-1"
                          >
                            📷 View Receipt
                          </button>
                          {item.paymentAmount && (
                            <div className="text-xs text-green-600 font-semibold">
                              ₹{item.paymentAmount} Paid
                            </div>
                          )}
                          {item.paidAt && (
                            <div className="text-xs text-gray-500">
                              {new Date(item.paidAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No Payment</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {item.status === 'pending' && (
                        <div className="flex space-x-2">
                          {item.itemType === 'application' ? (
                            <PermissionGuard permission="canApproveApplications">
                              <button
                                onClick={() => handleUpdateStatus(item._id, 'accepted', 'Application accepted')}
                                className="text-green-600 hover:text-green-900"
                              >
                                ✓ Accept
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(item._id, 'rejected', 'Application rejected')}
                                className="text-red-600 hover:text-red-900"
                              >
                                ✗ Reject
                              </button>
                            </PermissionGuard>
                          ) : (
                            <PermissionGuard permission="canManageCourses">
                              <button
                                onClick={() => handleAcceptEnrollment(item._id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                ✓ Accept
                              </button>
                              <button
                                onClick={() => handleRejectEnrollment(item._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                ✗ Reject
                              </button>
                            </PermissionGuard>
                          )}
                        </div>
                      )}
                      {item.status === 'accepted' && item.itemType === 'enrollment' && (
                        <PermissionGuard permission="canManageCourses">
                          <button
                            onClick={() => handleUnenrollCandidate(item._id)}
                            className="text-orange-600 hover:text-orange-900 font-medium"
                          >
                            🚫 Unenroll
                          </button>
                        </PermissionGuard>
                      )}
                      {item.status !== 'pending' && !(item.status === 'accepted' && item.itemType === 'enrollment') && (
                        <span className="text-gray-400">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {allItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No applications or enrollments found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Screenshot Modal */}
      {showScreenshotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">📷 Payment Receipt/Screenshot</h3>
              <button
                onClick={() => {
                  setShowScreenshotModal(false);
                  setSelectedScreenshot(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {selectedScreenshot ? (
                <>
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>📝 Note:</strong> Review the payment details carefully before accepting the enrollment request. 
                      Once accepted, the candidate will gain access to the course materials.
                    </p>
                  </div>
                  <img 
                    src={selectedScreenshot} 
                    alt="Payment Receipt" 
                    className="w-full h-auto rounded-lg shadow-lg border-2 border-gray-200"
                  />
                </>
              ) : (
                <p className="text-gray-500 text-center">No screenshot available</p>
              )}
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => {
                  setShowScreenshotModal(false);
                  setSelectedScreenshot(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
