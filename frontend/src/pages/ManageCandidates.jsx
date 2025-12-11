import { useState, useEffect } from 'react';
import axios from 'axios';

const ManageCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/candidates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidates(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch candidates');
      setLoading(false);
    }
  };

  const fetchCandidateDetails = async (candidateId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/candidates/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidateDetails(response.data);
      setSelectedCandidate(candidateId);
      setShowDetailsModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch candidate details');
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/candidates/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCandidates(candidates.filter(c => c._id !== candidateId));
      setDeleteConfirm(null);
      setShowDetailsModal(false);
      alert('Candidate and all their applications deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete candidate');
    }
  };

  const handleRemoveApplication = async (candidateId, applicationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/candidates/${candidateId}/applications/${applicationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh candidate details
      fetchCandidateDetails(candidateId);
      alert('Application removed successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove application');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl text-teal-600">Loading candidates...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Manage Candidates
          </h1>
          <p className="text-gray-600">View, manage, and remove candidates from the system</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {candidates.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <p className="text-gray-500 text-lg">No candidates found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-teal-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Joined</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {candidates.map((candidate) => (
                    <tr key={candidate._id} className="hover:bg-teal-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{candidate.name}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{candidate.email}</td>
                      <td className="px-6 py-4 text-gray-600">{candidate.phone || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(candidate.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => fetchCandidateDetails(candidate._id)}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(candidate._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this candidate? This will also remove all their applications from courses and internships. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDeleteCandidate(deleteConfirm)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Candidate Details Modal */}
        {showDetailsModal && candidateDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 animate-scale-in">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {candidateDetails.candidate.name}
                    </h3>
                    <p className="text-gray-600">{candidateDetails.candidate.email}</p>
                    {candidateDetails.candidate.phone && (
                      <p className="text-gray-600">{candidateDetails.candidate.phone}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setCandidateDetails(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">
                    Applications ({candidateDetails.applications.length})
                  </h4>
                  {candidateDetails.applications.length === 0 ? (
                    <p className="text-gray-500">No applications found</p>
                  ) : (
                    <div className="space-y-4">
                      {candidateDetails.applications.map((app) => (
                        <div
                          key={app._id}
                          className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <h5 className="font-semibold text-gray-900">
                              {app.courseId?.title || app.internshipId?.title || 'Unknown'}
                            </h5>
                            <div className="flex gap-4 mt-1 text-sm text-gray-600">
                              <span>Type: {app.type}</span>
                              <span>Status: <span className={`font-medium ${
                                app.status === 'approved' ? 'text-green-600' :
                                app.status === 'rejected' ? 'text-red-600' :
                                'text-yellow-600'
                              }`}>{app.status}</span></span>
                              <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveApplication(candidateDetails.candidate._id, app._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setDeleteConfirm(candidateDetails.candidate._id);
                      setShowDetailsModal(false);
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Delete Candidate
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setCandidateDetails(null);
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCandidates;
