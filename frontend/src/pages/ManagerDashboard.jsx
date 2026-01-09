import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PermissionGuard from '../components/PermissionGuard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Users, Briefcase, BookOpen, UserCheck, Shield, Award,
  CheckCircle, XCircle, AlertCircle, TrendingUp, Search,
  Calendar, CreditCard, ChevronDown, Check, X, Camera
} from 'lucide-react';

const Badge = ({ count }) => {
  if (!count || count === 0) return null;
  return (
    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
      {count}
    </span>
  );
};

const ManagerDashboard = () => {
  const { hasPermission } = useAuth();
  const [applications, setApplications] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState(null);
  const [notificationSettings, setNotificationSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: 'all', status: 'all' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

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
      const [appsRes, enrollmentsRes, statsRes, settingsRes, requestsRes, courseRequestsRes, serviceRequestsRes] = await Promise.all([
        axios.get('/api/manager/applications'),
        axios.get('/api/manager/enrollments'),
        axios.get('/api/manager/stats'),
        axios.get('/api/manager/notification-settings'),
        axios.get('/api/manager-requests').catch(() => ({ data: [] })),
        axios.get('/api/course-requests').catch(() => ({ data: [] })),
        axios.get('/api/service-provider-requests').catch(() => ({ data: [] }))
      ]);

      // Robust data handling
      let appsData = appsRes.data?.applications || appsRes.data?.data || (Array.isArray(appsRes.data) ? appsRes.data : []);
      setApplications(appsData);

      let enrollsData = enrollmentsRes.data?.enrollments || enrollmentsRes.data?.data || (Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : []);
      setEnrollments(enrollsData);

      setStats(statsRes.data);
      setNotificationSettings(settingsRes.data);

      setPendingCounts({
        enrollments: enrollsData.filter(e => e.status === 'pending').length,
        applications: appsData.filter(a => a.status === 'pending').length,
        managerRequests: (requestsRes.data || []).filter(r => r.status === 'pending').length,
        courseRequests: (courseRequestsRes.data?.courseRequests || []).filter(r => r.status === 'pending').length,
        serviceProviderRequests: (serviceRequestsRes.data || []).filter(r => r.status === 'pending').length
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/api/manager/applications/${id}`, { status, notes: `Application ${status}` });
      showToast('success', `Application ${status} successfully!`);
      fetchData();
    } catch (error) {
      showToast('error', 'Failed to update status');
    }
  };

  const handleEnrollmentAction = async (id, action, promptMsg = '') => {
    const msg = promptMsg ? prompt(promptMsg) : '';
    try {
      await axios.put(`/api/manager/enrollments/${id}/${action}`, { message: msg });
      showToast('success', `Enrollment ${action}ed successfully.`);
      fetchData();
    } catch (error) {
      showToast('error', `Failed to ${action} enrollment`);
    }
  };

  const filteredItems = [
    ...applications.map(app => ({ ...app, itemType: 'application' })),
    ...enrollments.filter(e => e.candidate && e.course).map(e => ({
      ...e, itemType: 'enrollment', type: 'course', appliedFor: e.course?.title, date: e.appliedAt, candidate: e.candidate
    }))
  ].filter(item => {
    if (filter.type !== 'all' && item.type !== filter.type) return false;
    if (filter.status !== 'all' && item.status !== filter.status) return false;
    return true;
  }).sort((a, b) => new Date(b.date || b.appliedAt) - new Date(a.date || a.appliedAt));

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin-slow rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-body pb-20">
      <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
                Manager Dashboard
              </h1>
              <p className="text-gray-500 mt-2">Manage applications, courses, and candidates efficiently.</p>
            </div>

            <button
              onClick={async () => {
                try {
                  const newSettings = { ...notificationSettings, emailNotifications: !notificationSettings.emailNotifications };
                  await axios.put('/api/manager/notification-settings', newSettings);
                  setNotificationSettings(newSettings);
                  showToast('success', `Notifications ${newSettings.emailNotifications ? 'ON' : 'OFF'}`);
                } catch (e) { showToast('error', 'Failed to update settings'); }
              }}
              className={`px-4 py-2 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 ${notificationSettings?.emailNotifications ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
            >
              {notificationSettings?.emailNotifications ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              Email Notifications
            </button>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-fade-in-up delay-100">
          <PermissionGuard permission="canManageCourses">
            <Link to="/manager/add-course" className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="font-semibold text-gray-700">Add Course</span>
            </Link>
          </PermissionGuard>

          <PermissionGuard permission="canManageInternships">
            <Link to="/manager/add-internship" className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="font-semibold text-gray-700">Add Internship</span>
            </Link>
          </PermissionGuard>

          <PermissionGuard permission="fullAccess">
            <Link to="/manager/requests" className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 group relative overflow-visible">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Shield className="w-6 h-6" />
              </div>
              <span className="font-semibold text-gray-700">Manager Requests</span>
              <Badge count={pendingCounts.managerRequests} />
            </Link>

            <Link to="/manager/course-requests" className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 group relative overflow-visible">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <AlertCircle className="w-6 h-6" />
              </div>
              <span className="font-semibold text-gray-700">Course Requests</span>
              <Badge count={pendingCounts.courseRequests} />
            </Link>

            <Link to="/manager/service-provider-requests" className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 group relative overflow-visible">
              <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center group-hover:bg-cyan-100 transition-colors">
                <Shield className="w-6 h-6" />
              </div>
              <span className="font-semibold text-gray-700">Service Requests</span>
              <Badge count={pendingCounts.serviceProviderRequests} />
            </Link>
          </PermissionGuard>

          <PermissionGuard permission="canManageCourses">
            <Link to="/manager/enrollments" className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 group relative overflow-visible">
              <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <span className="font-semibold text-gray-700">Enrollments</span>
              <Badge count={pendingCounts.enrollments} />
            </Link>
          </PermissionGuard>

          <PermissionGuard permission="canViewAllApplications">
            <Link to="/manager/applications" className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 group relative overflow-visible">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                <Award className="w-6 h-6" />
              </div>
              <span className="font-semibold text-gray-700">Applications</span>
              <Badge count={pendingCounts.applications} />
            </Link>
          </PermissionGuard>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 animate-fade-in-up delay-200">
            <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 p-6 rounded-2xl text-white shadow-lg">
              <p className="text-white/80 text-sm font-medium mb-1">Total Applications</p>
              <h3 className="text-3xl font-bold">{stats.applications.total}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
              <p className="text-orange-600 text-sm font-medium mb-1">Pending</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.applications.pending}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
              <p className="text-green-600 text-sm font-medium mb-1">Accepted</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.applications.accepted}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
              <p className="text-red-600 text-sm font-medium mb-1">Rejected</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.applications.rejected}</h3>
            </div>
          </div>
        )}

        {/* Filters & Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up delay-300">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-600" /> Recent Activity
            </h2>

            <div className="flex gap-3">
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="px-4 py-2 bg-gray-50 border-none rounded-lg text-sm font-medium text-gray-600 focus:ring-2 focus:ring-violet-200"
              >
                <option value="all">All Types</option>
                <option value="course">Courses</option>
                <option value="internship">Internships</option>
              </select>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="px-4 py-2 bg-gray-50 border-none rounded-lg text-sm font-medium text-gray-600 focus:ring-2 focus:ring-violet-200"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied For</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Proof</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm">
                          {(item.itemType === 'application' ? item.candidateDetails?.name : item.candidate?.name)?.[0] || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {item.itemType === 'application' ? item.candidateDetails?.name : item.candidate?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.itemType === 'application' ? item.candidateDetails?.email : item.candidate?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${item.type === 'course' ? 'bg-blue-50 text-blue-600' : 'bg-fuchsia-50 text-fuchsia-600'
                        }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {item.itemType === 'application' ? item.referenceId?.title : item.appliedFor}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(item.itemType === 'application' ? item.appliedAt : item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${item.status === 'accepted' ? 'bg-green-50 text-green-600 border-green-100' :
                        item.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                          'bg-yellow-50 text-yellow-600 border-yellow-100'
                        }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.itemType === 'enrollment' && item.paymentScreenshot ? (
                        <button
                          onClick={() => { setSelectedScreenshot(item.paymentScreenshot); setShowScreenshotModal(true); }}
                          className="p-2 text-gray-400 hover:text-violet-600 transition-colors inline-flex"
                          title="View Receipt"
                        >
                          <Camera className="w-5 h-5" />
                        </button>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">

                        {item.status === 'pending' && (
                          <>
                            <button
                              onClick={() => item.itemType === 'application'
                                ? handleUpdateStatus(item._id, 'accepted')
                                : handleEnrollmentAction(item._id, 'accept', 'Message for candidate (optional):')}
                              className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                              title="Accept"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => item.itemType === 'application'
                                ? handleUpdateStatus(item._id, 'rejected')
                                : handleEnrollmentAction(item._id, 'reject', 'Reason for rejection (optional):')}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredItems.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <p>No records found matching your filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Toast Message */}
        {message.text && (
          <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl text-white font-medium animate-bounce z-50 ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}>
            {message.text}
          </div>
        )}

        {/* Screenshot Modal */}
        {showScreenshotModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowScreenshotModal(false)}>
            <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">Payment Receipt</h3>
                <button onClick={() => setShowScreenshotModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                <img src={selectedScreenshot} alt="Receipt" className="w-full h-auto rounded-lg" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
