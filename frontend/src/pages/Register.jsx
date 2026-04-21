import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

const ROLES = [
  { value: 'donor', label: 'Food Donor', icon: 'Donor' },
  { value: 'volunteer', label: 'Volunteer', icon: 'Vol' },
  { value: 'ngo', label: 'NGO / Org', icon: 'NGO' },
];

/* ─── Defined OUTSIDE Register so React never recreates its identity on
       re-render, which would unmount the input and lose focus on every
       keystroke ──────────────────────────────────────────────────────── */
const Field = ({ id, label, type = 'text', name, required = false, formData, onChange }) => (
  <div className="relative">
    <input
      id={id}
      type={type}
      name={name}
      value={formData[name]}
      onChange={onChange}
      required={required}
      placeholder=" "
      className="peer w-full px-3.5 pt-5 pb-2 text-sm border border-[#dadce0] dark:border-gray-600 rounded-lg outline-none transition-all bg-white dark:bg-gray-700 dark:text-gray-100 focus:border-[#1a73e8] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#1a73e8] dark:focus:ring-blue-500"
    />
    <label
      htmlFor={id}
      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#5f6368] dark:text-gray-400 pointer-events-none transition-all duration-200
        peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:font-medium peer-focus:text-[#1a73e8] dark:peer-focus:text-blue-400
        peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium"
    >
      {label}
    </label>
  </div>
);

const Register = () => {
  const [searchParams] = useSearchParams();
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: searchParams.get('role') || 'donor',
    password: '',
    confirmPassword: '',
    organization: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'confirmPassword' || name === 'password') setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match — please re-enter them');
    }
    const result = await register(formData);
    if (result.success) {
      sessionStorage.setItem('rememberedEmail', formData.email);
      sessionStorage.setItem('rememberedPassword', formData.password);
      navigate('/');
    } else {
      setError(result.message);
    }
  };


  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="min-h-screen w-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-gray-900 px-4 py-8 animate-fade-in transition-colors duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="w-full max-w-[480px]">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#202124] dark:text-gray-100 tracking-tight">Create your PlateShare account</h1>
          <p className="text-[#5f6368] dark:text-gray-400 text-sm mt-1">Join the food-sharing community</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-[#dadce0] dark:border-gray-700 px-8 py-8 shadow-sm transition-colors duration-300">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name + Phone */}
            <div className="grid grid-cols-2 gap-3">
              <Field id="name" label="Full Name" name="name" required formData={formData} onChange={handleChange} />
              <Field id="phone" label="Phone (optional)" name="phone" type="tel" formData={formData} onChange={handleChange} />
            </div>

            {/* Email */}
            <Field id="email" label="Email address" name="email" type="email" required formData={formData} onChange={handleChange} />

            {/* Role selector — segmented button group */}
            <div>
              <p className="text-xs font-medium text-[#5f6368] dark:text-gray-400 mb-2">I am a…</p>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: r.value }))}
                    className={`flex flex-col items-center py-3 px-2 rounded-xl border text-xs font-medium transition-all
                      ${formData.role === r.value
                        ? 'border-[#1a73e8] dark:border-blue-500 bg-[#e8f0fe] dark:bg-blue-900/30 text-[#1a73e8] dark:text-blue-400 ring-1 ring-[#1a73e8] dark:ring-blue-500'
                        : 'border-[#dadce0] dark:border-gray-600 text-[#5f6368] dark:text-gray-400 hover:border-[#1a73e8] hover:text-[#1a73e8] dark:hover:border-blue-500 dark:hover:text-blue-400'
                      }`}
                  >
                    <span className="text-xl mb-1">{r.icon}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Organization — only for NGO */}
            {formData.role === 'ngo' && (
              <Field id="organization" label="Organization Name" name="organization" formData={formData} onChange={handleChange} />
            )}

            {/* Password */}
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder=" "
                className="peer w-full px-3.5 pt-5 pb-2 pr-10 text-sm border border-[#dadce0] dark:border-gray-600 rounded-lg outline-none transition-all bg-white dark:bg-gray-700 dark:text-gray-100 focus:border-[#1a73e8] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#1a73e8] dark:focus:ring-blue-500"
              />
              <label htmlFor="password" className="absolute left-3.5 top-2 text-xs font-medium text-[#5f6368] dark:text-gray-400 peer-focus:text-[#1a73e8] dark:peer-focus:text-blue-400 pointer-events-none">
                Password (min. 6 characters)
              </label>
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f6368] dark:text-gray-400 text-xs hover:text-[#1a73e8] dark:hover:text-blue-400">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder=" "
                className={`peer w-full px-3.5 pt-5 pb-2 text-sm border rounded-lg outline-none transition-all bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-1 ${formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-300 dark:focus:ring-red-800'
                  : 'border-[#dadce0] dark:border-gray-600 focus:border-[#1a73e8] dark:focus:border-blue-500 focus:ring-[#1a73e8] dark:focus:ring-blue-500'
                  }`}
              />
              <label htmlFor="confirmPassword" className="absolute left-3.5 top-2 text-xs font-medium text-[#5f6368] dark:text-gray-400 peer-focus:text-[#1a73e8] dark:peer-focus:text-blue-400 pointer-events-none">
                Confirm password
              </label>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-red-500 -mt-2">Passwords do not match</p>
            )}

            {/* Inline error banner */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-lg px-4 py-3 flex items-start gap-2">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-60 text-white font-medium py-2.5 px-4 rounded-lg transition-all text-sm shadow-sm hover:shadow-md duration-200 mt-1 flex justify-center items-center"
            >
              {loading ? <Loader size="20px" borderSize="2px" color="rgba(255, 255, 255, 0.2)" pulseColor="#ffffff" /> : 'Create account'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#e8eaed] dark:border-gray-700 text-center">
            <p className="text-sm text-[#5f6368] dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-[#1a73e8] dark:text-blue-400 font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div >
  );
};

export default Register;