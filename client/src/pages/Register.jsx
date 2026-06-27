import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Sparkles, User, Mail, Lock, Phone, UserCheck, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Guest'); // 'Guest' or 'Host'
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password strength validation state
  const [passwordRules, setPasswordRules] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  useEffect(() => {
    setPasswordRules({
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field Validations
    if (!fullName || !email || !password || !role) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!acceptTerms) {
      setError('You must accept the Terms and Conditions to proceed.');
      return;
    }

    // Password strength check
    const isPasswordStrong = Object.values(passwordRules).every(Boolean);
    if (!isPasswordStrong) {
      setError('Password does not meet all complexity requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Mobile format check (E.164 format: e.g. +919876543210 or 9876543210)
    if (mobile && !/^\+?[1-9]\d{1,14}$/.test(mobile.trim())) {
      setError('Please enter a valid mobile number (e.g. +919876543210 or 9876543210).');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        username: username.trim() || undefined,
        email: email.trim(),
        mobile: mobile.trim() || undefined,
        password,
        confirmPassword,
        role,
      };

      // Call API to send signup OTP
      await api.post('/auth/send-signup-otp', payload);
      
      // Redirect to OTP verification page with all payload data in router state
      navigate('/verify-signup-otp', { state: { signupData: payload } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate signup process.');
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);
  const isFormValid = fullName && email && isPasswordValid && password === confirmPassword && acceptTerms;

  return (
    <div className="min-h-screen bg-[#FCFCFC] dark:bg-[#121212] flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="max-w-md w-full bg-white dark:bg-[#1E1E1E] border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 animate-fade-in relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF385C]/5 rounded-bl-full shrink-0"></div>

          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1 bg-[#FF385C]/10 text-[#FF385C] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Get Started
            </span>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Create your account</h2>
            <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Join Nestfinder to search, book and host unique stays</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs p-3.5 rounded-xl font-semibold text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3 h-3" /> Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sudheer Sharma"
                className="w-full border border-gray-250 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C] bg-transparent text-gray-900 dark:text-white"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Username <span className="text-[9px] text-gray-300 dark:text-zinc-600">(Optional)</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="sudheer79"
                className="w-full border border-gray-250 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C] bg-transparent text-gray-900 dark:text-white"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sudheer@example.com"
                className="w-full border border-gray-250 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C] bg-transparent text-gray-900 dark:text-white"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Mobile Number <span className="text-[9px] text-gray-300 dark:text-zinc-600">(For SMS OTP)</span>
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+919876543210"
                className="w-full border border-gray-250 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C] bg-transparent text-gray-900 dark:text-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full border border-gray-250 dark:border-zinc-700 rounded-xl pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C] bg-transparent text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-250 dark:border-zinc-700 rounded-xl pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C] bg-transparent text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Validation Criteria Box */}
            {password.length > 0 && (
              <div className="bg-gray-50 dark:bg-zinc-900/55 p-3.5 rounded-2xl border border-gray-100 dark:border-zinc-800/80 space-y-1.5 text-[11px] font-medium text-gray-500 dark:text-zinc-400">
                <p className="font-extrabold text-[9px] uppercase tracking-wider mb-1">Password Strength Requirements:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${passwordRules.minLength ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-zinc-650'}`}></span>
                    <span className={passwordRules.minLength ? 'text-emerald-600 dark:text-emerald-400' : ''}>Min 8 characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${passwordRules.uppercase ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-zinc-650'}`}></span>
                    <span className={passwordRules.uppercase ? 'text-emerald-600 dark:text-emerald-400' : ''}>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${passwordRules.lowercase ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-zinc-650'}`}></span>
                    <span className={passwordRules.lowercase ? 'text-emerald-600 dark:text-emerald-400' : ''}>One lowercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${passwordRules.number ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-zinc-650'}`}></span>
                    <span className={passwordRules.number ? 'text-emerald-600 dark:text-emerald-400' : ''}>One number</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${passwordRules.specialChar ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-zinc-650'}`}></span>
                    <span className={passwordRules.specialChar ? 'text-emerald-600 dark:text-emerald-400' : ''}>One special char</span>
                  </div>
                </div>
                {password && confirmPassword && (
                  <p className={`font-bold mt-1 text-[10px] ${password === confirmPassword ? 'text-emerald-500' : 'text-red-500'}`}>
                    {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>
            )}

            {/* Role Select Buttons */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Account Type *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('Guest')}
                  className={`border p-3 rounded-2xl cursor-pointer text-left relative flex flex-col justify-between h-20 transition duration-200 ${
                    role === 'Guest'
                      ? 'border-[#FF385C] bg-[#FF385C]/5 text-[#FF385C]'
                      : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 text-gray-700 dark:text-zinc-400'
                  }`}
                >
                  <span className="text-xs font-bold block">Guest</span>
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 leading-none font-medium">Book stays & travel</span>
                  {role === 'Guest' && <CheckCircle className="w-4 h-4 text-[#FF385C] absolute top-3 right-3" />}
                </button>

                <button
                  type="button"
                  onClick={() => setRole('Host')}
                  className={`border p-3 rounded-2xl cursor-pointer text-left relative flex flex-col justify-between h-20 transition duration-200 ${
                    role === 'Host'
                      ? 'border-[#FF385C] bg-[#FF385C]/5 text-[#FF385C]'
                      : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 text-gray-700 dark:text-zinc-400'
                  }`}
                >
                  <span className="text-xs font-bold block">Host</span>
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 leading-none font-medium">Rent & host properties</span>
                  {role === 'Host' && <CheckCircle className="w-4 h-4 text-[#FF385C] absolute top-3 right-3" />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-2 pt-1.5">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 accent-[#FF385C] border border-gray-300 rounded mt-0.5"
              />
              <label htmlFor="terms" className="text-xs text-gray-500 dark:text-zinc-400 font-medium leading-tight">
                I accept the <a href="#" className="text-[#FF385C] hover:underline font-bold">Terms & Conditions</a> and consent to security validation.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-[#FF385C] hover:bg-[#E61E4D] disabled:opacity-50 text-white font-extrabold py-3 rounded-xl shadow-md transition hover:scale-101 active:scale-99 cursor-pointer text-sm mt-2 flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registering...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 dark:text-zinc-500 pt-2 border-t border-gray-50 dark:border-zinc-800">
            Already have an account?{' '}
            <Link to="/login" className="text-[#FF385C] hover:underline font-bold">
              Log in
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
