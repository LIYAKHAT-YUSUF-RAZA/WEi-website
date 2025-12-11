import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/public/Navbar.jsx';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'candidate'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const checks = {
      minLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[@$!%*?&]/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;
    
    let strength = 'Very Weak';
    let color = 'bg-red-500';
    let width = '20%';

    if (score === 5) {
      strength = 'Strong';
      color = 'bg-green-500';
      width = '100%';
    } else if (score === 4) {
      strength = 'Good';
      color = 'bg-blue-500';
      width = '80%';
    } else if (score === 3) {
      strength = 'Fair';
      color = 'bg-yellow-500';
      width = '60%';
    } else if (score === 2) {
      strength = 'Weak';
      color = 'bg-orange-500';
      width = '40%';
    }

    return { checks, strength, color, width };
  };

  const passwordStrength = checkPasswordStrength(formData.password);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Strong password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@$!%*?&)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, role, ...registerData } = formData;
      
      // If registering as manager, create a request instead
      if (role === 'manager') {
        const response = await axios.post('/api/manager-requests', registerData);
        setSuccess(response.data.message);
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          role: 'candidate'
        });
      } else {
        // Register candidate normally
        const user = await register({ ...registerData, role });
        navigate('/candidate/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-4xl font-extrabold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent animate-fade-in-down">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">Join us today! Fill in your details below</p>
          </div>
          <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-2xl border border-gray-100 animate-fade-in" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg animate-shake">
                <p className="font-semibold">⚠️ {error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg">
                <p className="font-semibold">✅ {success}</p>
                <p className="text-sm mt-1">You will receive an email notification once your request is approved.</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  📧 Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  📱 Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                  🎯 Register as
                </label>
                <select
                  id="role"
                  name="role"
                  className="block w-full px-4 py-3 border-2 border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-900 font-medium"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="candidate">👨‍🎓 Candidate</option>
                  <option value="manager">👔 Manager</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  🔒 Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none relative block w-full px-4 py-3 pr-12 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Password Strength</span>
                      <span className={`text-sm font-bold ${
                        passwordStrength.strength === 'Strong' ? 'text-green-600' :
                        passwordStrength.strength === 'Good' ? 'text-blue-600' :
                        passwordStrength.strength === 'Fair' ? 'text-yellow-600' :
                        passwordStrength.strength === 'Weak' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {passwordStrength.strength}
                      </span>
                    </div>
                    
                    {/* Strength Bar */}
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                      <div 
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: passwordStrength.width }}
                      ></div>
                    </div>

                    {/* Requirements Checklist */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${passwordStrength.checks.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                          {passwordStrength.checks.minLength ? '✓' : '✗'}
                        </span>
                        <span className={`text-xs ${passwordStrength.checks.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                          Minimum 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${passwordStrength.checks.hasLowercase ? 'text-green-600' : 'text-gray-400'}`}>
                          {passwordStrength.checks.hasLowercase ? '✓' : '✗'}
                        </span>
                        <span className={`text-xs ${passwordStrength.checks.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                          Lowercase letter (a-z)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${passwordStrength.checks.hasUppercase ? 'text-green-600' : 'text-gray-400'}`}>
                          {passwordStrength.checks.hasUppercase ? '✓' : '✗'}
                        </span>
                        <span className={`text-xs ${passwordStrength.checks.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                          Uppercase letter (A-Z)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${passwordStrength.checks.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                          {passwordStrength.checks.hasNumber ? '✓' : '✗'}
                        </span>
                        <span className={`text-xs ${passwordStrength.checks.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                          Number (0-9)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${passwordStrength.checks.hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                          {passwordStrength.checks.hasSpecial ? '✓' : '✗'}
                        </span>
                        <span className={`text-xs ${passwordStrength.checks.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                          Special symbol (!@#$%^&*...)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  🔐 Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-bold rounded-lg text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                {loading ? '⏳ Creating account...' : '🚀 Register Now'}
              </button>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-green-600 hover:text-blue-600 transition-colors duration-300">
                  Login here →
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
