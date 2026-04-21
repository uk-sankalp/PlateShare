/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('rememberedEmail');
    const savedPassword = sessionStorage.getItem('rememberedPassword');
    if (savedEmail) setEmail(savedEmail);
    if (savedPassword) setPassword(savedPassword);

    // Clear credentials right after reading them so they are only used once right after registering.
    sessionStorage.removeItem('rememberedEmail');
    sessionStorage.removeItem('rememberedPassword');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      const msg = result.message || '';
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('account')) {
        setEmailError(msg);
      } else {
        setPasswordError(msg);
      }
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="min-h-screen w-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-gray-900 px-4 animate-fade-in transition-colors duration-300">
      <div className="w-full max-w-[400px]">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#202124] dark:text-gray-100 tracking-tight">Sign in to PlateShare</h1>
          <p className="text-[#5f6368] dark:text-gray-400 text-sm mt-1">Use your PlateShare Account</p>
        </div>

        {/* Card */}
        <div className="animate-bounce-in bg-white dark:bg-gray-800 rounded-3xl border border-[#dadce0] dark:border-gray-700 px-8 py-8 shadow-sm transition-colors duration-300">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                required
                placeholder=" "
                className={`peer w-full px-3.5 pt-5 pb-2 text-sm border rounded-lg outline-none transition-all bg-white dark:bg-gray-700 dark:text-gray-100
                  ${emailError
                    ? 'border-[#d93025] focus:border-[#d93025] focus:ring-1 focus:ring-[#d93025]'
                    : 'border-[#dadce0] dark:border-gray-600 focus:border-[#1a73e8] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#1a73e8] dark:focus:ring-blue-500'
                  }`}
              />
              <label
                htmlFor="email"
                className={`absolute left-3.5 pointer-events-none transition-all duration-200
                  top-1/2 -translate-y-1/2 text-sm
                  peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:font-medium
                  peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium
                  ${emailError ? 'text-[#d93025] dark:text-red-400' : 'text-[#5f6368] dark:text-gray-400 peer-focus:text-[#1a73e8] dark:peer-focus:text-blue-400'}`}
              >
                Email address
              </label>
              {emailError && (
                <p className="mt-1.5 text-xs text-[#d93025] flex items-center gap-1">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                required
                placeholder=" "
                className={`peer w-full px-3.5 pt-5 pb-2 pr-10 text-sm border rounded-lg outline-none transition-all bg-white dark:bg-gray-700 dark:text-gray-100
                  ${passwordError
                    ? 'border-[#d93025] focus:border-[#d93025] focus:ring-1 focus:ring-[#d93025]'
                    : 'border-[#dadce0] dark:border-gray-600 focus:border-[#1a73e8] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#1a73e8] dark:focus:ring-blue-500'
                  }`}
              />
              <label
                htmlFor="password"
                className={`absolute left-3.5 pointer-events-none transition-all duration-200
                  top-1/2 -translate-y-1/2 text-sm
                  peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:font-medium
                  peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium
                  ${passwordError ? 'text-[#d93025] dark:text-red-400' : 'text-[#5f6368] dark:text-gray-400 peer-focus:text-[#1a73e8] dark:peer-focus:text-blue-400'}`}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f6368] dark:text-gray-400 text-xs hover:text-[#1a73e8] dark:hover:text-blue-400 transition"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
              {passwordError && (
                <p className="mt-1.5 text-xs text-[#d93025] flex items-center gap-1">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-60 text-white font-medium py-2.5 px-4 rounded-lg transition-all text-sm shadow-sm hover:shadow-md duration-200 mt-2 flex justify-center items-center"
            >
              {loading ? <Loader size="20px" borderSize="2px" color="rgba(255, 255, 255, 0.2)" pulseColor="#ffffff" /> : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#e8eaed] dark:border-gray-700 text-center">
            <p className="text-sm text-[#5f6368] dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#1a73e8] dark:text-blue-400 font-medium hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;