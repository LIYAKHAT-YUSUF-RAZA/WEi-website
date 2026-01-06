import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/public/Navbar.jsx';
import PermissionGuard from '../components/PermissionGuard.jsx';

const ManagerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({
    canManageCourses: false,
    canManageInternships: false,
    canApproveApplications: false,
    canRejectApplications: false,
    canViewAllApplications: false,
    canManageNotifications: false,
    fullAccess: false
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchManagerDetails();
  }, [id]);

  const fetchManagerDetails = async () => {
    try {
      const response = await axios.get(`/api/managers/${id}`);
      setManager(response.data);
      setPermissions(response.data.permissions || {
        canManageCourses: false,
        canManageInternships: false,
        canApproveApplications: false,
        canRejectApplications: false,
        canViewAllApplications: false,
        canManageNotifications: false,
        fullAccess: false
      });
    } catch (error) {
      console.error('Error fetching manager details:', error);
      setMessage({ type: 'error', text: 'Failed to load manager details' });
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

  const handleUpdatePermissions = async () => {
    try {
      await axios.put(`/api/managers/${id}/permissions`, {
        permissions
      });
      
      setMessage({ type: 'success', text: 'Permissions updated successfully!' });
      setShowEditModal(false);
      fetchManagerDetails();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update permissions' });
    }
  };

  const handleDeleteManager = async () => {
    if (!window.confirm(`Are you sure you want to delete ${manager.name}'s account? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`/api/managers/${id}`);
      setMessage({ type: 'success', text: 'Manager account deleted successfully' });
      setTimeout(() => navigate('/manager/manage-managers'), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete manager' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading manager details...</div>
        </div>
      </div>
    );
  }

  if (!manager) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700">Manager not found</p>
          </div>
          <button
            onClick={() => navigate('/manager/manage-managers')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            Back to Managers
          </button>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="fullAccess">
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/manager/manage-managers')}
              className="text-blue-600 hover:text-blue-800 font-semibold mb-4"
            >
              ← Back to Managers
            </button>
            <h1 className="text-4xl font-bold text-gray-900">{manager.name}</h1>
            <p className="text-gray-600 mt-2">{manager.email}</p>
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

          {/* Manager Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manager Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <p className="text-gray-900 font-semibold">{manager.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <p className="text-gray-900 font-semibold">{manager.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <p className="text-gray-900 font-semibold">{manager.phone || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  Active
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                <p className="text-gray-900 font-semibold">
                  {new Date(manager.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Permissions</h2>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                ✏️ Edit Permissions
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Manage Courses</p>
                  <p className="text-sm text-gray-600">Can create and edit courses</p>
                </div>
                <div className="ml-4">
                  {permissions.canManageCourses ? (
                    <span className="text-green-600 text-2xl">✓</span>
                  ) : (
                    <span className="text-gray-300 text-2xl">✗</span>
                  )}
                </div>
              </div>

              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Manage Internships</p>
                  <p className="text-sm text-gray-600">Can create and edit internships</p>
                </div>
                <div className="ml-4">
                  {permissions.canManageInternships ? (
                    <span className="text-green-600 text-2xl">✓</span>
                  ) : (
                    <span className="text-gray-300 text-2xl">✗</span>
                  )}
                </div>
              </div>

              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Approve Applications</p>
                  <p className="text-sm text-gray-600">Can approve internship applications</p>
                </div>
                <div className="ml-4">
                  {permissions.canApproveApplications ? (
                    <span className="text-green-600 text-2xl">✓</span>
                  ) : (
                    <span className="text-gray-300 text-2xl">✗</span>
                  )}
                </div>
              </div>

              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Reject Applications</p>
                  <p className="text-sm text-gray-600">Can reject internship applications</p>
                </div>
                <div className="ml-4">
                  {permissions.canRejectApplications ? (
                    <span className="text-green-600 text-2xl">✓</span>
                  ) : (
                    <span className="text-gray-300 text-2xl">✗</span>
                  )}
                </div>
              </div>

              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">View All Applications</p>
                  <p className="text-sm text-gray-600">Can view all applications</p>
                </div>
                <div className="ml-4">
                  {permissions.canViewAllApplications ? (
                    <span className="text-green-600 text-2xl">✓</span>
                  ) : (
                    <span className="text-gray-300 text-2xl">✗</span>
                  )}
                </div>
              </div>

              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Manage Notifications</p>
                  <p className="text-sm text-gray-600">Can manage notification settings</p>
                </div>
                <div className="ml-4">
                  {permissions.canManageNotifications ? (
                    <span className="text-green-600 text-2xl">✓</span>
                  ) : (
                    <span className="text-gray-300 text-2xl">✗</span>
                  )}
                </div>
              </div>

              <div className={`flex items-center p-4 border-2 rounded-lg ${permissions.fullAccess ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">Full Access</p>
                  <p className="text-sm text-gray-600">Administrator - All permissions</p>
                </div>
                <div className="ml-4">
                  {permissions.fullAccess ? (
                    <span className="text-green-600 text-2xl">✓</span>
                  ) : (
                    <span className="text-gray-300 text-2xl">✗</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Delete Manager Section */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-900 mb-4">Danger Zone</h2>
            <p className="text-red-700 mb-4">Deleting this manager will remove their account and all related data. This action cannot be undone.</p>
            <button
              onClick={handleDeleteManager}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
            >
              🗑️ Delete Manager Account
            </button>
          </div>
        </div>

        {/* Edit Permissions Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Edit Permissions for {manager.name}</h3>
              </div>

              <div className="p-6 space-y-4 max-h-72 overflow-y-auto">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={permissions.canManageCourses}
                    onChange={() => handlePermissionChange('canManageCourses')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3">
                    <p className="font-semibold text-gray-900">Manage Courses</p>
                    <p className="text-sm text-gray-600">Can create and edit courses</p>
                  </span>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={permissions.canManageInternships}
                    onChange={() => handlePermissionChange('canManageInternships')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3">
                    <p className="font-semibold text-gray-900">Manage Internships</p>
                    <p className="text-sm text-gray-600">Can create and edit internships</p>
                  </span>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={permissions.canApproveApplications}
                    onChange={() => handlePermissionChange('canApproveApplications')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3">
                    <p className="font-semibold text-gray-900">Approve Applications</p>
                    <p className="text-sm text-gray-600">Can approve internship applications</p>
                  </span>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={permissions.canRejectApplications}
                    onChange={() => handlePermissionChange('canRejectApplications')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3">
                    <p className="font-semibold text-gray-900">Reject Applications</p>
                    <p className="text-sm text-gray-600">Can reject internship applications</p>
                  </span>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={permissions.canViewAllApplications}
                    onChange={() => handlePermissionChange('canViewAllApplications')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3">
                    <p className="font-semibold text-gray-900">View All Applications</p>
                    <p className="text-sm text-gray-600">Can view all applications</p>
                  </span>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={permissions.canManageNotifications}
                    onChange={() => handlePermissionChange('canManageNotifications')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3">
                    <p className="font-semibold text-gray-900">Manage Notifications</p>
                    <p className="text-sm text-gray-600">Can manage notification settings</p>
                  </span>
                </label>

                <label className="flex items-center p-3 border-2 border-blue-500 rounded-lg cursor-pointer hover:bg-blue-50 bg-blue-50">
                  <input
                    type="checkbox"
                    checked={permissions.fullAccess}
                    onChange={() => handlePermissionChange('fullAccess')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3">
                    <p className="font-bold text-gray-900">Full Access</p>
                    <p className="text-sm text-gray-600">Administrator - All permissions</p>
                  </span>
                </label>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePermissions}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};

export default ManagerDetails;
