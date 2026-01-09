import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, PlusCircle, Settings, Award } from 'lucide-react';

const ServiceProviderDashboard = () => {
    const [stats, setStats] = useState({
        totalServices: 0,
        activeServices: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/services/my/all');
            const services = response.data;
            setStats({
                totalServices: services.length,
                activeServices: services.filter(s => s.status === 'active').length
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 pt-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Service Provider Dashboard</h1>
                    <p className="text-gray-600 mt-2">Manage your services and view your performance.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Total Services</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalServices}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                <Briefcase className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Active Services</p>
                                <h3 className="text-3xl font-bold text-green-600 mt-1">{stats.activeServices}</h3>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg text-green-600">
                                <Award className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link
                        to="/service-provider/services"
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-purple-50 rounded-full text-purple-600 group-hover:scale-110 transition-transform">
                                <Settings className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Manage Services</h3>
                                <p className="text-gray-500 text-sm mt-1">View, edit, and delete your services</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/service-provider/services"
                        state={{ openAddModal: true }} // Pass state to open add modal immediately
                        className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl shadow-lg text-white hover:from-blue-700 hover:to-indigo-800 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-white/20 rounded-full text-white group-hover:scale-110 transition-transform">
                                <PlusCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Add New Service</h3>
                                <p className="text-blue-100 text-sm mt-1">List a new service for customers</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ServiceProviderDashboard;
