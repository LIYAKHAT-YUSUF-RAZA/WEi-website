import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [instructorMode, setInstructorMode] = useState('select'); // 'select' or 'manual'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    duration: '',
    level: 'Beginner',
    price: '',
    originalPrice: '',
    maxStudents: 30,
    startDate: '',
    endDate: '',
    thumbnail: '',
    prerequisites: '',
    learningOutcomes: '',
    instructor: '',
    instructorName: '',
    instructorBio: '',
    instructorImage: '',
    instructorExperience: '',
    instructorRating: 0
  });

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await axios.get('/api/manager/instructors');
      setInstructors(response.data.filter(inst => inst.status === 'active'));
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
    }
  };
  const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'AI/ML',
    'Cloud Computing',
    'Cybersecurity',
    'Other'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If category is changed to 'Other', show custom input
    if (name === 'category' && value === 'Other') {
      setShowCustomCategory(true);
    } else if (name === 'category') {
      setShowCustomCategory(false);
      setCustomCategory('');
    }

    // Preserve empty string values for numeric fields instead of converting to 0
    let processedValue = value;
    if (name === 'price' || name === 'originalPrice' || name === 'maxStudents') {
      processedValue = value === '' ? '' : value;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate custom category if 'Other' is selected
    if (formData.category === 'Other' && !customCategory.trim()) {
      setMessage({ type: 'error', text: 'Please enter a custom category name' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Convert to number only if value exists, otherwise keep as empty/undefined
      const originalPrice = formData.originalPrice !== '' && formData.originalPrice !== null && formData.originalPrice !== undefined
        ? parseFloat(formData.originalPrice)
        : undefined;
      const discountPrice = formData.price !== '' && formData.price !== null && formData.price !== undefined
        ? parseFloat(formData.price)
        : 0;
      const discountPercentage = originalPrice && discountPrice
        ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
        : 0;

      const courseData = {
        title: formData.title,
        description: formData.description,
        category: formData.category === 'Other' ? customCategory.trim() : formData.category,
        duration: formData.duration,
        level: formData.level,
        price: discountPrice,
        originalPrice: originalPrice,
        discountPercentage: discountPercentage,
        maxStudents: parseInt(formData.maxStudents) || 30,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        thumbnail: formData.thumbnail || '',
        prerequisites: formData.prerequisites
          ? formData.prerequisites.split('\n').filter(p => p.trim())
          : [],
        learningOutcomes: formData.learningOutcomes
          ? formData.learningOutcomes.split('\n').filter(l => l.trim())
          : [],
        instructor: instructorMode === 'select' ? (formData.instructor || null) : null,
        instructorDetails: instructorMode === 'manual' ? {
          name: formData.instructorName || '',
          bio: formData.instructorBio || '',
          image: formData.instructorImage || '',
          experience: formData.instructorExperience || '',
          rating: parseFloat(formData.instructorRating) || 0
        } : {}
      };

      const response = await axios.post('/api/manager/courses', courseData);
      setMessage({ type: 'success', text: response.data.message });

      // Reset form
      setTimeout(() => {
        navigate('/manager/dashboard');
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create course'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/manager/dashboard')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Add New Course</h1>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Complete Web Development Bootcamp"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe what students will learn in this course..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
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
                        placeholder="Enter category name (e.g., Blockchain, IoT, DevOps)"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 8 weeks, 3 months"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price (₹) <span className="text-xs text-gray-500">(Optional - for showing discount)</span>
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 8500 (Leave empty if no discount)"
                  />
                  <p className="text-xs text-gray-500 mt-1">If set, this will be shown with a strikethrough</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 5500 (Actual selling price)"
                  />
                  <p className="text-xs text-gray-500 mt-1">This is the price students will pay</p>
                  {formData.originalPrice > 0 && formData.price > 0 && formData.originalPrice > formData.price && (
                    <p className="text-sm font-semibold text-green-600 mt-2">
                      ✅ Discount: {Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}% OFF |
                      Students save ₹{formData.originalPrice - formData.price}
                    </p>
                  )}
                  {formData.originalPrice > 0 && formData.price > 0 && formData.originalPrice <= formData.price && (
                    <p className="text-sm font-semibold text-red-600 mt-2">
                      ⚠️ Original price must be greater than course price to show discount
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Students
                  </label>
                  <input
                    type="number"
                    name="maxStudents"
                    value={formData.maxStudents}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Course Content</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prerequisites (one per line)
                  </label>
                  <textarea
                    name="prerequisites"
                    value={formData.prerequisites}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Basic understanding of HTML&#10;Familiarity with CSS&#10;Knowledge of JavaScript fundamentals"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Outcomes (one per line)
                  </label>
                  <textarea
                    name="learningOutcomes"
                    value={formData.learningOutcomes}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Build responsive websites&#10;Master modern JavaScript frameworks&#10;Deploy web applications"
                  />
                </div>
              </div>
            </div>

            {/* Instructor Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Instructor Assignment</h2>

              {/* Mode Toggle */}
              <div className="mb-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setInstructorMode('select')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${instructorMode === 'select'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  Select from List
                </button>
                <button
                  type="button"
                  onClick={() => setInstructorMode('manual')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${instructorMode === 'manual'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  Enter Manually
                </button>
              </div>

              {instructorMode === 'select' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Instructor
                    </label>
                    <select
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">No Instructor Assigned</option>
                      {instructors.map((instructor) => (
                        <option key={instructor._id} value={instructor._id}>
                          {instructor.name} - {instructor.experience} ({instructor.rating}⭐)
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-sm text-gray-500">
                      {instructors.length === 0 ? (
                        <span className="text-orange-600">
                          No instructors available. <a href="/manager/manage-instructors" className="underline">Add an instructor first</a>
                        </span>
                      ) : (
                        `${instructors.length} instructor(s) available`
                      )}
                    </p>
                  </div>

                  {formData.instructor && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Selected Instructor Details:</h3>
                      {instructors.find(i => i._id === formData.instructor) && (
                        <div className="text-sm text-gray-700 space-y-1">
                          <p><span className="font-medium">Name:</span> {instructors.find(i => i._id === formData.instructor).name}</p>
                          <p><span className="font-medium">Experience:</span> {instructors.find(i => i._id === formData.instructor).experience}</p>
                          <p><span className="font-medium">Rating:</span> {instructors.find(i => i._id === formData.instructor).rating}/5</p>
                          <p><span className="font-medium">Specialization:</span> {instructors.find(i => i._id === formData.instructor).specialization?.join(', ') || 'N/A'}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructor Name
                    </label>
                    <input
                      type="text"
                      name="instructorName"
                      value={formData.instructorName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Dr. John Doe"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructor Bio
                    </label>
                    <textarea
                      name="instructorBio"
                      value={formData.instructorBio}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief bio about the instructor..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructor Image URL
                    </label>
                    <input
                      type="url"
                      name="instructorImage"
                      value={formData.instructorImage}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/instructor.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="text"
                      name="instructorExperience"
                      value={formData.instructorExperience}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 10+ years"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructor Rating
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        name="instructorRating"
                        value={formData.instructorRating}
                        onChange={handleChange}
                        min="0"
                        max="5"
                        step="0.1"
                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-6 h-6 ${star <= (formData.instructorRating || 0)
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
                          {formData.instructorRating || 0}/5
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Enter a rating between 0 and 5</p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Creating Course...' : 'Create Course'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/manager/dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
