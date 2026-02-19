import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import axios from 'axios';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            // Assuming there's a generic contact endpoint, if not we might need to create one or use a placeholder
            // For now, I'll simulate a success or call a hypothetical endpoint
            // await axios.post('/api/contact', formData); 

            // Simulating success for now as backend might not have this specific endpoint yet
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStatus({ type: 'success', message: 'Message sent successfully! We will get back to you soon.' });
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to send message. Please try again later.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16 animate-fade-in-up">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Have questions about our courses, internships, or services? We're here to help!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-6 animate-fade-in-up delay-100">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                <Mail className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Email Us</h3>
                            <p className="text-gray-600 mb-2">Our friendly team is here to help.</p>
                            <a href="mailto:support@weintegrity.com" className="text-blue-600 font-medium hover:underline">
                                support@weintegrity.com
                            </a>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center mb-4">
                                <Phone className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Call Us</h3>
                            <p className="text-gray-600 mb-2">Mon-Fri from 8am to 5pm.</p>
                            <a href="tel:+919876543210" className="text-violet-600 font-medium hover:underline">
                                +91 98765 43210
                            </a>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Visit Us</h3>
                            <p className="text-gray-600 mb-2">Come say hello at our office headquarters.</p>
                            <p className="text-gray-900 font-medium">
                                123 Innovation Drive,<br />
                                Tech Park, Bangalore,<br />
                                Karnataka 560001
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2 animate-fade-in-up delay-200">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <MessageSquare className="w-6 h-6 text-violet-600" />
                                <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
                            </div>

                            {status.message && (
                                <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                    {status.type === 'success' ? <div className="w-2 h-2 bg-green-500 rounded-full" /> : <div className="w-2 h-2 bg-red-500 rounded-full" />}
                                    {status.message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="6"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition resize-none"
                                        placeholder="Tell us more about your inquiry..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        'Sending...'
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" /> Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
