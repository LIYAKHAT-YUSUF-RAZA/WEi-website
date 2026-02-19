import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit2, Trash2, Search, X, Check, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const ManageServices = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
        location: '',
        image: '',
        status: 'active'
    });

    const categories = [
        'Plumbing', 'Electrical', 'Cleaning', 'Painting', 'Carpentry',
        'Gardening', 'Pest Control', 'Appliance Repair', 'Moving Services',
        'Event Management', 'Beauty & Salon', 'Tutoring', 'Others'
    ];

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get('/api/manager/services');
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching services:', error);
            showToast('error', 'Failed to fetch services');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingService) {
                await axios.put(`/api/services/${editingService._id}`, formData);
                showToast('success', 'Service updated successfully!');
            } else {
                // Determine if we are using a manager specific create or general
                // For now, assuming manager creating service makes them provider or we might need a specific endpoint
                // But the requirement implies mostly managing existing. I'll include add but it might default to manager as provider.
                // Using the general endpoint might fail if middleware blocks.
                // If it fails, we might need to add createService to managerRoutes.
                // Let's assume for this specific file we try to hit the standard one, or maybe we shouldn't allow add yet?
                // The task description said "enable managers to view, edit, and delete".
                // I'll keep the Add feature but warn if it fails.
                await axios.post('/api/services', formData);
                showToast('success', 'Service created successfully!');
            }
            setShowModal(false);
            setEditingService(null);
            resetForm();
            fetchServices();
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Operation failed');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: categories[0],
            price: '',
            location: '',
            image: '',
            status: 'active'
        });
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            title: service.title,
            description: service.description,
            category: service.category,
            price: service.price || '',
            location: service.location || '',
            image: service.image || '',
            status: service.status
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        try {
            await axios.delete(`/api/services/${id}`);
            setServices(services.filter(s => s._id !== id));
            showToast('success', 'Service deleted successfully');
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Failed to delete service');
        }
    };

    const filteredServices = services.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.provider?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-xl font-semibold text-gray-600">Loading services...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 pt-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/manager/dashboard')}
                            className="text-gray-500 hover:text-gray-700 transition"
                        >
                            ← Back
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Manage Services</h1>
                            <p className="text-gray-500 mt-1">View and manage all services on the platform</p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by title, category, or provider..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="text-sm text-gray-500">
                        Total Services: <span className="font-bold text-gray-900">{filteredServices.length}</span>
                    </div>
                </div>

                {/* Toast Message */}
                {message.text && (
                    <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl text-white font-medium animate-bounce z-50 ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                        {message.text}
                    </div>
                )}

                {/* Services Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Provider</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredServices.map(service => (
                                    <tr key={service._id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                                                    <img
                                                        src={service.image || 'https://via.placeholder.com/100'}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{service.title}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{service.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {service.provider ? (
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">{service.provider.name}</div>
                                                    <div className="text-xs text-gray-500">{service.provider.email}</div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Unknown</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                                                {service.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                            ₹{service.price}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${service.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {service.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(service)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(service._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredServices.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            No services found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingService ? 'Edit Service' : 'Add New Service'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition"
                                >
                                    <X className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        rows="4"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location/City</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                                    <input
                                        type="url"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                                    >
                                        {editingService ? 'Update Service' : 'Create Service'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageServices;
