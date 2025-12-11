import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/public/Navbar.jsx';
import Footer from '../components/public/Footer.jsx';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get('/api/applications/my-applications');
        setApplications(response.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Applications</h1>
        
        {/* Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filter === 'pending'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filter === 'accepted'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Accepted
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filter === 'rejected'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div key={application._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold">
                      {application.type === 'course' ? 'Course' : 'Internship'} Application
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Applied on {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{application.candidateDetails.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{application.candidateDetails.phone || 'N/A'}</p>
                </div>
              </div>

              {application.candidateDetails.education && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Education</p>
                  <p className="font-medium">{application.candidateDetails.education}</p>
                </div>
              )}

              {application.candidateDetails.coverLetter && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Cover Letter</p>
                  <p className="text-gray-700">{application.candidateDetails.coverLetter}</p>
                </div>
              )}

              {application.notes && (
                <div className="bg-gray-50 p-4 rounded mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Feedback from Manager:</p>
                  <p className="text-gray-600">{application.notes}</p>
                </div>
              )}

              {application.reviewedAt && (
                <p className="text-sm text-gray-500 mt-4">
                  Reviewed on {new Date(application.reviewedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No applications found.</p>
            <p className="text-gray-400 mt-2">Start by applying to courses or internships!</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyApplications;
