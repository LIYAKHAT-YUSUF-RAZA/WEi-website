import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/public/Navbar.jsx';
import Footer from '../components/public/Footer.jsx';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses');
        // Sort by newest first
        const sortedCourses = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setCourses(sortedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = filter === 'all' 
    ? courses 
    : courses.filter(course => course.category === filter);

  const categories = ['all', ...new Set(courses.map(c => c.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading courses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Available Courses</h1>
        
        {/* Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  filter === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category === 'all' ? 'All Courses' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="h-48 bg-gradient-to-r from-primary-400 to-primary-600"></div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{course.title}</h3>
                  <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
                    {course.level}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{course.category}</p>
                <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>⏰ {course.duration}</span>
                  <span>👥 {course.enrolled || 0}/{course.maxStudents || 'N/A'}</span>
                </div>
                {course.originalPrice > 0 && course.price >= 0 ? (
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through text-sm">₹{course.originalPrice}</span>
                      <span className="text-primary-600 font-bold text-xl">₹{course.price}</span>
                      {course.discountPercentage > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                          {course.discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                ) : course.price > 0 ? (
                  <p className="text-primary-600 font-bold mb-4">₹{course.price}</p>
                ) : (
                  <p className="text-green-600 font-bold mb-4">Free</p>
                )}
                <Link
                  to={`/courses/${course._id}`}
                  className="block text-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No courses found in this category.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CoursesPage;
