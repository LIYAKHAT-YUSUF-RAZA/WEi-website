import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    MapPin, Calendar, Clock, ArrowLeft, Share2,
    Shield, CheckCircle, User, MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ServiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [service, setService] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const serviceRes = await axios.get(`/api/services/${id}`);
                setService(serviceRes.data);

                if (serviceRes.data.provider?._id) {
                    const reviewsRes = await axios.get(`/api/reviews/${serviceRes.data.provider._id}`);
                    setReviews(reviewsRes.data);
                }
            } catch (error) {
                console.error('Error fetching details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin-slow rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Service Not Found</h2>
                <button onClick={() => navigate('/services')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Back to Services</button>
            </div>
        );
    }

    const { provider } = service;

    return (
        <div className="min-h-screen bg-gray-50 font-body pb-20">
            {/* Hero Section */}
            <div className="relative h-[400px] md:h-[500px]">
                <div className="absolute inset-0">
                    <img
                        src={service.image || `https://source.unsplash.com/random/1200x800?${service.category.replace(' & ', ',')}`}
                        alt={service.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                </div>

                <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-12 max-w-7xl mx-auto">
                    <div className="pt-20">
                        <Link to="/services" className="inline-flex items-center gap-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full transition-all text-sm font-medium">
                            <ArrowLeft className="w-4 h-4" /> Back to Services
                        </Link>
                    </div>

                    <div className="text-white animate-fade-in-up">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-blue-600 rounded-full text-xs font-bold uppercase tracking-wide">{service.category}</span>
                            {service.location && (
                                <span className="flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">
                                    <MapPin className="w-3 h-3" /> {service.location}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold font-heading mb-4 leading-tight max-w-4xl">{service.title}</h1>

                        {/* Provider Mini Info */}
                        <div className="flex items-center gap-4 text-white/90">
                            <div className="flex items-center gap-2">
                                <img
                                    src={provider?.profilePicture || `https://ui-avatars.com/api/?name=${provider?.name}&background=random`}
                                    alt={provider?.name}
                                    className="w-10 h-10 rounded-full border-2 border-white/30"
                                />
                                <span className="font-medium text-lg">{provider?.name}</span>
                            </div>
                            <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                            <div className="flex items-center gap-1 text-yellow-400 font-bold">
                                <Shield className="w-4 h-4" />
                                {provider?.rating || 0} ({provider?.reviewsCount || 0} reviews)
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Service Description */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">About this Service</h2>
                            <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                                {service.description}
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                Customer Reviews <span className="text-sm font-normal text-gray-500">({reviews.length})</span>
                            </h2>

                            {reviews.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No reviews yet.</div>
                            ) : (
                                <div className="space-y-6">
                                    {reviews.map(review => (
                                        <div key={review._id} className="border-b border-gray-50 last:border-0 pb-6 last:pb-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-xs">
                                                        {review.user?.name?.[0] || 'U'}
                                                    </div>
                                                    <span className="font-bold text-gray-900">{review.user?.name || 'Anonymous'}</span>
                                                </div>
                                                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Shield key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                                                ))}
                                            </div>
                                            <p className="text-gray-600 text-sm">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Provider Profile */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Provider Stats Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-24">
                            <div className="flex flex-col items-center text-center mb-6">
                                <img
                                    src={provider?.profilePicture || `https://ui-avatars.com/api/?name=${provider?.name}&background=random`}
                                    alt={provider?.name}
                                    className="w-24 h-24 rounded-full border-4 border-blue-50 mb-3"
                                />
                                <h3 className="text-xl font-bold text-gray-900">{provider?.name}</h3>
                                <p className="text-blue-600 font-medium text-sm">{service.category} Expert</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-3 rounded-xl text-center">
                                    <div className="text-lg font-bold text-gray-900">{provider?.experience || 0}+ Years</div>
                                    <div className="text-xs text-gray-500">Experience</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl text-center">
                                    <div className="text-lg font-bold text-gray-900">{provider?.problemsSolved || 0}+</div>
                                    <div className="text-xs text-gray-500">Problems Solved</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl text-center col-span-2">
                                    <div className="flex items-center justify-center gap-1 text-lg font-bold text-gray-900">
                                        {provider?.rating || 0} <Shield className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    </div>
                                    <div className="text-xs text-gray-500">Customer Rating</div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-4 border-t border-gray-100 pt-6">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <p className="text-sm">{provider?.address || service.location || 'Location not specified'}</p>
                                </div>

                                {user ? (
                                    <>
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                                                <MessageSquare className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <a href={`tel:${provider?.phone}`} className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">
                                                    {provider?.phone || 'No phone'}
                                                </a>
                                                {provider?.secondaryPhone && <p className="text-xs text-gray-500">{provider.secondaryPhone}</p>}
                                            </div>
                                        </div>
                                        <a
                                            href={`tel:${provider?.phone}`}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <MessageSquare className="w-4 h-4" /> Call Now
                                        </a>
                                    </>
                                ) : (
                                    <div className="p-4 bg-orange-50 rounded-xl text-center">
                                        <p className="text-sm text-orange-800 font-medium mb-2">Login to view contact details</p>
                                        <button
                                            onClick={() => navigate('/login', { state: { from: `/services/${id}` } })}
                                            className="text-orange-600 font-bold text-sm underline"
                                        >
                                            Login / Register
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>Member since {new Date(provider?.createdAt || Date.now()).getFullYear()}</span>
                                    {((new Date() - new Date(provider?.createdAt || Date.now())) / (1000 * 60 * 60 * 24) < 7) && (
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full animate-pulse">
                                            New
                                        </span>
                                    )}
                                    <span>Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetails;
