import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, KeyRound, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const passwordStrength = checkPasswordStrength(newPassword);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(response.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
      setMessage(response.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Strong password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@$!%*?&)');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        otp,
        newPassword
      });
      setMessage(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage('New OTP sent to your email');
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Reset Password
            </h2>
            <p className="text-gray-600 mt-2">
              {step === 1 && "Enter your email to receive an OTP"}
              {step === 2 && "Enter the 6-digit OTP sent to your email"}
              {step === 3 && "Create a new password"}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                3
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {message}
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-Digit OTP
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors text-center text-2xl tracking-widest font-semibold"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  OTP sent to: <span className="font-semibold">{email}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="w-full text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50"
              >
                Didn't receive OTP? Resend
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-gray-600 hover:text-gray-700 font-medium text-sm"
              >
                Change Email
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
                    placeholder="Enter new password"
                    required
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
                {newPassword && (
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-6 text-sm">
          Remember your password?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
