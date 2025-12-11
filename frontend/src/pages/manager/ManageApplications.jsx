import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, Mail, User, Briefcase, Calendar, FileText } from 'lucide-react';

const ManageApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const queryParam = filter !== 'all' ? `?status=${filter}` : '';
      const response = await axios.get(`/api/manager/applications${queryParam}`);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/manager/applications/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAccept = async (applicationId) => {
    try {
      await axios.put(`/api/manager/applications/${applicationId}`, { 
        status: 'accepted',
        message 
      });
      alert('Application accepted successfully! Email sent to candidate.');
      setSelectedApplication(null);
      setMessage('');
      fetchApplications();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Error accepting application');
    }
  };

  const handleReject = async (applicationId) => {
    if (!message.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    try {
      await axios.put(`/api/manager/applications/${applicationId}`, { 
        status: 'rejected',
        message 
      });
      alert('Application rejected. Email sent to candidate.');
      setSelectedApplication(null);
      setMessage('');
      fetchApplications();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Error rejecting application');
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
        <div className="text-xl">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/manager/dashboard')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Internship Application Requests</h1>
          <p className="text-gray-600">Review and manage internship applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Briefcase className="w-12 h-12 text-blue-500" />
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

        {/* Filter Buttons */}
        <div className="mb-6">
          <div className="flex gap-4">
            {['all', 'pending', 'accepted', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg">No application requests found</p>
            </div>
          ) : (
            applications.map((application) => (
              <div key={application._id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {application.referenceId?.title || 'Internship Application'}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{application.candidateId?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{application.candidateId?.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(application.status)}
                    </div>
                  </div>

                  {application.referenceId && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Internship Details:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Department:</span>
                          <p className="font-semibold">{application.referenceId.department}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <p className="font-semibold">{application.referenceId.location}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <p className="font-semibold">{application.referenceId.type}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <p className="font-semibold">{application.referenceId.duration}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {application.candidateDetails && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Candidate Details:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {application.candidateDetails.education && (
                          <div>
                            <span className="text-gray-600">Education:</span>
                            <p className="font-medium text-gray-800">{application.candidateDetails.education}</p>
                          </div>
                        )}
                        {application.candidateDetails.experience && (
                          <div>
                            <span className="text-gray-600">Experience:</span>
                            <p className="font-medium text-gray-800">{application.candidateDetails.experience}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {application.documents && application.documents.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Documents:
                      </h4>
                      <div className="space-y-2">
                        {application.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {doc.type === 'resume' ? 'Resume' : 
                                 doc.type === 'cover_letter' ? 'Cover Letter' : 
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

                  {application.message && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Manager's Response:</h4>
                      <p className="text-gray-700">{application.message}</p>
                    </div>
                  )}

                  {application.status === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setSelectedApplication(application._id)}
                        className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApplication(application._id);
                          setMessage('');
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </div>
                  )}

                  {selectedApplication === application._id && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Message to Candidate {application.status === 'pending' && '(Optional for Accept)'}:
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                        placeholder="Enter your message to the candidate..."
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleAccept(application._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                          Confirm Accept
                        </button>
                        <button
                          onClick={() => handleReject(application._id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                          Confirm Reject
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApplication(null);
                            setMessage('');
                          }}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageApplications;
