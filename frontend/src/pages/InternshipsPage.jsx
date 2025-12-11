import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/public/Navbar.jsx';
import Footer from '../components/public/Footer.jsx';

const InternshipsPage = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [applicationStatuses, setApplicationStatuses] = useState({});

  useEffect(() => {
    fetchInternships();
    fetchApplicationStatuses();
  }, []);

  const fetchInternships = async () => {
    try {
      const response = await axios.get('/api/internships');
      // Sort by newest first
      const sortedInternships = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setInternships(sortedInternships);
    } catch (error) {
      console.error('Error fetching internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationStatuses = async () => {
    try {
      const response = await axios.get('/api/applications/my-applications');
      const applications = response.data.filter(app => app.type === 'internship');
      const statusMap = {};
      applications.forEach(app => {
        statusMap[app.referenceId] = app.status;
      });
      setApplicationStatuses(statusMap);
    } catch (error) {
      console.error('Error fetching application statuses:', error);
    }
  };

  const filteredInternships = filter === 'all' 
    ? internships 
    : internships.filter(internship => internship.type === filter);

  const types = ['all', 'Remote', 'On-site', 'Hybrid'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading internships...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Internship Opportunities</h1>
        
        {/* Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  filter === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {type === 'all' ? 'All Types' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Internships Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInternships.map((internship) => (
            <div key={internship._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden">
              {internship.image ? (
                <img src={internship.image} alt={internship.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="h-48 bg-gradient-to-r from-purple-400 to-blue-600"></div>
              )}
              <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold">{internship.title}</h3>
                <span className={`text-xs px-2 py-1 rounded ${
                  internship.type === 'Remote' 
                    ? 'bg-green-100 text-green-800' 
                    : internship.type === 'On-site'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {internship.type}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 mb-2">{internship.department}</p>
              <p className="text-gray-600 mb-4 line-clamp-2">{internship.description}</p>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <span className="mr-2">📍</span>
                  <span>{internship.location}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">⏰</span>
                  <span>{internship.duration}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">💰</span>
                  <span>{internship.stipend}</span>
                </div>
              </div>

              {internship.skills && internship.skills.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {internship.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                    {internship.skills.length > 3 && (
                      <span className="text-xs text-gray-500">+{internship.skills.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}

              <Link
                to={`/internships/${internship._id}`}
                className={`block text-center px-4 py-2 rounded-md transition font-semibold ${
                  applicationStatuses[internship._id] === 'accepted'
                    ? 'bg-green-500 text-white cursor-default pointer-events-none'
                    : applicationStatuses[internship._id] === 'pending'
                    ? 'bg-yellow-500 text-white cursor-default pointer-events-none'
                    : applicationStatuses[internship._id] === 'rejected'
                    ? 'bg-red-500 text-white cursor-default pointer-events-none'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {applicationStatuses[internship._id] === 'accepted'
                  ? 'Application Accepted ✓'
                  : applicationStatuses[internship._id] === 'pending'
                  ? 'Application Pending...'
                  : applicationStatuses[internship._id] === 'rejected'
                  ? 'Application Rejected'
                  : 'View Full Details'}
              </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredInternships.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No internships found.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default InternshipsPage;
