import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { requestOTP, registerWithOTP } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
});

const RegisterPage = () => {
  const [step, setStep] = useState('form'); // form, otp
  const [userData, setUserData] = useState(null);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange'
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Store user data for later
      setUserData(data);
      
      // Request OTP for registration
      await dispatch(requestOTP({ 
        email: data.email, 
        purpose: 'registration' 
      })).unwrap();
      
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
      // Verify OTP and complete registration
      const result = await dispatch(registerWithOTP({ 
        email: userData.email, 
        otp: otp, 
        purpose: 'registration',
        name: userData.name,
        phone: userData.phone 
      })).unwrap();
      
      console.log('Registration successful:', result);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error || 'Invalid OTP or registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    try {
      await dispatch(requestOTP({ 
        email: userData.email, 
        purpose: 'registration' 
      })).unwrap();
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
    <div className="min-h-[80vh] bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl"
      >
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">
            {step === 'form' ? 'Create Account' : 'Verify Your Email'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'form' ? (
              <>Already have an account? <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">Sign in</Link></>
            ) : (
              `We've sent a verification code to ${userData?.email}`
            )}
          </p>
        </div>

        {step === 'form' ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <input
                    {...register('name')}
                    type="text"
                    className="input pl-10"
                    placeholder="John Doe"
                  />
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <input
                    {...register('email')}
                    type="email"
                    className="input pl-10"
                    placeholder="you@example.com"
                  />
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <input
                    {...register('phone')}
                    type="tel"
                    className="input pl-10"
                    placeholder="+8801XXXXXXXXX"
                  />
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex justify-center py-2 px-4"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Register
                    <FiArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
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
              <p className="text-xs text-gray-500 mt-2 text-center">
                Check your console for OTP (development mode)
              </p>
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
                'Verify & Register'
              )}
            </button>

            <button
              onClick={() => setStep('form')}
              className="text-sm text-gray-500 hover:text-gray-700 text-center w-full"
            >
              ← Back to registration
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RegisterPage;