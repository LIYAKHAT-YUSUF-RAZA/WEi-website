import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Clock, DollarSign, Briefcase, Building, Filter, X, CheckCircle, Globe, ArrowRight } from 'lucide-react';

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
      let internshipData = [];
      if (response.data && Array.isArray(response.data)) {
        internshipData = response.data;
      } else if (response.data && response.data.internships && Array.isArray(response.data.internships)) {
        internshipData = response.data.internships;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        internshipData = response.data.data;
      }
      setInternships(internshipData);
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

  const types = ['all', ...new Set(internships.map(i => i.type).filter(Boolean))];
  const locations = ['all', ...new Set(internships.map(i => i.location).filter(Boolean))];

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = internship.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || internship.type === selectedType;
    const matchesLocation = selectedLocation === 'all' || internship.location === selectedLocation;

    return matchesSearch && matchesType && matchesLocation;
  });

  const getStatusButton = (internshipId, status) => {
    if (status) {
      const config = {
        accepted: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" />, text: 'Accepted' },
        pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4" />, text: 'Applied' },
        rejected: { color: 'bg-red-100 text-red-700', icon: <X className="w-4 h-4" />, text: 'Rejected' },
      }[status] || { color: 'bg-gray-100 text-gray-700', icon: null, text: status };

      return (
        <button
          onClick={() => navigate(`/internships/${internshipId}`)}
          className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-default ${config.color}`}
        >
          {config.icon} {config.text}
        </button>
      );
    }

    return (
      <button
        onClick={() => navigate(`/internships/${internshipId}`)}
        className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
      >
        Apply Now
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin-slow rounded-full h-16 w-16 border-t-2 border-b-2 border-fuchsia-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-body">

      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">
            Find Your Dream <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-purple-600">Internship</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Kickstart your career with opportunities from top companies.
          </p>
        </div>

        {/* Filters */}
        <div className="glass-panel p-6 rounded-3xl mb-12 animate-fade-in-up delay-100">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="relative col-span-1 md:col-span-3 lg:col-span-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search job titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border-none rounded-xl focus:ring-2 focus:ring-fuchsia-200"
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center md:col-span-2">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mr-2"><Filter className="w-4 h-4 inline mr-1" /> filters:</span>
              <select
                className="px-4 py-2 bg-white border border-gray-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-fuchsia-200 cursor-pointer"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {types.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>)}
              </select>

              <select
                className="px-4 py-2 bg-white border border-gray-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-fuchsia-200 cursor-pointer"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                {locations.slice(0, 5).map(l => <option key={l} value={l}>{l === 'all' ? 'All Locations' : l}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up delay-200">
          {filteredInternships.length > 0 ? (
            filteredInternships.map(internship => (
              <div key={internship._id} className="group glass-card rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full transform hover:-translate-y-1 bg-white">
                {/* Image Header */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
                  <img
                    src={internship.image || 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80'}
                    alt={internship.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1 bg-white/95 backdrop-blur text-cyan-700 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                      {internship.type === 'Remote' ? <Globe className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                      {internship.type}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow relative">
                  {/* Company & Title */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-md bg-cyan-50 flex items-center justify-center text-cyan-600 font-bold text-xs uppercase">
                        {internship.company?.name?.[0] || 'C'}
                      </div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{internship.company?.name || 'Top Company'}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 font-heading leading-tight group-hover:text-cyan-600 transition-colors line-clamp-2">
                      {internship.title}
                    </h3>
                  </div>

                  {/* Meta Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                      <MapPin className="w-4 h-4 text-cyan-500" />
                      <span className="truncate">{internship.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                      <Clock className="w-4 h-4 text-cyan-500" />
                      <span className="truncate">{internship.duration}</span>
                    </div>
                  </div>

                  {/* Stipend Section */}
                  <div className="mt-auto mb-6">
                    <div className="p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100 flex justify-between items-center group-hover:border-cyan-200 transition-colors">
                      <span className="text-xs font-bold text-gray-500 uppercase">Stipend</span>
                      <div className="flex items-center gap-1 font-bold text-gray-900">
                        <span className="text-cyan-600"><DollarSign className="w-4 h-4" /></span>
                        <span className="text-lg">{internship.stipend || 'Unpaid'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/internships/${internship._id}`)}
                      className="px-4 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-600 hover:border-cyan-600 hover:text-cyan-600 transition-all text-sm flex-1"
                    >
                      Details
                    </button>
                    {getStatusButton(internship._id, applicationStatuses[internship._id])}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">No internships found</h3>
              <p className="text-gray-500">Try changing your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Internships;
