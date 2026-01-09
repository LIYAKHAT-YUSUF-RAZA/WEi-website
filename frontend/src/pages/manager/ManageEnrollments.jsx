import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, Mail, User, BookOpen, Calendar } from 'lucide-react';

const ManageEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrollments();
    fetchStats();
  }, [filter]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      // Always fetch from the main endpoint - it handles all statuses
      const response = await axios.get('/api/manager/enrollments');

      // Filter client-side if needed
      let filteredData = response.data;
      if (filter !== 'all') {
        filteredData = response.data.filter(e => e.status === filter);
      }

      setEnrollments(filteredData);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/manager/enrollments/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAccept = async (enrollmentId) => {
    try {
      await axios.put(`/api/manager/enrollments/${enrollmentId}/accept`, { message });
      alert('Enrollment accepted successfully! Email sent to candidate.');
      setSelectedEnrollment(null);
      setMessage('');
      fetchEnrollments();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Error accepting enrollment');
    }
  };

  const handleReject = async (enrollmentId) => {
    if (!message.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    try {
      await axios.put(`/api/manager/enrollments/${enrollmentId}/reject`, { message });
      alert('Enrollment rejected. Email sent to candidate.');
      setSelectedEnrollment(null);
      setMessage('');
      fetchEnrollments();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Error rejecting enrollment');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" />, text: 'Pending' },
      accepted: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" />, text: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" />, text: 'Rejected' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${badge.color}`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading enrollments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Course Enrollment Requests</h1>
          <p className="text-gray-600">Review and manage candidate enrollment requests</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <BookOpen className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Accepted</p>
                <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex gap-2">
            {['all', 'pending', 'accepted', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Enrollments List */}
        <div className="space-y-4">
          {enrollments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg">No enrollment requests found</p>
            </div>
          ) : (
            enrollments.map((enrollment) => (
              <div key={enrollment._id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {enrollment.course?.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{enrollment.candidate?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{enrollment.candidate?.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Applied: {new Date(enrollment.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(enrollment.status)}
                    </div>
                  </div>

                  {enrollment.course && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Course Details:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Category:</span>
                          <p className="font-semibold">{enrollment.course.category}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Level:</span>
                          <p className="font-semibold">{enrollment.course.level}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <p className="font-semibold">{enrollment.course.duration}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Price:</span>
                          <p className="font-semibold">₹{enrollment.course.price}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {enrollment.message && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Manager's Response:</h4>
                      <p className="text-gray-700">{enrollment.message}</p>
                    </div>
                  )}

                  {enrollment.documents && enrollment.documents.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-700 mb-3">Documents:</h4>
                      <div className="space-y-2">
                        {enrollment.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {doc.type === 'payment_receipt' ? 'Payment Receipt' :
                                  doc.type === 'screenshot' ? 'Screenshot' :
                                    doc.type === 'certificate' ? 'Certificate' : 'Document'}
                              </span>
                            </div>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              View
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {enrollment.status === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setSelectedEnrollment(enrollment._id)}
                        className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEnrollment(enrollment._id);
                          setMessage('');
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </div>
                  )}

                  {enrollment.status !== 'pending' && enrollment.respondedAt && (
                    <div className="text-sm text-gray-600 mt-4">
                      <p>Responded on: {new Date(enrollment.respondedAt).toLocaleString()}</p>
                      {enrollment.respondedBy && (
                        <p>By: {enrollment.respondedBy.name}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Modal */}
                {selectedEnrollment === enrollment._id && (
                  <div className="border-t bg-gray-50 p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Add a message (optional):</h4>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter a message for the candidate..."
                      className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(enrollment._id)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
                      >
                        Confirm Accept
                      </button>
                      <button
                        onClick={() => handleReject(enrollment._id)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
                      >
                        Confirm Reject
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEnrollment(null);
                          setMessage('');
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageEnrollments;
