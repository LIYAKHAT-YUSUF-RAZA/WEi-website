import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, X, Filter, MapPin, Tag, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Services = () => {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedLocation, setSelectedLocation] = useState('');
    const navigate = useNavigate();

    const categories = [
        'All',
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
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get('/api/services');
            setServices(response.data);
            setFilteredServices(response.data);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = services;

        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(service =>
                service.title.toLowerCase().includes(query) ||
                service.description.toLowerCase().includes(query) ||
                service.location?.toLowerCase().includes(query)
            );
        }

        // Category Filter
        if (selectedCategory !== 'All') {
            result = result.filter(service => service.category === selectedCategory);
        }

        // Location Filter (simple client-side for now)
        if (selectedLocation) {
            result = result.filter(service =>
                service.location?.toLowerCase().includes(selectedLocation.toLowerCase())
            );
        }

        setFilteredServices(result);
    }, [searchQuery, selectedCategory, selectedLocation, services]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin-slow rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    // Get unique locations for filter
    const locations = [...new Set(services.map(s => s.location).filter(Boolean))];

    return (
        <div className="min-h-screen bg-gray-50 font-body">
            <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">
                        Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Services</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Find trusted professionals for all your home and personal needs.
                    </p>
                </div>

                {/* Filters */}
                <div className="glass-panel p-4 rounded-2xl mb-12 flex flex-col md:flex-row gap-4 items-center animate-fade-in-up delay-100 bg-white shadow-sm border border-gray-100">
                    <div className="relative flex-grow w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search for services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-200 transition-all font-medium outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <div className="relative flex-shrink-0 min-w-[200px]">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full pl-10 pr-8 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-200 transition-all font-medium appearance-none cursor-pointer outline-none"
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div className="relative flex-shrink-0 min-w-[200px]">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="w-full pl-10 pr-8 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-200 transition-all font-medium appearance-none cursor-pointer outline-none"
                            >
                                <option value="">All Locations</option>
                                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Services Grid */}
                {filteredServices.length === 0 ? (
                    <div className="text-center py-20 animate-fade-in-up">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Search className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No services found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up delay-200">
                        {filteredServices.map((service) => (
                            <div key={service._id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col h-full">
                                <Link to={`/services/${service._id}`} className="block relative h-56 overflow-hidden flex-shrink-0">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                    <img
                                        src={service.image || `https://source.unsplash.com/random/800x600?${service.category.replace(' & ', ',')}`}
                                        alt={service.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-blue-700 shadow-lg">
                                            {service.category}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 z-20 text-white w-full pr-4">
                                        {service.location && (
                                            <div className="flex items-center gap-1 text-xs font-medium opacity-90 mb-1">
                                                <MapPin className="w-3 h-3" /> {service.location}
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                <div className="p-6 flex-grow flex flex-col">
                                    <h3 className="text-xl font-bold font-heading text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {service.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
                                        {service.description}
                                    </p>

                                    <div className="flex items-center gap-2 mb-4 pt-4 border-t border-gray-50 flex-wrap">
                                        <div className="flex items-center gap-2 mr-auto">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden">
                                                {service.provider?.profilePicture ? (
                                                    <img src={service.provider.profilePicture} alt={service.provider.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-gray-500">By</span> <span className="font-semibold text-gray-900">{service.provider?.name || 'Service Provider'}</span>
                                                {service.provider?.createdAt && ((new Date() - new Date(service.provider.createdAt)) / (1000 * 60 * 60 * 24) < 7) && (
                                                    <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                        New
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                                            <span className="text-yellow-500">★</span> {service.provider?.rating || 0} <span className="text-gray-400 font-normal">({service.provider?.reviewsCount || 0})</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="text-2xl font-bold text-gray-900">
                                            ₹{service.price}
                                        </div>
                                        <Link
                                            to={`/services/${service._id}`}
                                            className="px-4 py-2 bg-gray-50 text-gray-700 font-semibold rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2 text-sm"
                                        >
                                            View Details <ArrowRight className="w-4 h-4" />
                                        </Link>
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

export default Services;
