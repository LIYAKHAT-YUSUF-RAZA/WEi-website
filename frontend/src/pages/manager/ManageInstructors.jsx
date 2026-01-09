import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaStar, FaLinkedin, FaTwitter, FaGithub, FaGlobe } from 'react-icons/fa';

const ManageInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    image: '',
    experience: '',
    rating: 0,
    specialization: '',
    linkedinUrl: '',
    twitterUrl: '',
    githubUrl: '',
    websiteUrl: '',
    status: 'active'
  });

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await axios.get('/api/manager/instructors');
      setInstructors(response.data);
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch instructors' });
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

  const handleOpenModal = (instructor = null) => {
    if (instructor) {
      setEditingInstructor(instructor);
      setFormData({
        name: instructor.name || '',
        email: instructor.email || '',
        phone: instructor.phone || '',
        bio: instructor.bio || '',
        image: instructor.image || '',
        experience: instructor.experience || '',
        rating: instructor.rating || 0,
        specialization: instructor.specialization?.join(', ') || '',
        linkedinUrl: instructor.socialLinks?.linkedin || '',
        twitterUrl: instructor.socialLinks?.twitter || '',
        githubUrl: instructor.socialLinks?.github || '',
        websiteUrl: instructor.socialLinks?.website || '',
        status: instructor.status || 'active'
      });
      setImagePreview(instructor.image || '');
    } else {
      setEditingInstructor(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        bio: '',
        image: '',
        experience: '',
        rating: 0,
        specialization: '',
        linkedinUrl: '',
        twitterUrl: '',
        githubUrl: '',
        websiteUrl: '',
        status: 'active'
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
      const specializationArray = formData.specialization
        ? formData.specialization.split(',').map(s => s.trim()).filter(s => s)
        : [];

      const instructorData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        image: formData.image,
        experience: formData.experience,
        rating: parseFloat(formData.rating) || 0,
        specialization: specializationArray,
        socialLinks: {
          linkedin: formData.linkedinUrl,
          twitter: formData.twitterUrl,
          github: formData.githubUrl,
          website: formData.websiteUrl
        },
        status: formData.status
      };

      if (editingInstructor) {
        await axios.put(`/api/manager/instructors/${editingInstructor._id}`, instructorData);
        setMessage({ type: 'success', text: 'Instructor updated successfully' });
      } else {
        await axios.post('/api/manager/instructors', instructorData);
        setMessage({ type: 'success', text: 'Instructor created successfully' });
      }

      setShowModal(false);
      fetchInstructors();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save instructor' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this instructor?')) {
      return;
    }

    try {
      await axios.delete(`/api/manager/instructors/${id}`);
      setMessage({ type: 'success', text: 'Instructor deleted successfully' });
      fetchInstructors();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete instructor' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  if (loading && instructors.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-32">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Instructors</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          <FaPlus /> Add Instructor
        </button>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instructors.map((instructor) => (
          <div key={instructor._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {instructor.image ? (
                  <img
                    src={instructor.image}
                    alt={instructor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xl">
                    {instructor.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{instructor.name}</h3>
                  <p className="text-sm text-gray-500">{instructor.email}</p>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">Experience:</span>
                <span className="text-sm font-medium text-gray-800">{instructor.experience}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">Rating:</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < instructor.rating ? 'text-yellow-400' : 'text-gray-300'}
                      size={14}
                    />
                  ))}
                  <span className="text-sm ml-1 text-gray-600">({instructor.rating})</span>
                </div>
              </div>
              {instructor.specialization && instructor.specialization.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {instructor.specialization.map((skill, idx) => (
                    <span key={idx} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{instructor.bio}</p>

            <div className="flex gap-2 mb-4">
              {instructor.socialLinks?.linkedin && (
                <a href={instructor.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                  <FaLinkedin size={18} />
                </a>
              )}
              {instructor.socialLinks?.twitter && (
                <a href={instructor.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500">
                  <FaTwitter size={18} />
                </a>
              )}
              {instructor.socialLinks?.github && (
                <a href={instructor.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-gray-900">
                  <FaGithub size={18} />
                </a>
              )}
              {instructor.socialLinks?.website && (
                <a href={instructor.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                  <FaGlobe size={18} />
                </a>
              )}
            </div>

            <div className="flex gap-2 justify-between items-center">
              <span className={`text-xs px-2 py-1 rounded ${instructor.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {instructor.status}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(instructor)}
                  className="text-blue-600 hover:text-blue-700 p-2"
                >
                  <FaEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(instructor._id)}
                  className="text-red-600 hover:text-red-700 p-2"
                >
                  <FaTrash size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {instructors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No instructors found. Add your first instructor!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingInstructor ? 'Edit Instructor' : 'Add New Instructor'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience *</label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 10+ years"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio *</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization (comma-separated)</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="e.g., React, Node.js, Python"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Image Upload */}
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

                {/* Social Links */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Social Links</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FaLinkedin className="text-blue-600" />
                        <span className="text-sm text-gray-600">LinkedIn</span>
                      </div>
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FaTwitter className="text-blue-400" />
                        <span className="text-sm text-gray-600">Twitter</span>
                      </div>
                      <input
                        type="url"
                        name="twitterUrl"
                        value={formData.twitterUrl}
                        onChange={handleChange}
                        placeholder="https://twitter.com/username"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FaGithub className="text-gray-800" />
                        <span className="text-sm text-gray-600">GitHub</span>
                      </div>
                      <input
                        type="url"
                        name="githubUrl"
                        value={formData.githubUrl}
                        onChange={handleChange}
                        placeholder="https://github.com/username"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FaGlobe className="text-green-600" />
                        <span className="text-sm text-gray-600">Website</span>
                      </div>
                      <input
                        type="url"
                        name="websiteUrl"
                        value={formData.websiteUrl}
                        onChange={handleChange}
                        placeholder="https://website.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingInstructor ? 'Update Instructor' : 'Create Instructor'}
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

export default ManageInstructors;
