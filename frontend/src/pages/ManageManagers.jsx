import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/public/Navbar.jsx';

const ManageManagers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedManager, setSelectedManager] = useState(null);
  const [permissions, setPermissions] = useState({
    canManageCourses: false,
    canManageInternships: false,
    canApproveApplications: false,
    canRejectApplications: false,
    canViewAllApplications: false,
    canManageNotifications: false,
    fullAccess: false
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await axios.get('/api/managers');
      setManagers(response.data);
    } catch (error) {
      console.error('Error fetching managers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPermissions = (manager) => {
    setSelectedManager(manager);
    setPermissions(manager.permissions || {
      canManageCourses: false,
      canManageInternships: false,
      canApproveApplications: false,
      canRejectApplications: false,
      canViewAllApplications: false,
      canManageNotifications: false,
      fullAccess: false
    });
    setShowModal(true);
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
      await axios.put(`/api/managers/${selectedManager._id}/permissions`, {
        permissions
      });
      
      alert('Permissions updated successfully!');
      setShowModal(false);
      setSelectedManager(null);
      fetchManagers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update permissions');
    }
  };

  const handleDeleteManager = async (managerId, managerName) => {
    if (!window.confirm(`Are you sure you want to delete ${managerName}'s account? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`/api/managers/${managerId}`);
      alert(`Manager account deleted successfully`);
      fetchManagers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete manager account');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Manage Managers
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">All Managers ({managers.length})</h2>
          
          {managers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No managers found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {managers.map((manager) => (
                    <tr key={manager._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{manager.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{manager.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs">
                          {manager.permissions?.fullAccess ? (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                              🌟 Full Access
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {manager.permissions?.canManageCourses && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">📚 Courses</span>
                              )}
                              {manager.permissions?.canManageInternships && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">💼 Internships</span>
                              )}
                              {manager.permissions?.canApproveApplications && (
                                <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full">✅ Approve</span>
                              )}
                              {manager.permissions?.canRejectApplications && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">❌ Reject</span>
                              )}
                              {!manager.permissions?.fullAccess && 
                               !manager.permissions?.canManageCourses && 
                               !manager.permissions?.canManageInternships && 
                               !manager.permissions?.canApproveApplications && 
                               !manager.permissions?.canRejectApplications && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">No permissions</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(manager.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/manager/managers/${manager._id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          👁️ View Details
                        </Link>
                        <button
                          onClick={() => handleEditPermissions(manager)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          🔧 Edit Permissions
                        </button>
                        <button
                          onClick={() => handleDeleteManager(manager._id, manager.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Permissions Modal */}
      {showModal && selectedManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Edit Permissions for {selectedManager.name}</h2>
              <p className="text-sm text-gray-600">{selectedManager.email}</p>
            </div>
            
            <div className="p-6">
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

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleUpdatePermissions}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  💾 Save Permissions
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedManager(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageManagers;
