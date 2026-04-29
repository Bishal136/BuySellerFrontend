import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import { loginWithOTP, requestOTP } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

const OTPLoginPage = () => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRequestOTP = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(requestOTP({ email, purpose: 'login' })).unwrap();
      setStep('otp');
      toast.success('OTP sent to your email!');
      startResendTimer();
    } catch (error) {
      toast.error(error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(loginWithOTP({ 
        email, 
        otp, 
        purpose: 'login' 
      })).unwrap();
      
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    try {
      await dispatch(requestOTP({ email, purpose: 'login' })).unwrap();
      toast.success('OTP resent successfully!');
      startResendTimer();
    } catch (error) {
      toast.error(error || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(30);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl"
      >
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {step === 'email' ? 'Welcome Back' : 'Verify Your Identity'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'email' 
              ? 'Sign in with your email address' 
              : `We've sent a verification code to ${email}`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.div
              key="email-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="mt-8 space-y-6"
            >
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="you@example.com"
                    autoFocus
                  />
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  onClick={handleRequestOTP}
                  disabled={isLoading || !email}
                  className="btn-primary w-full flex justify-center items-center py-2 px-4"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Continue with Email
                      <FiArrowRight className="ml-2" />
                    </>
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">New to ShopHub?</span>
                  </div>
                </div>

                <Link
                  to="/register"
                  className="btn-secondary w-full text-center"
                >
                  Create New Account
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="otp-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mt-8 space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="input text-center text-2xl tracking-widest"
                  autoFocus
                />
              </div>

              <div className="text-center">
                <button
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0}
                  className={`text-sm font-medium ${
                    resendTimer > 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-primary-600 hover:text-primary-500'
                  }`}
                >
                  {resendTimer > 0 
                    ? `Resend code in ${resendTimer}s` 
                    : 'Resend Code'}
                </button>
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6}
                className="btn-primary w-full flex justify-center py-2 px-4"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Verify & Login'
                )}
              </button>

              <button
                onClick={() => setStep('email')}
                className="text-sm text-gray-500 hover:text-gray-700 text-center w-full"
              >
                ← Back to email
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 text-center">
            Demo: Use any email. Check console for OTP code.
            <br />
            Open browser console (F12) to see the OTP.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPLoginPage;