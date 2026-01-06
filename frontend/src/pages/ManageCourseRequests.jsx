import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/public/Navbar.jsx';

const ManageCourseRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [decision, setDecision] = useState('approve');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/course-requests${filter !== 'all' ? `?status=${filter}` : ''}`);
      setRequests(response.data.courseRequests || []);
    } catch (error) {
      console.error('Error fetching course requests:', error);
      setMessageType({ type: 'error', text: 'Failed to load course requests' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setDecision('approve');
    setMessage('');
    setShowModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setDecision('reject');
    setMessage('');
    setShowModal(true);
  };

  const handleSubmitDecision = async () => {
    try {
      const endpoint = decision === 'approve' 
        ? `/api/course-requests/${selectedRequest._id}/approve`
        : `/api/course-requests/${selectedRequest._id}/reject`;

      await axios.put(endpoint, { message });
      
      setMessageType({
        type: 'success',
        text: `Course request ${decision}d successfully!`
      });
      setShowModal(false);
      fetchRequests();
      setTimeout(() => setMessageType({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessageType({
        type: 'error',
        text: error.response?.data?.message || `Failed to ${decision} request`
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading course requests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📚 Manage Course Requests</h1>
          <p className="text-gray-600">Review and approve course enrollment requests from candidates</p>
        </div>

        {/* Message */}
        {messageType.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType.type === 'success' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {messageType.text}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-xl text-gray-500">No course requests found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Candidate Info */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">👤 Candidate</h3>
                    <p className="text-gray-700 font-semibold">{request.candidateName}</p>
                    <p className="text-gray-500 text-sm">{request.candidateEmail}</p>
                  </div>

                  {/* Course Info */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">📚 Course</h3>
                    <p className="text-gray-700 font-semibold">{request.courseName}</p>
                    <p className="text-gray-500 text-sm">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Status</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      request.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : request.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Message */}
                {request.message && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600"><strong>Message:</strong> {request.message}</p>
                  </div>
                )}

                {/* Rejection Reason */}
                {request.rejectionReason && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <p className="text-sm text-red-600"><strong>Rejection Reason:</strong> {request.rejectionReason}</p>
                  </div>
                )}

                {/* Actions */}
                {request.status === 'pending' && (
                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={() => handleApprove(request)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleReject(request)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {decision === 'approve' ? '✅ Approve Course Request' : '❌ Reject Course Request'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">
                  <strong>Candidate:</strong> {selectedRequest.candidateName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Course:</strong> {selectedRequest.courseName}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {decision === 'approve' ? 'Approval Message (Optional)' : 'Rejection Reason (Optional)'}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter message here..."
                  rows="4"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDecision}
                className={`flex-1 px-4 py-2 text-white font-semibold rounded-lg transition ${
                  decision === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {decision === 'approve' ? 'Approve Request' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourseRequests;
