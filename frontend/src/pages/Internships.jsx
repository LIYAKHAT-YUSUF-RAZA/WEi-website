import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Search, MapPin, Clock, DollarSign, Briefcase, Building } from 'lucide-react';

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [applicationStatuses, setApplicationStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInternships();
    fetchApplicationStatuses();
  }, []);

  const fetchInternships = async () => {
    try {
      const response = await axios.get('/api/internships');
      setInternships(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching internships:', error);
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

  // Get unique types and locations for filters
  const types = ['all', ...new Set(internships.map(i => i.type).filter(Boolean))];
  const locations = ['all', ...new Set(internships.map(i => i.location).filter(Boolean))];

  // Filter internships
  const filteredInternships = internships.filter(internship => {
    const matchesSearch = internship.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         internship.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         internship.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || internship.type === selectedType;
    const matchesLocation = selectedLocation === 'all' || internship.location === selectedLocation;
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const getStatusButton = (internshipId, status) => {
    if (status === 'accepted') {
      return (
        <button
          onClick={() => navigate(`/internships/${internshipId}`)}
          className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-600 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Application Accepted ✓
        </button>
      );
    }

    if (status === 'pending') {
      return (
        <button
          onClick={() => navigate(`/internships/${internshipId}`)}
          className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-yellow-600 transition-all"
        >
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Application Pending...
        </button>
      );
    }

    if (status === 'rejected') {
      return (
        <button
          onClick={() => navigate(`/internships/${internshipId}`)}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reapply Now
        </button>
      );
    }

    return (
      <button
        onClick={() => navigate(`/internships/${internshipId}`)}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
      >
        Apply Now
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading internships...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <button
            onClick={() => navigate('/candidate/dashboard')}
            className="flex items-center gap-2 mb-6 hover:text-purple-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-5xl font-bold mb-4">Internship Opportunities</h1>
          <p className="text-xl text-purple-100">Launch your career with hands-on experience</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search internships by title, company, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="space-y-4">
            {/* Type Filter */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Type</h3>
              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedType === type
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'all' ? 'All Types' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Location</h3>
              <div className="flex flex-wrap gap-2">
                {locations.slice(0, 8).map((location) => (
                  <button
                    key={location}
                    onClick={() => setSelectedLocation(location)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedLocation === location
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {location === 'all' ? 'All Locations' : location}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-purple-600">{filteredInternships.length}</span> of{' '}
              <span className="font-semibold">{internships.length}</span> internships
            </p>
          </div>
        </div>

        {/* Internships Grid */}
        {filteredInternships.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Internships Found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInternships.map((internship) => (
              <div
                key={internship._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                {/* Internship Image */}
                {internship.image ? (
                  <img
                    src={internship.image}
                    alt={internship.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Briefcase className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}

                <div className="p-6">
                  {/* Type Badge */}
                  <div className="mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      internship.type === 'Remote'
                        ? 'bg-green-100 text-green-700'
                        : internship.type === 'On-site'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {internship.type || 'Hybrid'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{internship.title}</h3>

                  {/* Company/Department */}
                  {(internship.company || internship.department) && (
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <Building className="w-4 h-4" />
                      <span className="text-sm font-medium">{internship.company || internship.department}</span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{internship.description}</p>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <MapPin className="w-4 h-4 text-purple-600" />
                      <span>{internship.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span>{internship.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <DollarSign className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold text-green-600">{internship.stipend}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  {internship.skills && internship.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {internship.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {internship.skills.length > 3 && (
                          <span className="text-xs text-gray-500">+{internship.skills.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {getStatusButton(internship._id, applicationStatuses[internship._id])}
                    <button
                      onClick={() => navigate(`/internships/${internship._id}`)}
                      className="w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Internships;
