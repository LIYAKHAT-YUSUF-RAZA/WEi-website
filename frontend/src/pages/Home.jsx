import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Search, X, ChevronLeft, ChevronRight, Briefcase, Users, Award,
  TrendingUp, ArrowRight, Star, Clock, MapPin, IndianRupee, CheckCircle, Globe, ShoppingCart, Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { featuredInternships } from '../data/featuredData.js';
import { locationData } from '../data/locationData.js';

const Home = () => {
  const [companyInfo, setCompanyInfo] = useState(null);
  const [courses, setCourses] = useState([]);
  const [internships, setInternships] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedServiceRole, setSelectedServiceRole] = useState(null);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [contactLoading, setContactLoading] = useState(false);

  const handleContactChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      await axios.post('/api/contact', contactForm);
      alert('Message sent successfully! We will get back to you soon.');
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact error:', error);
      alert(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setContactLoading(false);
    }
  };

  // Advanced Filter States (persisted via sessionStorage, defaults to Bhimavaram)
  const [selectedCountry, setSelectedCountry] = useState(() => sessionStorage.getItem('wei_loc_country') || 'India');
  const [selectedState, setSelectedState] = useState(() => sessionStorage.getItem('wei_loc_state') || 'Andhra Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState(() => sessionStorage.getItem('wei_loc_district') || 'West Godavari');
  const [selectedCity, setSelectedCity] = useState(() => sessionStorage.getItem('wei_loc_city') || 'Bhimavaram');
  const [selectedPincode, setSelectedPincode] = useState(() => sessionStorage.getItem('wei_loc_pincode') || '534201');
  const [selectedServiceType, setSelectedServiceType] = useState('');

  // District locations lookup states
  const [districtLocations, setDistrictLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [townNotFound, setTownNotFound] = useState(false);

  // Sync location selection to sessionStorage
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
  }, []); // Run only once on mount

  const serviceTypes = [
    'Electrician', 'AC Mechanic', 'Bike Mechanic', 'Painter', 'Carpenter',
    'Cupboard Worker', 'Cealing Worker', 'Bike Rentals', 'Car Rentals',
    'Bus Rentals', 'Truck Rentals', 'Embroidery Worker', 'Stickering Worker',
    'Automobiles', 'Wedding Planners'
  ];

  // locationData is now imported from '../data/locationData.js'


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
      } catch (err) {
        console.error('Error fetching locations:', err);
        setDistrictLocations([]);
      } finally {
        setLocationsLoading(false);
      }
    } else {
      setDistrictLocations([]);
    }
  };

  const handleVillageChange = (e) => {
    const selectedVal = e.target.value;
    if (!selectedVal) {
      setSelectedCity('');
      setSelectedPincode('');
      setTownNotFound(false);
      return;
    }
    if (selectedVal === '__OTHER__') {
      setTownNotFound(true);
      setSelectedCity('');
      setSelectedPincode('');
      return;
    }
    setTownNotFound(false);
    const [name, pin] = selectedVal.split('|');
    setSelectedCity(name);
    setSelectedPincode(pin);
  };
  const [enrollments, setEnrollments] = useState({});
  const [applicationStatuses, setApplicationStatuses] = useState({});
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  // Demo homepage state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ courses: [], internships: [] });
  const coursesScrollRef = useRef(null);
  const internshipsScrollRef = useRef(null);

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&h=900&fit=crop',
      title: 'Transform Your Future',
      subtitle: 'Master the skills that drive the future. Join our ecosystem of learners and leaders.',
      cta: 'Explore Courses'
    },
    {
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&h=900&fit=crop',
      title: 'Code Your Dreams',
      subtitle: 'Get hands-on experience with real-world projects and expert mentorship.',
      cta: 'Start Learning'
    },
    {
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&h=900&fit=crop',
      title: 'Launch Your Career',
      subtitle: 'Connect with top companies and secure your dream internship today.',
      cta: 'Find Internships'
    }
  ];

  const careerStats = [
    { icon: <Users className="w-8 h-8" />, number: '10+', label: 'Students Placed', color: 'text-violet-500' },
    { icon: <Briefcase className="w-8 h-8" />, number: '5+', label: 'Partner Companies', color: 'text-fuchsia-500' },
    { icon: <Award className="w-8 h-8" />, number: '95%', label: 'Success Rate', color: 'text-cyan-500' },
    { icon: <TrendingUp className="w-8 h-8" />, number: '40%', label: 'Avg. Salary Hike', color: 'text-emerald-500' }
  ];

  const testimonials = [
    { name: 'Priya Sharma', role: 'Software Engineer', text: 'The courses are exceptional! I landed my dream job within 3 months.', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { name: 'Rahul Kumar', role: 'Data Analyst', text: 'Best learning experience ever. Highly recommended for everyone.', image: 'https://randomuser.me/api/portraits/men/32.jpg' }
  ];

  useEffect(() => {
    if (user && user.role === 'manager') {
      navigate('/manager/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        const promises = [
          axios.get('/api/company'),
          axios.get('/api/courses'),
          axios.get('/api/internships'),
          axios.get('/api/services')
        ];

        if (user && user.role === 'candidate') {
          promises.push(
            axios.get(`/api/enrollments/my-enrollments?t=${Date.now()}`),
            axios.get(`/api/applications/my-applications?t=${Date.now()}`)
          );
        }

        const results = await Promise.all(promises);
        const [companyRes, coursesRes, internshipsRes, servicesRes, enrollmentsRes, applicationsRes] = results;

        setCompanyInfo(companyRes.data);

        // Map Backend Services to UI Structure
        if (servicesRes.data && Array.isArray(servicesRes.data)) {
          const mappedServices = servicesRes.data.map(service => ({
            _id: service._id,
            role: service.category,
            name: service.provider?.name || 'Service Provider',
            location: service.location || 'India',
            country: service.country || 'India',
            state: service.state || '',
            district: service.district || '',
            city: service.city || '',
            pincode: service.pincode || '',
            image: service.image || `https://source.unsplash.com/random/800x600?${service.category}`,
            rating: service.provider?.rating || 0,
            reviews: service.provider?.reviewsCount || 0,
            price: service.price
          }));
          setServices(mappedServices);
        }

        // Robust data handling logic
        let dbCourses = [];
        if (coursesRes.data && Array.isArray(coursesRes.data)) {
          dbCourses = coursesRes.data;
        } else if (coursesRes.data && coursesRes.data.courses && Array.isArray(coursesRes.data.courses)) {
          dbCourses = coursesRes.data.courses;
        }
        setCourses(dbCourses);

        let dbInternships = [];
        if (internshipsRes.data && Array.isArray(internshipsRes.data)) {
          dbInternships = internshipsRes.data;
        } else if (internshipsRes.data && internshipsRes.data.internships && Array.isArray(internshipsRes.data.internships)) {
          dbInternships = internshipsRes.data.internships;
        }
        setInternships(dbInternships);

        if (enrollmentsRes) {
          const enrollmentMap = {};
          enrollmentsRes.data.forEach(enrollment => {
            const courseId = enrollment.course?._id || enrollment.course;
            enrollmentMap[courseId] = {
              status: enrollment.status,
              enrollmentId: enrollment._id,
              appliedAt: enrollment.appliedAt
            };
          });
          setEnrollments(enrollmentMap);
        }

        if (applicationsRes) {
          const statusMap = {};
          applicationsRes.data
            .filter(app => app.type === 'internship')
            .forEach(app => {
              statusMap[app.referenceId] = {
                status: app.status,
                applicationId: app._id,
                appliedAt: app.appliedAt
              };
            });
          setApplicationStatuses(statusMap);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setCourses([]);
        setInternships(featuredInternships);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  // Fetch filtered services from backend when filters change
  useEffect(() => {
    // Skip fetching on initial render since fetchData handles it
    if (services.length === 0 && !selectedCountry && !selectedState && !selectedDistrict && !serviceSearch && !selectedCity && !selectedPincode && !selectedServiceType) {
      return;
    }

    const fetchFilteredServices = async () => {
      try {
        const params = {};
        if (serviceSearch) params.search = serviceSearch;
        if (selectedServiceType) params.category = selectedServiceType;
        if (selectedCountry) params.country = selectedCountry;
        if (selectedState) params.state = selectedState;
        if (selectedDistrict) params.district = selectedDistrict;
        if (selectedCity) params.city = selectedCity;
        if (selectedPincode) params.pincode = selectedPincode;

        const response = await axios.get('/api/services', { params });

        // Map Backend Services to UI Structure
        if (response.data && Array.isArray(response.data)) {
          const mappedServices = response.data.map(service => ({
            _id: service._id,
            role: service.category,
            name: service.provider?.name || 'Service Provider',
            location: service.location || 'India',
            country: service.country || 'India',
            state: service.state || '',
            district: service.district || '',
            city: service.city || '',
            pincode: service.pincode || '',
            image: service.image || `https://source.unsplash.com/random/800x600?${service.category}`,
            rating: service.provider?.rating || 0,
            reviews: service.provider?.reviewsCount || 0,
            price: service.price
          }));
          setServices(mappedServices);
        }
      } catch (error) {
        console.error('Error fetching filtered services:', error);
      }
    };

    // Debounce the fetch slightly to avoid spamming the backend while typing
    const timeoutId = setTimeout(() => {
      fetchFilteredServices();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [serviceSearch, selectedServiceType, selectedCountry, selectedState, selectedDistrict, selectedCity, selectedPincode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const handleEnroll = async (courseId) => {
    if (!user || user.role !== 'candidate') {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    const course = courses.find(c => c._id === courseId);
    if (!course) return;

    const enrollment = enrollments[courseId];
    if (enrollment && (enrollment.status === 'pending' || enrollment.status === 'accepted')) {
      alert('You are already enrolled/pending in this course!');
      return;
    }

    try {
      const result = await addToCart(courseId, 'course');
      if (result.success) navigate('/cart');
      else alert(result.message || 'Failed to add to cart');
    } catch (error) {
      alert('Error adding course to cart');
    }
  };

  const getEnrollmentButton = (courseId) => {
    if (!user || user.role !== 'candidate') return { text: 'Enroll Now', disabled: false, action: () => handleEnroll(courseId) };
    const enrollment = enrollments[courseId];
    if (!enrollment) return { text: 'Enroll Now', disabled: false, action: () => handleEnroll(courseId) };
    if (enrollment.status === 'pending') return { text: 'Payment Pending', disabled: true, action: null };
    if (enrollment.status === 'accepted') return { text: 'Enrolled', disabled: true, action: null };
    return { text: 'Enroll Now', disabled: false, action: () => handleEnroll(courseId) };
  };

  const scroll = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction === 'left' ? -400 : 400, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin-slow rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-body overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          </div>
        ))}

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6 animate-fade-in-down drop-shadow-lg">
            {heroSlides[currentSlide].title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto animate-fade-in-up delay-200 drop-shadow-md">
            {heroSlides[currentSlide].subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
            <Link
              to="/courses"
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full font-bold text-lg hover:shadow-lg hover:shadow-violet-500/40 transform hover:-translate-y-1 transition-all duration-300"
            >
              Explore Courses
            </Link>
            <Link
              to="/internships"
              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300"
            >
              Find Internships
            </Link>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                }`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {careerStats.map((stat, index) => (
            <div key={index} className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className={`mx-auto w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-white group-hover:shadow-lg transition-all ${stat.color}`}>
                {stat.icon}
              </div>
              <h3 className="text-3xl font-bold text-gray-900 font-heading mb-1">{stat.number}</h3>
              <p className="text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image Side */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-2xl transform translate-x-3 translate-y-3 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-300"></div>
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80"
                alt="About WEintegrity"
                className="relative rounded-2xl shadow-xl w-full h-[400px] object-cover transform transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </div>

            {/* Content Side */}
            <div>
              <h2 className="text-4xl font-bold font-heading mb-6 text-gray-900">
                Empowering Your Tech <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
                  Career Journey
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At <span className="font-bold text-gray-800">WEintegrity</span>, we bridge the gap between academic learning and industry demands. Our platform provides cutting-edge courses and real-world internship opportunities designed to launch your career in technology.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Whether you're looking to master Full Stack Development, Data Science, or Cloud Computing, our expert-led programs and hands-on projects ensure you're job-ready from day one. Join a community of innovators and start building your future today.
              </p>
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-violet-600">50+</span>
                  <span className="text-sm text-gray-500 font-medium">Students Trained</span>
                </div>
                <div className="w-px h-12 bg-gray-200 mx-2"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-fuchsia-600">20+</span>
                  <span className="text-sm text-gray-500 font-medium">Hiring Partners</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Services Section */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-12 gap-8">
            <div className="lg:w-1/3">
              <h2 className="text-4xl font-bold font-heading mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
                  Our Free Services
                </span>
              </h2>
              <p className="text-gray-600 text-lg">
                Connect with trusted local experts.
              </p>
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-col gap-4 flex-grow w-full lg:w-auto bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Country Selection */}
                <select
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                >
                  <option value="">Select Country</option>
                  {Object.keys(locationData).map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>

                {/* State Selection */}
                <select
                  value={selectedState}
                  onChange={handleStateChange}
                  disabled={!selectedCountry}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium disabled:opacity-50"
                >
                  <option value="">Select State</option>
                  {selectedCountry && locationData[selectedCountry] && Object.keys(locationData[selectedCountry]).map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>

                {/* District Selection */}
                <select
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  disabled={!selectedState}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium disabled:opacity-50"
                >
                  <option value="">Select District</option>
                  {selectedState && locationData[selectedCountry]?.[selectedState]?.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>

                {/* Village / Town Selection */}
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
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {townNotFound && (
                    <input
                      type="text"
                      placeholder="Enter your city / town name"
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(e.target.value);
                        setSelectedPincode('');
                      }}
                      autoFocus
                      className="w-full mt-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    />
                  )}
                </div>

                {/* Type of Service */}
                <select
                  value={selectedServiceType}
                  onChange={(e) => setSelectedServiceType(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                >
                  <option value="">Type of Service</option>
                  {serviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>



              {/* Fast Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                  placeholder="Fast Search (Service type / Location)..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Services: shown only after district + city are selected */}
          {selectedDistrict && selectedCity ? (
            <div className="relative group/slider">
              <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {(() => {
                  const filteredServices = services; // services are now filtered by the backend

                  if (filteredServices.length === 0) {
                    return (
                      <div className="w-full text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm mx-4 col-span-full">
                        <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Services Found</h3>
                        <p className="text-gray-500">We couldn't find any services matching your criteria.</p>
                        <button
                          onClick={() => {
                            setServiceSearch('');
                            setSelectedState('');
                            setSelectedDistrict('');
                            setSelectedCity('');
                            setSelectedPincode('');
                            setSelectedServiceType('');
                            setSelectedCountry('India');
                            setSelectedServiceRole(null);
                            setDistrictLocations([]);
                            setTownNotFound(false);
                          }}
                          className="mt-4 text-blue-600 font-bold hover:underline"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    );
                  }

                  // Group services by role for Category View
                  const groupedServices = filteredServices.reduce((acc, service) => {
                    if (!acc[service.role]) {
                      acc[service.role] = [];
                    }
                    acc[service.role].push(service);
                    return acc;
                  }, {});

                  // If no specific role selected, show categories
                  if (!selectedServiceRole) {
                    return Object.entries(groupedServices).map(([role, services]) => (
                      <div key={role} className="min-w-[280px] md:min-w-[320px] snap-center">
                        <div
                          onClick={() => setSelectedServiceRole(role)}
                          className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group h-full cursor-pointer"
                        >
                          <div className="relative h-48 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                            <img
                              src={services[0].image}
                              alt={role}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute bottom-4 left-4 z-20 text-white">
                              <h3 className="font-bold text-xl">{role}</h3>
                              <div className="flex items-center gap-1 text-sm text-gray-200">
                                <Users className="w-4 h-4" /> {services.length} Experts Available
                              </div>
                            </div>
                          </div>
                          <div className="p-6 flex items-center justify-between text-blue-600 font-bold">
                            <span>View Providers</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    ));
                  }

                  // If role selected, show providers for that role
                  return (
                    <div className="w-full px-4">
                      <button
                        onClick={() => setSelectedServiceRole(null)}
                        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" /> Back to Categories
                      </button>

                      <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                        {filteredServices
                          .filter(service => service.role === selectedServiceRole)
                          .map((service) => (
                            <div key={service._id} className="min-w-[280px] md:min-w-[320px] snap-center">
                              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group h-full">
                                <div className="relative h-48 overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                  <img
                                    src={service.image}
                                    alt={service.role}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                  />
                                  <div className="absolute bottom-4 left-4 z-20 text-white">
                                    <h3 className="font-bold text-lg">{service.role}</h3>
                                    <div className="flex items-center gap-1 text-sm text-gray-200">
                                      <MapPin className="w-3 h-3" /> {service.location}
                                    </div>
                                  </div>
                                </div>

                                <div className="p-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <div>
                                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expert</p>
                                      <p className="font-bold text-gray-900">{service.name}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                      {service.name[0]}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-1.5">
                                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                      <span className="font-bold text-gray-900">{service.rating}</span>
                                      <span className="text-xs text-gray-500">({service.reviews})</span>
                                    </div>
                                    <Link
                                      to={`/services/${service._id}`}
                                      className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                      View Details
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="w-full text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Select Your Location</h3>
              <p className="text-gray-500 max-w-md mx-auto">Please select a district and town / city above to view available services in your area.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob delay-200" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold font-heading mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
                  Featured Courses
                </span>
              </h2>
              <p className="text-gray-600">Master the most in-demand skills</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/courses" className="group flex items-center gap-2 text-violet-600 font-bold hover:gap-3 transition-all">
                View All <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={() => scroll(coursesScrollRef, 'left')}
                  className="p-3 rounded-full bg-white shadow-md hover:shadow-lg hover:scale-105 transition-all text-gray-700"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => scroll(coursesScrollRef, 'right')}
                  className="p-3 rounded-full bg-white shadow-md hover:shadow-lg hover:scale-105 transition-all text-gray-700"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={coursesScrollRef}
            className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x"
            style={{ paddingLeft: '1rem', paddingRight: '1rem' }}
          >
            {courses.slice(0, 5).map((course) => {
              const { text, disabled, action } = getEnrollmentButton(course._id);
              return (
                <div
                  key={course._id}
                  className="min-w-[320px] md:min-w-[380px] glass-card rounded-2xl overflow-hidden snap-center group hover:border-violet-200"
                >
                  <Link to={`/courses/${course._id}`} className="block relative h-48 overflow-hidden cursor-pointer">
                    <img
                      src={course.thumbnail || 'https://placehold.co/400x200?text=No+Image'}
                      alt={course.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-violet-600 shadow-sm">
                      {course.category}
                    </div>
                  </Link>

                  <div className="p-6">
                    <Link to={`/courses/${course._id}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-violet-600 transition-colors cursor-pointer">
                        {course.title}
                      </h3>
                    </Link>
                    <div className="flex gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" /> 4.8
                      </div>
                    </div>

                    {/* Impressive Price Section */}
                    <div className="flex justify-between items-start mb-6 relative min-h-[70px]">
                      <div className="flex flex-col justify-center">
                        {/* Original Price with Sequential Strike Animation */}
                        <div className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
                          Regular:
                          <span className="text-gray-400 text-sm animate-strike relative inline-block">
                            ₹{course.originalPrice || course.price + 2000}
                          </span>
                        </div>

                        {/* Discount Price with Pop-in Animation */}
                        <div className="flex items-end gap-2 mt-0.5 animate-price-pop">
                          <div className="flex flex-col leading-none justify-end pb-1">
                            <span className="text-[10px] uppercase font-bold text-green-600 leading-none">Special</span>
                            <span className="text-[10px] uppercase font-bold text-green-600 leading-none">Price:</span>
                          </div>
                          <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 leading-none tracking-tight drop-shadow-sm">
                            ₹{course.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Discount Badge - Animated */}
                      {(course.discountPercentage > 0 || course.originalPrice > course.price) && (
                        <div className="bg-gradient-to-br from-rose-500 via-red-500 to-pink-600 text-white rounded-lg p-1.5 flex flex-col items-center justify-center w-[60px] h-[70px] shadow-lg shadow-rose-200/50 absolute -top-4 right-0 animate-discount-swing">
                          <div className="mb-0.5"><Star className="w-3 h-3 text-yellow-300 fill-yellow-300 animate-pulse" /></div>
                          <div className="text-lg font-black leading-none tracking-tighter filter drop-shadow-md">
                            {course.discountPercentage || Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}%
                          </div>
                          <div className="text-[9px] font-bold uppercase mt-0.5 tracking-wider">OFF</div>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex gap-3">
                      <button
                        onClick={action}
                        disabled={disabled}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${disabled
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-violet-500/30 hover:shadow-lg'
                          }`}
                      >
                        {text === 'Enroll Now' && <IndianRupee className="w-4 h-4" />}
                        {text}
                      </button>

                      {!disabled && (
                        <button
                          onClick={() => addToCart(course._id, 'course')}
                          disabled={isInCart(course._id, 'course')}
                          className={`p-3 rounded-xl border transition-colors shadow-sm active:scale-95 flex items-center justify-center group/cart ${isInCart(course._id, 'course')
                            ? 'bg-green-50 text-green-600 border-green-200 cursor-default'
                            : 'bg-violet-50 text-violet-600 border-violet-100 hover:bg-violet-100 hover:border-violet-200'
                            }`}
                          title={isInCart(course._id, 'course') ? "Added to Cart" : "Add to Cart"}
                        >
                          {isInCart(course._id, 'course') ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <ShoppingCart className="w-5 h-5 group-hover/cart:fill-current transition-colors" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Internships Section */}
      <section className="py-24 relative bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold font-heading mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">
                  Top Internships
                </span>
              </h2>
              <p className="text-gray-600">Kickstart your career with top companies</p>
            </div>
            <Link to="/internships" className="group flex items-center gap-2 text-cyan-600 font-bold hover:gap-3 transition-all">
              View All <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {internships.slice(0, 6).map((internship) => (
              <div
                key={internship._id}
                className="group glass-card rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full transform hover:-translate-y-1"
              >
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

                <div className="p-6 flex flex-col flex-grow relative bg-white">
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

                  {/* Stipend Section (Visual) */}
                  <div className="mt-auto mb-6">
                    <div className="p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100 flex justify-between items-center group-hover:border-cyan-200 transition-colors">
                      <span className="text-xs font-bold text-gray-500 uppercase">Stipend</span>
                      <div className="flex items-center gap-1 font-bold text-gray-900">
                        <span className="text-cyan-600"><IndianRupee className="w-4 h-4" /></span>
                        <span className="text-lg">{internship.stipend || 'Unpaid'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/internships/${internship._id}`}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-cyan-500/30 hover:shadow-xl group-hover:gap-3"
                  >
                    View Details <ArrowRight className="w-4 h-4 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-gray-900 relative overflow-hidden" id="contact">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/50 to-fuchsia-900/50" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Contact Info */}
            <div className="text-white">
              <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                Get in Touch
              </h2>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                Have questions or want to collaborate? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-fuchsia-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Visit Us</h3>
                    <div className="space-y-4 text-gray-300 text-sm">
                      <div>
                        <strong className="text-white block mb-1">HYDERABAD:</strong>
                        <p>HUDA Techno Enclave, 3rd Floor, Plot 20, HITEC City, Telangana - 500081, India.</p>
                      </div>
                      <div className="w-full h-px bg-white/10"></div>
                      <div>
                        <strong className="text-white block mb-1">BHIMAVARAM:</strong>
                        <p>Rams Plaza, 3rd Floor, Opp: Hotlines Bakery, Andhra Pradesh - 534202, India.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Call Us</h3>
                    <a href="tel:+917093783358" className="text-gray-300 hover:text-white hover:underline transition-colors font-mono text-lg">
                      +91 70937 83358
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Email Us</h3>
                    <p className="text-gray-300">contact@weintegrity.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Working Hours</h3>
                    <p className="text-gray-300">Mon - Fri: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleContactChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-violet-500/30 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {contactLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>Send Message <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
