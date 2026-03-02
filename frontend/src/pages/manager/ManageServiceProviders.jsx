import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaStar, FaWrench } from 'react-icons/fa';

const ManageServiceProviders = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showModal, setShowModal] = useState(false);
    const [editingProvider, setEditingProvider] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [imageFile, setImageFile] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        secondaryPhone: '',
        address: '',
        bio: '',
        image: '',
        experience: 0,
        rating: 0,
        problemsSolved: 0,
        reviewsCount: 0
    });

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            const response = await axios.get('/api/manager/service-providers');
            setProviders(response.data);
            setLoading(false);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to fetch service providers' });
            setLoading(false);
        }
    };

    const handleImageFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUrlChange = (e) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, image: url }));
        setImagePreview(url);
        setImageFile(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOpenModal = (provider = null) => {
        if (provider) {
            setEditingProvider(provider);
            setFormData({
                name: provider.name || '',
                email: provider.email || '',
                password: '', // blank when editing
                phone: provider.phone || '',
                secondaryPhone: provider.secondaryPhone || '',
                address: provider.address || '',
                bio: provider.bio || '',
                image: provider.profilePicture || '',
                experience: provider.experience || 0,
                rating: provider.rating || 0,
                problemsSolved: provider.problemsSolved || 0,
                reviewsCount: provider.reviewsCount || 0
            });
            setImagePreview(provider.profilePicture || '');
        } else {
            setEditingProvider(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                phone: '',
                secondaryPhone: '',
                address: '',
                bio: '',
                image: '',
                experience: 0,
                rating: 0,
                problemsSolved: 0,
                reviewsCount: 0
            });
            setImagePreview('');
        }
        setImageFile(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const providerData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                secondaryPhone: formData.secondaryPhone,
                address: formData.address,
                bio: formData.bio,
                image: formData.image,
                experience: Number(formData.experience),
                rating: parseFloat(formData.rating) || 0,
                problemsSolved: Number(formData.problemsSolved) || 0,
                reviewsCount: Number(formData.reviewsCount) || 0
            };

            if (formData.password) {
                providerData.password = formData.password;
            }

            if (editingProvider) {
                await axios.put(`/api/manager/service-providers/${editingProvider._id}`, providerData);
                setMessage({ type: 'success', text: 'Service Provider updated successfully' });
            } else {
                await axios.post('/api/manager/service-providers', providerData);
                setMessage({ type: 'success', text: 'Service Provider created successfully' });
            }

            setShowModal(false);
            fetchProviders();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save provider' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this Service Provider account? This will also remove all their active services.')) {
            return;
        }

        try {
            await axios.delete(`/api/manager/service-providers/${id}`);
            setMessage({ type: 'success', text: 'Service Provider deleted successfully' });
            fetchProviders();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete provider' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    if (loading && providers.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 pt-32">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Manage Service Providers</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                    <FaPlus /> Add Provider
                </button>
            </div>

            {message.text && (
                <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
                    <div key={provider._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                {provider.profilePicture ? (
                                    <img
                                        src={provider.profilePicture}
                                        alt={provider.name}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xl">
                                        {provider.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">{provider.name}</h3>
                                    <p className="text-sm text-gray-500">{provider.email}</p>
                                    <p className="text-sm text-gray-400">{provider.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-gray-600">Experience:</span>
                                <span className="text-sm font-medium text-gray-800">{provider.experience} Yrs</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-gray-600">Jobs Completed:</span>
                                <span className="text-sm font-medium text-gray-800">{provider.problemsSolved}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-gray-600">Rating:</span>
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar
                                            key={i}
                                            className={i < provider.rating ? 'text-yellow-400' : 'text-gray-300'}
                                            size={14}
                                        />
                                    ))}
                                    <span className="text-sm ml-1 text-gray-600">({provider.rating})</span>
                                </div>
                            </div>
                        </div>

                        {provider.bio && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{provider.bio}</p>
                        )}

                        <div className="flex gap-2 justify-end items-center mt-4">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(provider)}
                                    className="text-blue-600 hover:text-blue-700 p-2"
                                >
                                    <FaEdit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(provider._id)}
                                    className="text-red-600 hover:text-red-700 p-2"
                                >
                                    <FaTrash size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {providers.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No service providers found. Wait for applications or manually add one!</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {editingProvider ? 'Edit Service Provider' : 'Add New Service Provider'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Password {editingProvider ? '(leave blank to keep current)' : '*'}</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required={!editingProvider}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Phone</label>
                                    <input
                                        type="tel"
                                        name="secondaryPhone"
                                        value={formData.secondaryPhone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years) *</label>
                                    <input
                                        type="number"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Jobs Completed</label>
                                    <input
                                        type="number"
                                        name="problemsSolved"
                                        value={formData.problemsSolved}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating (0-5)</label>
                                    <input
                                        type="number"
                                        name="rating"
                                        value={formData.rating}
                                        onChange={handleChange}
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="flex items-center mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar
                                                key={i}
                                                className={i < formData.rating ? 'text-yellow-400' : 'text-gray-300'}
                                                size={16}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Reviews Count</label>
                                    <input
                                        type="number"
                                        name="reviewsCount"
                                        value={formData.reviewsCount}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Profile Image Upload */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                                    <div className="space-y-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageFileChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="text-center text-gray-500">OR</div>
                                        <input
                                            type="url"
                                            placeholder="Enter image URL"
                                            value={formData.image}
                                            onChange={handleImageUrlChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                        {imagePreview && (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-32 h-32 rounded-full object-cover mx-auto"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : editingProvider ? 'Update Provider' : 'Create Provider'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
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

export default ManageServiceProviders;
