import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';

function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    primaryContactName: '',
    phone: '',
    businessType: 'RETAIL_SHOP',
    gstin: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();
  const totalSteps = 3;

  // Load saved form data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('registration-draft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  // Save form data to localStorage
  useEffect(() => {
    if (formData.email || formData.businessName) {
      localStorage.setItem('registration-draft', JSON.stringify(formData));
    }
  }, [formData]);

  // Password strength calculator
  useEffect(() => {
    const calculateStrength = (pwd) => {
      let strength = 0;
      if (pwd.length >= 8) strength += 25;
      if (pwd.length >= 12) strength += 25;
      if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
      if (/[0-9]/.test(pwd)) strength += 15;
      if (/[^A-Za-z0-9]/.test(pwd)) strength += 10;
      return Math.min(strength, 100);
    };
    setPasswordStrength(calculateStrength(formData.password));
  }, [formData.password]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[6-9]\d{9}$/;
    return re.test(phone);
  };

  const validateGSTIN = (gstin) => {
    if (!gstin) return true; // Optional field
    const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return re.test(gstin);
  };

  const validatePincode = (pincode) => {
    const re = /^[1-9][0-9]{5}$/;
    return re.test(pincode);
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 2) {
      if (!formData.businessName) {
        newErrors.businessName = 'Business name is required';
      } else if (formData.businessName.length < 3) {
        newErrors.businessName = 'Business name must be at least 3 characters';
      }

      if (!formData.primaryContactName) {
        newErrors.primaryContactName = 'Contact name is required';
      }

      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = 'Please enter a valid 10-digit mobile number';
      }

      if (formData.gstin && !validateGSTIN(formData.gstin)) {
        newErrors.gstin = 'Please enter a valid GSTIN (e.g., 22AAAAA0000A1Z5)';
      }
    }

    if (step === 3) {
      if (!formData.address.street) {
        newErrors['address.street'] = 'Street address is required';
      }

      if (!formData.address.city) {
        newErrors['address.city'] = 'City is required';
      }

      if (!formData.address.state) {
        newErrors['address.state'] = 'State is required';
      }

      if (!formData.address.pincode) {
        newErrors['address.pincode'] = 'Pincode is required';
      } else if (!validatePincode(formData.address.pincode)) {
        newErrors['address.pincode'] = 'Please enter a valid 6-digit pincode';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setError('');
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateStep(3)) return;

    setLoading(true);

    try {
      await axios.post('/auth/register', {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        businessName: formData.businessName.trim(),
        primaryContactName: formData.primaryContactName.trim(),
        phone: formData.phone.trim(),
        businessType: formData.businessType,
        gstin: formData.gstin.trim() || null,
        businessAddress: JSON.stringify(formData.address)
      });

      setSuccess(true);
      localStorage.removeItem('registration-draft');
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 70) return 'Medium';
    return 'Strong';
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your wholesale account has been created successfully. Our admin team will review and approve your account shortly.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>What's next?</strong> You'll receive a notification once your account is approved. This usually takes 1-2 business days.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <svg className="animate-spin h-5 w-5 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Redirecting to login...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30" style={{animation: 'blob 7s infinite'}}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30" style={{animation: 'blob 7s infinite 2s'}}></div>
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center group">
            <div className="text-6xl transform group-hover:scale-110 transition-transform duration-300">
              🍦
            </div>
          </Link>
          <h1 className="mt-6 text-4xl font-extrabold text-gray-900 tracking-tight">
            Create Your Wholesale Account
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Join our B2B platform and start ordering ice cream in bulk
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    currentStep > step
                      ? 'bg-green-500 text-white'
                      : currentStep === step
                      ? 'bg-orange-500 text-white ring-4 ring-orange-200'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  <div className={`mt-2 text-sm font-medium transition-colors ${
                    currentStep >= step ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step === 1 && 'Account'}
                    {step === 2 && 'Business'}
                    {step === 3 && 'Address'}
                  </div>
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-4 transition-all duration-300 ${
                    currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-orange-500 via-pink-500 to-blue-500"></div>

          <div className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => e.preventDefault()}>
              {/* Step 1: Account Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Credentials</h2>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => handleBlur('email')}
                        className={`block w-full pl-10 pr-3 py-3 border ${
                          errors.email && touched.email ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                        } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                        placeholder="you@company.com"
                      />
                    </div>
                    {errors.email && touched.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={() => handleBlur('password')}
                        className={`block w-full pl-10 pr-12 py-3 border ${
                          errors.password && touched.password ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                        } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                        placeholder="At least 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Password strength</span>
                          <span className={`text-xs font-semibold ${
                            passwordStrength < 40 ? 'text-red-600' : passwordStrength < 70 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{width: `${passwordStrength}%`}}
                          />
                        </div>
                      </div>
                    )}
                    {errors.password && touched.password && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={() => handleBlur('confirmPassword')}
                        className={`block w-full pl-10 pr-12 py-3 border ${
                          errors.confirmPassword && touched.confirmPassword ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                        } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                        placeholder="Re-enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <p className="mt-2 text-sm text-green-600 flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Passwords match
                      </p>
                    )}
                    {errors.confirmPassword && touched.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Business Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Business Name */}
                    <div className="md:col-span-2">
                      <label htmlFor="businessName" className="block text-sm font-semibold text-gray-700 mb-2">
                        Business Name *
                      </label>
                      <input
                        id="businessName"
                        name="businessName"
                        type="text"
                        value={formData.businessName}
                        onChange={handleChange}
                        onBlur={() => handleBlur('businessName')}
                        className={`block w-full px-4 py-3 border ${
                          errors.businessName && touched.businessName ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                        } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                        placeholder="Your Company Pvt. Ltd."
                      />
                      {errors.businessName && touched.businessName && (
                        <p className="mt-2 text-sm text-red-600">{errors.businessName}</p>
                      )}
                    </div>

                    {/* Contact Name */}
                    <div>
                      <label htmlFor="primaryContactName" className="block text-sm font-semibold text-gray-700 mb-2">
                        Contact Person *
                      </label>
                      <input
                        id="primaryContactName"
                        name="primaryContactName"
                        type="text"
                        value={formData.primaryContactName}
                        onChange={handleChange}
                        onBlur={() => handleBlur('primaryContactName')}
                        className={`block w-full px-4 py-3 border ${
                          errors.primaryContactName && touched.primaryContactName ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                        } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                        placeholder="John Doe"
                      />
                      {errors.primaryContactName && touched.primaryContactName && (
                        <p className="mt-2 text-sm text-red-600">{errors.primaryContactName}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">+91</span>
                        </div>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          maxLength="10"
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={() => handleBlur('phone')}
                          className={`block w-full pl-12 pr-4 py-3 border ${
                            errors.phone && touched.phone ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                          } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                          placeholder="9876543210"
                        />
                      </div>
                      {errors.phone && touched.phone && (
                        <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>

                    {/* Business Type */}
                    <div>
                      <label htmlFor="businessType" className="block text-sm font-semibold text-gray-700 mb-2">
                        Business Type *
                      </label>
                      <select
                        id="businessType"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="RETAIL_SHOP">Retail Shop / Store</option>
                        <option value="RESTAURANT">Restaurant / Cafe</option>
                        <option value="DISTRIBUTOR">Distributor</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    {/* GSTIN */}
                    <div>
                      <label htmlFor="gstin" className="block text-sm font-semibold text-gray-700 mb-2">
                        GSTIN <span className="text-gray-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        id="gstin"
                        name="gstin"
                        type="text"
                        maxLength="15"
                        value={formData.gstin}
                        onChange={(e) => handleChange({target: {name: 'gstin', value: e.target.value.toUpperCase()}})}
                        onBlur={() => handleBlur('gstin')}
                        className={`block w-full px-4 py-3 border ${
                          errors.gstin && touched.gstin ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                        } rounded-xl text-gray-900 placeholder-gray-400 uppercase focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                        placeholder="22AAAAA0000A1Z5"
                      />
                      {errors.gstin && touched.gstin && (
                        <p className="mt-2 text-sm text-red-600">{errors.gstin}</p>
                      )}
                      {!errors.gstin && formData.gstin && (
                        <p className="mt-2 text-xs text-gray-500">Format: 2 digits + 10 chars + 1 digit + 1 char + 1 digit/char</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Address */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Address</h2>

                  <div className="space-y-6">
                    {/* Street */}
                    <div>
                      <label htmlFor="address.street" className="block text-sm font-semibold text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        id="address.street"
                        name="address.street"
                        type="text"
                        value={formData.address.street}
                        onChange={handleChange}
                        onBlur={() => handleBlur('address.street')}
                        className={`block w-full px-4 py-3 border ${
                          errors['address.street'] && touched['address.street'] ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                        } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                        placeholder="Building, Street, Area"
                      />
                      {errors['address.street'] && touched['address.street'] && (
                        <p className="mt-2 text-sm text-red-600">{errors['address.street']}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* City */}
                      <div>
                        <label htmlFor="address.city" className="block text-sm font-semibold text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          id="address.city"
                          name="address.city"
                          type="text"
                          value={formData.address.city}
                          onChange={handleChange}
                          onBlur={() => handleBlur('address.city')}
                          className={`block w-full px-4 py-3 border ${
                            errors['address.city'] && touched['address.city'] ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                          } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                          placeholder="Mumbai"
                        />
                        {errors['address.city'] && touched['address.city'] && (
                          <p className="mt-2 text-sm text-red-600">{errors['address.city']}</p>
                        )}
                      </div>

                      {/* State */}
                      <div>
                        <label htmlFor="address.state" className="block text-sm font-semibold text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          id="address.state"
                          name="address.state"
                          type="text"
                          value={formData.address.state}
                          onChange={handleChange}
                          onBlur={() => handleBlur('address.state')}
                          className={`block w-full px-4 py-3 border ${
                            errors['address.state'] && touched['address.state'] ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                          } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                          placeholder="Maharashtra"
                        />
                        {errors['address.state'] && touched['address.state'] && (
                          <p className="mt-2 text-sm text-red-600">{errors['address.state']}</p>
                        )}
                      </div>
                    </div>

                    {/* Pincode */}
                    <div>
                      <label htmlFor="address.pincode" className="block text-sm font-semibold text-gray-700 mb-2">
                        Pincode *
                      </label>
                      <input
                        id="address.pincode"
                        name="address.pincode"
                        type="text"
                        maxLength="6"
                        value={formData.address.pincode}
                        onChange={handleChange}
                        onBlur={() => handleBlur('address.pincode')}
                        className={`block w-full px-4 py-3 border ${
                          errors['address.pincode'] && touched['address.pincode'] ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                        } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                        placeholder="400001"
                      />
                      {errors['address.pincode'] && touched['address.pincode'] && (
                        <p className="mt-2 text-sm text-red-600">{errors['address.pincode']}</p>
                      )}
                    </div>

                    {/* Review Summary */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl border border-orange-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Review Your Information</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-semibold text-gray-900">{formData.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Business:</span>
                          <span className="font-semibold text-gray-900">{formData.businessName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contact:</span>
                          <span className="font-semibold text-gray-900">{formData.primaryContactName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-semibold text-gray-900">+91 {formData.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-semibold text-gray-900">{formData.businessType.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex items-center justify-between">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                )}

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="ml-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 flex items-center shadow-lg"
                  >
                    Next Step
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-auto px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 flex items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>
    </div>
  );
}

export default RegisterPage;
