import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ManageCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingCourse, setEditingCourse] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [instructorMode, setInstructorMode] = useState('select');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [instructorImageFile, setInstructorImageFile] = useState(null);
  const [instructorImagePreview, setInstructorImagePreview] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/manager/courses');
      setCourses(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch courses' });
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await axios.get('/api/manager/instructors');
      setInstructors(response.data.filter(inst => inst.status === 'active'));
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
    }
  };

  const handleDelete = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"?`)) {
      return;
    }

    try {
      await axios.delete(`/api/manager/courses/${courseId}`);
      setMessage({ type: 'success', text: 'Course deleted successfully' });
      fetchCourses();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete course' });
    }
  };

  const handleEdit = (course) => {
    const predefinedCategories = [
      'Web Development',
      'Mobile Development',
      'Data Science',
      'AI/ML',
      'Cloud Computing',
      'Cybersecurity'
    ];
    
    // Check if the course category is a custom one
    const isCustom = !predefinedCategories.includes(course.category);
    
    if (isCustom) {
      setShowCustomCategory(true);
      setCustomCategory(course.category);
    } else {
      setShowCustomCategory(false);
      setCustomCategory('');
    }
    
    // Determine instructor mode - if instructor is an ID string, use select mode, otherwise manual
    const hasInstructorRef = course.instructor && typeof course.instructor === 'object' && course.instructor._id;
    const hasManualDetails = course.instructorDetails && course.instructorDetails.name;
    setInstructorMode(hasInstructorRef ? 'select' : 'manual');
    
    setEditingCourse({
      ...course,
      category: isCustom ? 'Other' : course.category,
      prerequisites: course.prerequisites?.join('\n') || '',
      learningOutcomes: course.learningOutcomes?.join('\n') || '',
      instructor: hasInstructorRef ? course.instructor._id : '',
      instructorName: hasManualDetails ? course.instructorDetails.name : '',
      instructorBio: hasManualDetails ? course.instructorDetails.bio : '',
      instructorImage: hasManualDetails ? course.instructorDetails.image : '',
      instructorExperience: hasManualDetails ? course.instructorDetails.experience : '',
      instructorRating: hasManualDetails ? course.instructorDetails.rating : 0,
      price: course.price || '',
      originalPrice: course.originalPrice || '',
      maxStudents: course.maxStudents || ''
    });
    setThumbnailPreview(course.thumbnail || '');
    setInstructorImagePreview(hasInstructorRef ? course.instructor?.image || '' : hasManualDetails ? course.instructorDetails.image : '');
    setThumbnailFile(null);
    setInstructorImageFile(null);
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Validate custom category if 'Other' is selected
    if (editingCourse.category === 'Other' && !customCategory.trim()) {
      setMessage({ type: 'error', text: 'Please enter a custom category name' });
      return;
    }
    
    try {
      const originalPrice = parseFloat(editingCourse.originalPrice) || 0;
      const discountPrice = parseFloat(editingCourse.price) || 0;
      const discountPercentage = originalPrice > 0 && discountPrice > 0 
        ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
        : 0;

      const updateData = {
        ...editingCourse,
        category: editingCourse.category === 'Other' ? customCategory.trim() : editingCourse.category,
        price: discountPrice,
        originalPrice: originalPrice,
        discountPercentage: discountPercentage,
        prerequisites: editingCourse.prerequisites 
          ? editingCourse.prerequisites.split('\n').filter(p => p.trim()) 
          : [],
        learningOutcomes: editingCourse.learningOutcomes 
          ? editingCourse.learningOutcomes.split('\n').filter(l => l.trim()) 
          : []
      };

      // Handle instructor data based on mode
      if (instructorMode === 'select') {
        // Send instructor ID only
        updateData.instructor = editingCourse.instructor;
        // Clear manual fields
        delete updateData.instructorName;
        delete updateData.instructorBio;
        delete updateData.instructorImage;
        delete updateData.instructorExperience;
        delete updateData.instructorRating;
        delete updateData.instructorDetails;
      } else {
        // Send manual instructor details
        updateData.instructorDetails = {
          name: editingCourse.instructorName,
          bio: editingCourse.instructorBio,
          image: editingCourse.instructorImage,
          experience: editingCourse.instructorExperience,
          rating: editingCourse.instructorRating
        };
        // Clear instructor ID
        updateData.instructor = null;
      }

      await axios.put(`/api/manager/courses/${editingCourse._id}`, updateData);
      setMessage({ type: 'success', text: 'Course updated successfully' });
      setShowEditModal(false);
      setEditingCourse(null);
      fetchCourses();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update course' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If category is changed to 'Other', show custom input
    if (name === 'category' && value === 'Other') {
      setShowCustomCategory(true);
    } else if (name === 'category') {
      setShowCustomCategory(false);
      setCustomCategory('');
    }
    
    // Handle number fields - convert empty string to actual empty value, not 0
    let processedValue = value;
    if (name === 'price' || name === 'originalPrice' || name === 'maxStudents') {
      processedValue = value === '' ? '' : value;
    }
      
    setEditingCourse(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleThumbnailFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
        setEditingCourse(prev => ({ ...prev, thumbnail: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailUrlChange = (e) => {
    const url = e.target.value;
    setThumbnailPreview(url);
    setEditingCourse(prev => ({ ...prev, thumbnail: url }));
    setThumbnailFile(null);
  };

  const handleInstructorImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInstructorImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setInstructorImagePreview(reader.result);
        setEditingCourse(prev => ({
          ...prev,
          instructorImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInstructorImageUrlChange = (e) => {
    const url = e.target.value;
    setInstructorImagePreview(url);
    setEditingCourse(prev => ({
      ...prev,
      instructorImage: url
    }));
    setInstructorImageFile(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/manager/dashboard')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={() => navigate('/manager/add-course')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ➕ Add New Course
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Manage Courses</h1>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {courses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl">No courses found</p>
              <button
                onClick={() => navigate('/manager/add-course')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Your First Course
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{course.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{course.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {course.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{course.price || 'Free'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.enrolled || 0} / {course.maxStudents}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(course)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(course._id, course.title)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
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

      {/* Edit Modal */}
      {showEditModal && editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Edit Course</h2>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editingCourse.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={editingCourse.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={editingCourse.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Web Development</option>
                    <option>Mobile Development</option>
                    <option>Data Science</option>
                    <option>AI/ML</option>
                    <option>Cloud Computing</option>
                    <option>Cybersecurity</option>
                    <option>Other</option>
                  </select>
                  
                  {/* Custom Category Input */}
                  {showCustomCategory && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Category Name *
                      </label>
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter category name"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <select
                    name="level"
                    value={editingCourse.level}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={editingCourse.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={editingCourse.originalPrice === 0 ? '' : editingCourse.originalPrice}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter original price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={editingCourse.price === 0 ? '' : editingCourse.price}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter discount price"
                  />
                  <p className="mt-1 text-sm text-gray-500">Discount percentage will be calculated automatically</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
                  <input
                    type="number"
                    name="maxStudents"
                    value={editingCourse.maxStudents}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={editingCourse.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
                  
                  <div className="space-y-3">
                    {/* File Upload Option */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Upload Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailFileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-gray-300"></div>
                      <span className="text-xs text-gray-500">OR</span>
                      <div className="flex-1 h-px bg-gray-300"></div>
                    </div>
                    
                    {/* URL Input Option */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Enter Image URL</label>
                      <input
                        type="url"
                        value={editingCourse.thumbnail || ''}
                        onChange={handleThumbnailUrlChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    
                    {/* Preview */}
                    {thumbnailPreview && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">Preview:</p>
                        <img src={thumbnailPreview} alt="Thumbnail preview" className="h-32 rounded-lg object-cover border-2 border-gray-200" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prerequisites (one per line)</label>
                  <textarea
                    name="prerequisites"
                    value={editingCourse.prerequisites}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Learning Outcomes (one per line)</label>
                  <textarea
                    name="learningOutcomes"
                    value={editingCourse.learningOutcomes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Instructor Details Section */}
                <div className="md:col-span-2 pt-4 border-t">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor Details</h3>
                  
                  {/* Mode Toggle Buttons */}
                  <div className="flex gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setInstructorMode('select')}
                      className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                        instructorMode === 'select'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Select from List
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstructorMode('manual')}
                      className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                        instructorMode === 'manual'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Enter Manually
                    </button>
                  </div>
                </div>

                {/* Select Mode - Dropdown Selection */}
                {instructorMode === 'select' && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Instructor</label>
                      <select
                        name="instructor"
                        value={editingCourse.instructor}
                        onChange={(e) => setEditingCourse({...editingCourse, instructor: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Select Instructor --</option>
                        {instructors.map((instructor) => (
                          <option key={instructor._id} value={instructor._id}>
                            {instructor.name} - {instructor.experience} ({instructor.rating}⭐)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Selected Instructor Details Preview */}
                    {editingCourse.instructor && instructors.find(i => i._id === editingCourse.instructor) && (
                      <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Selected Instructor Details
                        </h4>
                        {(() => {
                          const selected = instructors.find(i => i._id === editingCourse.instructor);
                          return (
                            <div className="flex gap-4">
                              {selected.image && (
                                <img 
                                  src={selected.image} 
                                  alt={selected.name}
                                  className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{selected.name}</p>
                                <p className="text-sm text-gray-600 mt-1">{selected.bio}</p>
                                <div className="flex gap-4 mt-2 text-sm text-gray-700">
                                  <span className="font-medium">Experience: {selected.experience}</span>
                                  <span className="font-medium">Rating: {selected.rating}⭐</span>
                                </div>
                                {selected.specialization && selected.specialization.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {selected.specialization.map((spec, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                        {spec}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </>
                )}

                {/* Manual Mode - Form Fields */}
                {instructorMode === 'manual' && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instructor Name</label>
                      <input
                        type="text"
                        name="instructorName"
                        value={editingCourse.instructorName || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Dr. John Smith"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instructor Bio</label>
                      <textarea
                        name="instructorBio"
                        value={editingCourse.instructorBio || ''}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Brief description about the instructor's background and expertise..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                      <input
                        type="text"
                        name="instructorExperience"
                        value={editingCourse.instructorExperience || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 10+ years or 5 years"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instructor Rating</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          name="instructorRating"
                          value={editingCourse.instructorRating || 0}
                          onChange={handleChange}
                          min="0"
                          max="5"
                          step="0.1"
                          className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-6 h-6 ${
                                star <= (editingCourse.instructorRating || 0)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            {editingCourse.instructorRating || 0}/5
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Enter a rating between 0 and 5</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instructor Image</label>
                      
                      <div className="space-y-3">
                        {/* File Upload Option */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Upload Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleInstructorImageFileChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-px bg-gray-300"></div>
                          <span className="text-xs text-gray-500">OR</span>
                          <div className="flex-1 h-px bg-gray-300"></div>
                        </div>
                        
                        {/* URL Input Option */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Enter Image URL</label>
                          <input
                            type="url"
                            name="instructorImage"
                            value={editingCourse.instructorImage || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/instructor-photo.jpg"
                          />
                        </div>
                        
                        {/* Preview */}
                        {instructorImagePreview && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-600 mb-2">Preview:</p>
                            <img 
                              src={instructorImagePreview} 
                              alt="Instructor preview" 
                              className="h-24 w-24 rounded-full object-cover border-2 border-gray-200" 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Update Course
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCourse(null);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
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

export default ManageCourses;
