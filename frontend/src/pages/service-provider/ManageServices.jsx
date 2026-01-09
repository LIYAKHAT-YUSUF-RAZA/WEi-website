import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

const ManageServices = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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
        'Plumbing',
        'Electrical',
        'Cleaning',
        'Painting',
        'Carpentry',
        'Gardening',
        'Pest Control',
        'Appliance Repair',
        'Moving Services',
        'Event Management',
        'Beauty & Salon',
        'Tutoring',
        'Others'
    ];

    useEffect(() => {
        fetchServices();
        if (location.state?.openAddModal) {
            setShowModal(true);
            // Clear location state to prevent reopening on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const fetchServices = async () => {
        try {
            const response = await axios.get('/api/services/my/all');
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
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
                alert('Service updated successfully!');
            } else {
                await axios.post('/api/services', formData);
                alert('Service created successfully!');
            }
            setShowModal(false);
            setEditingService(null);
            setFormData({
                title: '',
                description: '',
                category: '',
                price: '',
                location: '',
                image: '',
                status: 'active'
            });
            fetchServices();
        } catch (error) {
            alert(error.response?.data?.message || 'Operation failed');
        }
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
            alert('Service deleted successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete service');
        }
    };

    const filteredServices = services.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 pt-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
                        <p className="text-gray-500 mt-1">Manage the services you offer to customers</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingService(null);
                            setFormData({
                                title: '',
                                description: '',
                                category: categories[0],
                                price: '',
                                location: '',
                                image: '',
                                status: 'active'
                            });
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-lg"
                    >
                        <Plus className="w-5 h-5" /> Add New Service
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search your services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>

                {/* Services List */}
                {filteredServices.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-lg">No services found. Start by adding one!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredServices.map(service => (
                            <div key={service._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group">
                                <div className="h-48 overflow-hidden relative">
                                    <img
                                        src={service.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                                        alt={service.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase ${service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {service.status}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{service.category}</span>
                                        <span className="font-bold text-gray-900">₹{service.price}</span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">{service.description}</p>

                                    {service.location && (
                                        <div className="mb-4 text-sm text-gray-500 flex items-center gap-1">
                                            📍 {service.location}
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4 border-t border-gray-50">
                                        <button
                                            onClick={() => handleEdit(service)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition font-medium text-sm"
                                        >
                                            <Edit2 className="w-4 h-4" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(service._id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition font-medium text-sm"
                                        >
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
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
                                    placeholder="e.g., Professional Home Cleaning"
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
                                        placeholder="0.00"
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
                                    placeholder="Detailed description of your service..."
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
                                    placeholder="e.g., Mumbai, Delhi (Leave empty for remote/online)"
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
                                    placeholder="https://example.com/service-image.jpg"
                                />
                                <p className="text-xs text-gray-500 mt-1">Provide a direct link to an image representing your service.</p>
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
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
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
    );
};

export default ManageServices;
