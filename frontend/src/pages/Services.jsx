import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, X, Filter, MapPin, ArrowRight, User, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { locationData } from '../data/locationData.js';

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Cascading location state (persisted via sessionStorage, defaults to Bhimavaram)
    const [selectedCountry, setSelectedCountry] = useState(() => sessionStorage.getItem('wei_loc_country') || 'India');
    const [selectedState, setSelectedState] = useState(() => sessionStorage.getItem('wei_loc_state') || 'Andhra Pradesh');
    const [selectedDistrict, setSelectedDistrict] = useState(() => sessionStorage.getItem('wei_loc_district') || 'West Godavari');
    const [selectedCity, setSelectedCity] = useState(() => sessionStorage.getItem('wei_loc_city') || 'Bhimavaram');
    const [selectedPincode, setSelectedPincode] = useState(() => sessionStorage.getItem('wei_loc_pincode') || '534201');
    const [districtLocations, setDistrictLocations] = useState([]);
    const [locationsLoading, setLocationsLoading] = useState(false);
    const [townNotFound, setTownNotFound] = useState(false);

    // Sync location selection to sessionStorage (so it persists across page navigations)
    useEffect(() => {
        sessionStorage.setItem('wei_loc_country', selectedCountry);
        sessionStorage.setItem('wei_loc_state', selectedState);
        sessionStorage.setItem('wei_loc_district', selectedDistrict);
        sessionStorage.setItem('wei_loc_city', selectedCity);
        sessionStorage.setItem('wei_loc_pincode', selectedPincode);
    }, [selectedCountry, selectedState, selectedDistrict, selectedCity, selectedPincode]);

    // Initial load for district locations if district was loaded from cache
    useEffect(() => {
        if (selectedDistrict) {
            handleDistrictChange({ target: { value: selectedDistrict } });
        }
    }, []); // Run only once on mount to populate the town dropdown

    const navigate = useNavigate();

    const categories = [
        'All',
        'Electrician',
        'AC Mechanic',
        'Bike Mechanic',
        'Painter',
        'Carpenter',
        'Cupboard Worker',
        'Cealing Worker',
        'Bike Rentals',
        'Car Rentals',
        'Bus Rentals',
        'Truck Rentals',
        'Embroidery Worker',
        'Stickering Worker',
        'Automobiles',
        'Wedding Planners',
    ];

    // --- Location handlers ---
    const handleCountryChange = (e) => {
        setSelectedCountry(e.target.value);
        setSelectedState('');
        setSelectedDistrict('');
        setSelectedCity('');
        setSelectedPincode('');
        setDistrictLocations([]);
        setTownNotFound(false);
    };

    const handleStateChange = (e) => {
        setSelectedState(e.target.value);
        setSelectedDistrict('');
        setSelectedCity('');
        setSelectedPincode('');
        setDistrictLocations([]);
        setTownNotFound(false);
    };

    const handleDistrictChange = async (e) => {
        const district = e.target.value;
        setSelectedDistrict(district);
        setSelectedCity('');
        setSelectedPincode('');
        setTownNotFound(false);

        if (district) {
            setLocationsLoading(true);
            try {
                const res = await axios.get(`/api/locations/district/${encodeURIComponent(district)}`);
                if (res.data.success) {
                    setDistrictLocations(res.data.data);
                } else {
                    setDistrictLocations([]);
                }
            } catch {
                setDistrictLocations([]);
            } finally {
                setLocationsLoading(false);
            }
        } else {
            setDistrictLocations([]);
        }
    };

    const handleVillageChange = (e) => {
        const val = e.target.value;
        if (!val) {
            setSelectedCity('');
            setSelectedPincode('');
            setTownNotFound(false);
            return;
        }
        if (val === '__OTHER__') {
            setTownNotFound(true);
            setSelectedCity('');
            setSelectedPincode('');
            return;
        }
        setTownNotFound(false);
        const [name, pin] = val.split('|');
        setSelectedCity(name);
        setSelectedPincode(pin);
    };

    // Fetch services whenever location or filters change — but only if district+city chosen
    useEffect(() => {
        if (!selectedDistrict || !selectedCity) {
            setServices([]);
            return;
        }

        const fetchServices = async () => {
            setLoading(true);
            try {
                const params = {};
                if (searchQuery) params.search = searchQuery;
                if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
                if (selectedCountry) params.country = selectedCountry;
                if (selectedState) params.state = selectedState;
                if (selectedDistrict) params.district = selectedDistrict;
                if (selectedCity) params.city = selectedCity;
                if (selectedPincode) params.pincode = selectedPincode;

                const response = await axios.get('/api/services', { params });
                setServices(response.data);
            } catch (error) {
                console.error('Error fetching services:', error);
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(fetchServices, 400);
        return () => clearTimeout(timeout);
    }, [searchQuery, selectedCategory, selectedCountry, selectedState, selectedDistrict, selectedCity, selectedPincode]);

    const hasLocation = selectedDistrict && selectedCity;

    return (
        <div className="min-h-screen bg-gray-50 font-body">
            <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">

                {/* Header */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">
                        Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Services</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Find trusted professionals in your area.
                    </p>
                </div>

                {/* Location + Filters panel */}
                <div className="bg-white shadow-sm border border-gray-100 p-5 rounded-2xl mb-10 animate-fade-in-up delay-100">

                    {/* Row 1: Cascading location selects */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        {/* Country */}
                        <select
                            value={selectedCountry}
                            onChange={handleCountryChange}
                            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                        >
                            <option value="">Select Country</option>
                            {Object.keys(locationData).map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        {/* State */}
                        <select
                            value={selectedState}
                            onChange={handleStateChange}
                            disabled={!selectedCountry}
                            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium disabled:opacity-50"
                        >
                            <option value="">Select State</option>
                            {selectedCountry && locationData[selectedCountry] && Object.keys(locationData[selectedCountry]).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>

                        {/* District */}
                        <select
                            value={selectedDistrict}
                            onChange={handleDistrictChange}
                            disabled={!selectedState}
                            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium disabled:opacity-50"
                        >
                            <option value="">Select District</option>
                            {selectedState && locationData[selectedCountry]?.[selectedState]?.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>

                        {/* Village / Town */}
                        <div>
                            <div className="relative">
                                <select
                                    value={townNotFound ? '__OTHER__' : (selectedCity && selectedPincode ? `${selectedCity}|${selectedPincode}` : '')}
                                    onChange={handleVillageChange}
                                    disabled={!selectedDistrict || locationsLoading}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium disabled:opacity-50 appearance-none"
                                >
                                    <option value="">Select Village / Town</option>
                                    {districtLocations.map((loc, idx) => (
                                        <option key={`${loc.name}-${loc.pincode}-${idx}`} value={`${loc.name}|${loc.pincode}`}>
                                            {loc.name} - {loc.pincode}
                                        </option>
                                    ))}
                                    <option value="__OTHER__">Other (Enter city name)</option>
                                </select>
                                {locationsLoading && (
                                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            {townNotFound && (
                                <input
                                    type="text"
                                    placeholder="Enter your city / town name"
                                    value={selectedCity}
                                    onChange={(e) => { setSelectedCity(e.target.value); setSelectedPincode(''); }}
                                    autoFocus
                                    className="w-full mt-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                                />
                            )}
                        </div>
                    </div>

                    {/* Row 2: Search + Category */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search for services..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                disabled={!hasLocation}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all font-medium text-sm disabled:opacity-50"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Category */}
                        <div className="relative flex-shrink-0 min-w-[200px]">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                disabled={!hasLocation}
                                className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all font-medium appearance-none cursor-pointer text-sm disabled:opacity-50"
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Services — shown only after district + city selected */}
                {!hasLocation ? (
                    <div className="w-full text-center py-20 animate-fade-in-up">
                        <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <MapPin className="w-10 h-10 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Select Your Location</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Please select a district and town / city above to view available services in your area.
                        </p>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500" />
                    </div>
                ) : services.length === 0 ? (
                    <div className="text-center py-20 animate-fade-in-up">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Search className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No services found</h3>
                        <p className="text-gray-500">No services available in <strong>{selectedCity}</strong> yet. Try a different filter.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up delay-200">
                        {services.map((service) => (
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
                                        {service.city && (
                                            <div className="flex items-center gap-1 text-xs font-medium opacity-90 mb-1">
                                                <MapPin className="w-3 h-3" /> {service.city}
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
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            {service.provider?.rating || 0}
                                            <span className="text-gray-400 font-normal">({service.provider?.reviewsCount || 0})</span>
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
