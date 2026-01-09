import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ArrowLeft, CreditCard, Smartphone, Upload, CheckCircle } from 'lucide-react';
import axios from 'axios';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [processing, setProcessing] = useState(false);

  // Company UPI ID for payments
  const companyUpiId = '8074637475-lyr@ybl';

  // Get cart data from navigation state
  const { items = [], subtotal = 0, savings = 0 } = location.state || {};

  // Generate UPI QR Code immediately
  const qrCode = (() => {
    const amount = subtotal;
    const upiString = `upi://pay?pa=${companyUpiId}&pn=WEintegrity&am=${amount}&cu=INR&tn=Course Enrollment Payment`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiString)}`;
  })();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!items.length) {
      navigate('/cart');
      return;
    }
  }, [user, items, navigate]);

  // Handle screenshot upload
  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      setScreenshot(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Complete payment and enrollment
  const handleCompletePayment = async () => {
    if (!screenshot) {
      alert('Please upload payment screenshot');
      return;
    }

    setProcessing(true);

    try {
      // Convert screenshot to base64
      const screenshotBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(screenshot);
      });

      // Create enrollments for all courses in cart with payment details
      const enrollmentPromises = items.map(item => {
        if (item.course) {
          return axios.post('/api/enrollments', {
            courseId: item.course._id,
            message: 'Payment completed - Awaiting manager approval',
            paymentMethod: paymentMethod,
            paymentAmount: item.course.price,
            paymentScreenshot: screenshotBase64
          });
        }
        return null;
      }).filter(Boolean);

      await Promise.all(enrollmentPromises);

      // Clear cart only if items came from cart (not from direct course enrollment)
      // Check if the items have cart-specific properties
      const isFromCart = items.some(item => item._id && !item._id.startsWith('temp-'));
      if (isFromCart) {
        try {
          await clearCart();
        } catch (error) {
          console.log('Cart already empty or direct enrollment');
        }
      }

      alert('✅ Payment submitted successfully! Your enrollment request with payment proof has been sent to the manager for approval. You will receive access once approved.');
      navigate('/candidate/dashboard');
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.response?.data?.message || 'Error processing payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!items.length) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-24 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Cart
        </button>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
          Complete Your Payment
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-semibold text-gray-800">{item.course?.title}</p>
                      <p className="text-sm text-gray-500">Course</p>
                    </div>
                    <p className="font-bold text-blue-600">₹{item.course?.price || 0}</p>
                  </div>
                ))}

                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ₹{subtotal}
                    </span>
                  </div>
                  {savings > 0 && (
                    <p className="text-green-600 text-sm text-right">
                      You saved ₹{savings}! 🎉
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Select Payment Method</h2>

              <div className="space-y-4">
                {/* UPI Payment */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'upi'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className={`w-6 h-6 ${paymentMethod === 'upi' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">UPI Payment</p>
                      <p className="text-sm text-gray-500">Pay using UPI ID (PhonePe, GPay, Paytm)</p>
                    </div>
                    {paymentMethod === 'upi' && <CheckCircle className="w-6 h-6 text-blue-600" />}
                  </div>
                </div>

                {/* Card Payment - Disabled */}
                <div className="p-4 border-2 border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Card Payment</p>
                      <p className="text-sm text-gray-500">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* UPI Payment Section */}
            {paymentMethod === 'upi' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Scan QR Code to Pay</h3>

                <div className="space-y-6">
                  {/* QR Code Display */}
                  <div className="text-center">
                    <div className="inline-block p-6 bg-white border-4 border-blue-600 rounded-xl shadow-lg">
                      <img src={qrCode} alt="Payment QR Code" className="w-64 h-64 mx-auto" />
                    </div>
                    <p className="mt-4 text-lg font-semibold text-gray-800">
                      Scan this QR code to pay ₹{subtotal}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      UPI ID: {companyUpiId}
                    </p>
                  </div>

                  {/* Payment Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3">📱 How to Pay:</h4>
                    <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                      <li>Open any UPI app (PhonePe, GPay, Paytm, etc.)</li>
                      <li>Tap on 'Scan QR Code' option</li>
                      <li>Scan the QR code shown above</li>
                      <li>Verify the amount (₹{subtotal})</li>
                      <li>Enter your UPI PIN and complete payment</li>
                      <li>Take a screenshot of payment success message</li>
                      <li>Upload the screenshot below to confirm enrollment</li>
                    </ol>
                  </div>

                  {/* Screenshot Upload */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">
                      Upload Payment Screenshot *
                    </label>

                    {!screenshotPreview ? (
                      <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-700 font-medium mb-1">Click to upload payment screenshot</p>
                        <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotChange}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative">
                        <img
                          src={screenshotPreview}
                          alt="Payment screenshot"
                          className="w-full h-64 object-contain border-2 border-green-500 rounded-lg bg-gray-50"
                        />
                        <button
                          onClick={() => {
                            setScreenshot(null);
                            setScreenshotPreview('');
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 shadow-lg font-semibold text-sm"
                        >
                          ✕ Remove
                        </button>
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 text-center">
                          ✓ Screenshot uploaded successfully
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCompletePayment}
                    disabled={!screenshot || processing}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        Complete Enrollment & Start Learning
                      </>
                    )}
                  </button>

                  {!screenshot && (
                    <p className="text-center text-sm text-red-600">
                      ⚠️ Please upload payment screenshot to complete enrollment
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Side Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="font-bold text-lg mb-4">Secure Payment</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>100% secure payment gateway</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Instant enrollment after payment verification</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Email confirmation sent</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>24/7 customer support</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Powered by WEintegrity
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
