import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password);

      // Get the redirect URL from location state or localStorage
      const redirectTo = location.state?.from || localStorage.getItem('redirectAfterLogin');

      // Clear the stored redirect URL
      if (redirectTo) {
        localStorage.removeItem('redirectAfterLogin');
      }

      if (user.role === 'candidate') {
        // Redirect to the previous page or default to dashboard
        navigate(redirectTo || '/candidate/dashboard');
      } else if (user.role === 'manager') {
        navigate('/manager/dashboard');
      } else if (user.role === 'service_provider') {
        navigate('/service-provider/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 pt-24">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-fade-in-down">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Welcome back! Please enter your credentials
            </p>
          </div>
          <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-2xl border border-gray-100 animate-fade-in" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg animate-shake">
                <p className="font-semibold">⚠️ {error}</p>
                <p className="text-sm mt-1">Don't have an account? Please register first!</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  📧 Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  🔒 Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <div className="text-right mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-purple-600 hover:text-blue-600 transition-colors duration-300"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-bold rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                {loading ? '⏳ Signing in...' : '✨ Sign In'}
              </button>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-purple-600 hover:text-blue-600 transition-colors duration-300">
                  Register here →
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
