import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/public/Navbar.jsx';

const ManagerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [permissions, setPermissions] = useState({
    canManageCourses: false,
    canManageInternships: false,
    canApproveApplications: false,
    canRejectApplications: false,
    canViewAllApplications: false,
    canManageNotifications: false,
    fullAccess: false
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/manager-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission) => {
    if (permission === 'fullAccess') {
      const value = !permissions.fullAccess;
      setPermissions({
        canManageCourses: value,
        canManageInternships: value,
        canApproveApplications: value,
        canRejectApplications: value,
        canViewAllApplications: value,
        canManageNotifications: value,
        fullAccess: value
      });
    } else {
      setPermissions({
        ...permissions,
        [permission]: !permissions[permission],
        fullAccess: false
      });
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.put(`/api/manager-requests/${requestId}`, {
        status: 'approved',
        permissions
      });
      
      alert('Manager request approved! They will receive an email notification.');
      setSelectedRequest(null);
      setPermissions({
        canManageCourses: false,
        canManageInternships: false,
        canApproveApplications: false,
        canRejectApplications: false,
        canViewAllApplications: false,
        canManageNotifications: false,
        fullAccess: false
      });
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;

    try {
      await axios.put(`/api/manager-requests/${requestId}`, {
        status: 'rejected'
      });
      
      alert('Manager request rejected.');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Manager Account Requests
        </h1>

        {/* Pending Requests */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Pending Requests ({pendingRequests.length})</h2>
          
          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              No pending requests
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingRequests.map((request) => (
                <div key={request._id} className="bg-white rounded-lg shadow-lg p-6 border-2 border-yellow-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                      Pending
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{request.name}</h3>
                  <p className="text-gray-600 mb-1">📧 {request.email}</p>
                  <p className="text-gray-600 mb-4">📱 {request.phone || 'No phone provided'}</p>
                  
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                  >
                    Review Request
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Processed Requests */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Processed Requests ({processedRequests.length})</h2>
          
          {processedRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              No processed requests
            </div>
          ) : (
            <div className="space-y-4">
              {processedRequests.map((request) => (
                <div key={request._id} className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{request.name}</h3>
                    <p className="text-sm text-gray-600">{request.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full font-semibold ${
                    request.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {request.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Review Manager Request</h2>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{selectedRequest.name}</h3>
                <p className="text-gray-600">📧 {selectedRequest.email}</p>
                <p className="text-gray-600">📱 {selectedRequest.phone || 'Not provided'}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Requested on: {new Date(selectedRequest.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-bold mb-4 text-gray-800">Set Permissions</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg cursor-pointer hover:from-purple-100 hover:to-blue-100 transition-all">
                    <input
                      type="checkbox"
                      checked={permissions.fullAccess}
                      onChange={() => handlePermissionChange('fullAccess')}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="ml-3 font-semibold text-gray-800">🌟 Full Access (All Permissions)</span>
                  </label>

                  <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
                    <input
                      type="checkbox"
                      checked={permissions.canManageCourses}
                      onChange={() => handlePermissionChange('canManageCourses')}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700">📚 Manage Courses</span>
                  </label>

                  <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
                    <input
                      type="checkbox"
                      checked={permissions.canManageInternships}
                      onChange={() => handlePermissionChange('canManageInternships')}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700">💼 Manage Internships</span>
                  </label>

                  <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
                    <input
                      type="checkbox"
                      checked={permissions.canApproveApplications}
                      onChange={() => handlePermissionChange('canApproveApplications')}
                      className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <span className="ml-3 text-gray-700">✅ Approve Applications</span>
                  </label>

                  <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
                    <input
                      type="checkbox"
                      checked={permissions.canRejectApplications}
                      onChange={() => handlePermissionChange('canRejectApplications')}
                      className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                    />
                    <span className="ml-3 text-gray-700">❌ Reject Applications</span>
                  </label>

                  <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
                    <input
                      type="checkbox"
                      checked={permissions.canViewAllApplications}
                      onChange={() => handlePermissionChange('canViewAllApplications')}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-gray-700">👁️ View All Applications</span>
                  </label>

                  <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
                    <input
                      type="checkbox"
                      checked={permissions.canManageNotifications}
                      onChange={() => handlePermissionChange('canManageNotifications')}
                      className="w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
                    />
                    <span className="ml-3 text-gray-700">🔔 Manage Notifications</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleApprove(selectedRequest._id)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105"
                >
                  ✅ Approve & Send Email
                </button>
                <button
                  onClick={() => handleReject(selectedRequest._id)}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105"
                >
                  ❌ Reject Request
                </button>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="w-full mt-4 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerRequests;
