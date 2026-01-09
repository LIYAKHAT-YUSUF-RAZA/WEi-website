import { useState, useEffect } from 'react';
import axios from 'axios';


const ManageServiceProviderRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [permissions, setPermissions] = useState({
        canManageServices: true
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await axios.get('/api/service-provider-requests');
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        try {
            await axios.put(`/api/service-provider-requests/${requestId}`, {
                status: 'approved',
                permissions
            });

            alert('Service Provider request approved!');
            setSelectedRequest(null);
            fetchRequests();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to approve request');
        }
    };

    const handleReject = async (requestId) => {
        if (!window.confirm('Are you sure you want to reject this request?')) return;

        try {
            await axios.put(`/api/service-provider-requests/${requestId}`, {
                status: 'rejected'
            });

            alert('Service Provider request rejected.');
            setSelectedRequest(null);
            fetchRequests();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reject request');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
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
            <div className="container mx-auto px-4 py-8 pt-32">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Service Provider Requests
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
                                    <span className={`px-4 py-2 rounded-full font-semibold ${request.status === 'approved'
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

                {/* Approval Modal */}
                {selectedRequest && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-800">Review Request</h2>
                            </div>

                            <div className="p-6">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold mb-2">{selectedRequest.name}</h3>
                                    <p className="text-gray-600">📧 {selectedRequest.email}</p>
                                    <p className="text-gray-600">📱 {selectedRequest.phone || 'Not provided'}</p>
                                </div>

                                <div className="mb-6">
                                    <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={permissions.canManageServices}
                                            readOnly
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="ml-3 text-gray-700">🛠️ Manage Services (Default)</span>
                                    </label>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleApprove(selectedRequest._id)}
                                        className="flex-1 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-all"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedRequest._id)}
                                        className="flex-1 bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-all"
                                    >
                                        Reject
                                    </button>
                                </div>

                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="w-full mt-4 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageServiceProviderRequests;
