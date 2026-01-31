import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/public/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const InternshipDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [applicationData, setApplicationData] = useState({
    resume: '',
    resumeUrl: '',
    coverLetter: '',
    coverLetterUrl: '',
    education: '',
    experience: ''
  });

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        const response = await axios.get(`/api/internships/${id}`);
        setInternship(response.data);
      } catch (error) {
        console.error('Error fetching internship:', error);
        setMessage({ type: 'error', text: 'Internship not found' });
      } finally {
        setLoading(false);
      }
    };

    fetchInternship();
  }, [id]);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!user) return;

      try {
        const response = await axios.get('/api/applications/my-applications');
        const applications = response.data;
        const existingApp = applications.find(
          app => app.type === 'internship' && app.referenceId === id
        );
        if (existingApp) {
          setApplicationStatus(existingApp.status);
        }
      } catch (error) {
        console.error('Error checking application status:', error);
      }
    };

    if (user && user.role === 'candidate') {
      checkApplicationStatus();
    }
  }, [id, user]);

  const handleChange = (e) => {
    setApplicationData({
      ...applicationData,
      [e.target.name]: e.target.value
    });
  };

  const handleResumeFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Resume file size should be less than 5MB' });
        return;
      }
      setResumeFile(file);
      setMessage({ type: '', text: '' });

      const reader = new FileReader();
      reader.onloadend = () => {
        setApplicationData({
          ...applicationData,
          resume: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverLetterFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Cover letter file size should be less than 5MB' });
        return;
      }
      setCoverLetterFile(file);
      setMessage({ type: '', text: '' });

      const reader = new FileReader();
      reader.onloadend = () => {
        setApplicationData({
          ...applicationData,
          coverLetter: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();

    const finalResumeUrl = applicationData.resume || applicationData.resumeUrl;
    if (!finalResumeUrl) {
      setMessage({ type: 'error', text: 'Please provide your resume (upload file or paste URL)' });
      return;
    }

    setApplying(true);
    setMessage({ type: '', text: '' });

    try {
      const documents = [{
        name: resumeFile ? resumeFile.name : 'Resume',
        url: finalResumeUrl,
        type: 'resume'
      }];

      const finalCoverLetterUrl = applicationData.coverLetter || applicationData.coverLetterUrl;
      if (finalCoverLetterUrl) {
        documents.push({
          name: coverLetterFile ? coverLetterFile.name : 'Cover Letter',
          url: finalCoverLetterUrl,
          type: 'cover_letter'
        });
      }

      await axios.post(`/api/internships/${id}/apply`, {
        candidateDetails: applicationData,
        documents
      });

      setMessage({ type: 'success', text: 'Successfully applied for the internship!' });
      setTimeout(() => navigate('/application-history'), 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Application failed. Please try again.'
      });
    } finally {
      setApplying(false);
    }
  };

  const getApplicationButton = () => {
    if (applicationStatus === 'accepted') {
      return (
        <button
          disabled
          className="w-full bg-green-500 text-white py-3 rounded-md font-semibold cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Application Accepted ✓
        </button>
      );
    }

    if (applicationStatus === 'pending') {
      return (
        <button
          disabled
          className="w-full bg-yellow-500 text-white py-3 rounded-md font-semibold cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Application Pending...
        </button>
      );
    }

    if (applicationStatus === 'rejected') {
      return (
        <button
          type="submit"
          disabled={applying}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-md font-semibold hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {applying ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reapply Now
            </>
          )}
        </button>
      );
    }

    return (
      <button
        type="submit"
        disabled={applying}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-md font-semibold hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {applying ? 'Submitting...' : 'Submit Application'}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-red-600">Internship not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Internship Image */}
            {internship.image && (
              <div className="mb-6">
                <img
                  src={internship.image}
                  alt={internship.title}
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}

            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{internship.title}</h1>
                  <p className="text-gray-600">{internship.department}</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-medium ${internship.type === 'Remote'
                  ? 'bg-green-100 text-green-800'
                  : internship.type === 'On-site'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                  }`}>
                  {internship.type}
                </span>
              </div>

              {/* Message */}
              {message.text && (
                <div className={`mb-6 p-4 rounded ${message.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
                  }`}>
                  {message.text}
                </div>
              )}

              <div className="border-t border-b py-4 my-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold">{internship.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-semibold">{internship.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stipend</p>
                  <p className="font-semibold">{internship.stipend}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Openings</p>
                  <p className="font-semibold">{internship.openings} position{internship.openings !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Applicants</p>
                  <p className="font-semibold">{internship.applicants || 0} applied</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold capitalize">{internship.status || 'Active'}</p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">About the Internship</h2>
                <p className="text-gray-700 leading-relaxed">{internship.description}</p>
              </div>

              {internship.responsibilities && internship.responsibilities.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-3">Responsibilities</h2>
                  <ul className="space-y-2">
                    {internship.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary-600 mr-2">•</span>
                        <span className="text-gray-700">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {internship.requirements && internship.requirements.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-3">Requirements</h2>
                  <ul className="space-y-2">
                    {internship.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary-600 mr-2">✓</span>
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {internship.skills && internship.skills.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-3">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {internship.skills.map((skill, idx) => (
                      <span key={idx} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Application Form or Login Prompt */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              {(!user || user.role !== 'candidate') ? (
                // Guest / Non-Candidate View
                <div className="text-center py-8">
                  <div className="mb-6">
                    <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Login to Apply</h3>
                  <p className="text-gray-600 mb-6">
                    You need to be logged in as a candidate to apply for this internship.
                  </p>
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      state={{ from: `/internships/${id}` }}
                      className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:shadow-lg hover:scale-[1.02] transition-all"
                    >
                      Login Now
                    </Link>
                    <p className="text-sm text-gray-500">
                      New here? <Link to="/register" className="text-blue-600 font-bold hover:underline">Create an account</Link>
                    </p>
                  </div>
                </div>
              ) : (
                // Candidate Application Form
                <>
                  <h3 className="text-xl font-bold mb-4">Apply for this Internship</h3>
                  <form onSubmit={handleApply} className="space-y-4">
                    {/* Resume Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resume <span className="text-red-500">*</span>
                      </label>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Upload File</label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeFileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                          />
                          {resumeFile && (
                            <p className="text-sm text-green-600 mt-1">
                              ✓ {resumeFile.name}
                            </p>
                          )}
                        </div>

                        <div className="text-center text-xs text-gray-500">OR</div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Paste URL</label>
                          <input
                            type="url"
                            name="resumeUrl"
                            placeholder="Google Drive, Dropbox, OneDrive link"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                            value={applicationData.resumeUrl}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Accepted formats: PDF, DOC, DOCX (Max 5MB)
                      </p>
                    </div>

                    {/* Cover Letter Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Letter (Optional)
                      </label>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Upload File</label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleCoverLetterFileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                          />
                          {coverLetterFile && (
                            <p className="text-sm text-green-600 mt-1">
                              ✓ {coverLetterFile.name}
                            </p>
                          )}
                        </div>

                        <div className="text-center text-xs text-gray-500">OR</div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Paste URL</label>
                          <input
                            type="url"
                            name="coverLetterUrl"
                            placeholder="Google Drive, Dropbox, OneDrive link"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                            value={applicationData.coverLetterUrl}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Experience
                      </label>
                      <textarea
                        name="experience"
                        rows="3"
                        placeholder="Relevant experience"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        value={applicationData.experience}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    {getApplicationButton()}
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default InternshipDetails;