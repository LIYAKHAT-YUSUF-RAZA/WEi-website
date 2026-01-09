import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const InstructorDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`/api/courses/${courseId}`);
      setCourse(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching course details:', error);
      setError('Failed to load instructor details');
      setLoading(false);
    }
  };

  // Get instructor data - either from centralized instructor or manual details
  const getInstructorData = () => {
    if (course?.instructor) {
      // Check if it's a populated object or an ID
      if (typeof course.instructor === 'object' && course.instructor._id) {
        return course.instructor;
      } else if (typeof course.instructor === 'string') {
        return null; // Can't display without populated data
      }
    }

    if (course?.instructorDetails?.name) {
      return course.instructorDetails;
    }
    return null;
  };

  const instructor = getInstructorData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading instructor details...</div>
      </div>
    );
  }

  if (error || !instructor?.name) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error || 'Instructor information not available'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Course
        </button>

        {/* Instructor Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Instructor Image */}
              <div className="flex-shrink-0">
                {instructor.image ? (
                  <img
                    src={instructor.image}
                    alt={instructor.name}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-5xl font-bold text-blue-600">
                      {instructor.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Instructor Name and Title */}
              <div className="text-center md:text-left text-white flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{instructor.name}</h1>
                <p className="text-xl text-blue-100 mb-3">Course Instructor</p>

                {/* Experience and Rating */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                  {instructor.experience && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">{instructor.experience} Experience</span>
                    </div>
                  )}

                  {instructor.rating > 0 && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                      <div className="flex items-center gap-1">
                        <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium">{instructor.rating}/5</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  <span className="text-sm font-medium">Teaching: {course.title}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-10">
            {/* About Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                About the Instructor
              </h2>
              <div className="prose max-w-none">
                {instructor.bio ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{instructor.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">No bio available</p>
                )}
              </div>
            </div>

            {/* Course Information */}
            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Current Course
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">{course.title}</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Category:</span>
                      <span className="text-gray-600">{course.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Level:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${course.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                          course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {course.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Duration:</span>
                      <span className="text-gray-600">{course.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Course Highlights</h3>
                  <div className="space-y-2">
                    {course.learningOutcomes?.slice(0, 3).map((outcome, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">{outcome}</span>
                      </div>
                    ))}
                    {course.learningOutcomes?.length > 3 && (
                      <p className="text-xs text-gray-500 italic mt-2">
                        +{course.learningOutcomes.length - 3} more learning outcomes
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* View Full Course Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => navigate(`/courses/${course._id}`)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Full Course Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDetails;
