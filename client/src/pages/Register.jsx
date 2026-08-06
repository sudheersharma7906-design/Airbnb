import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User, Mail, Lock, Phone, CheckCircle, Eye, EyeOff, Building, UserCheck } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' (Guest) or 'host' (Host)
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password strength rules check
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
    if (!fullName || !email || !mobile || !password) {
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

    // Mobile number validation (10 digits or E.164)
    const cleanMobile = mobile.trim().replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: fullName.trim(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        password,
        role: role === 'host' ? 'host' : 'user',
      };

      // Call Direct Signup API (No OTP required)
      const userData = await register(payload);
      
      setSuccess(true);
      setTimeout(() => {
        const redirectPath = userData?.role === 'host' ? '/host/dashboard' : '/';
        navigate(redirectPath);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);
  const isFormValid = fullName && email && mobile && isPasswordValid && password === confirmPassword && acceptTerms;

  return (
    <div className="min-h-screen bg-[#FCFCFC] dark:bg-[#121212] flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="max-w-md w-full bg-white dark:bg-[#1E1E1E] border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 animate-fade-in relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF385C]/5 rounded-bl-full shrink-0"></div>

          {/* Header */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1 bg-[#FF385C]/10 text-[#FF385C] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Quick Join
            </span>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Create your account</h2>
            <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Search, book & host unique stays instantly</p>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs p-4 rounded-xl font-bold text-center flex justify-center items-center gap-2 animate-bounce">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Account created successfully! Logging you in...
            </div>
          )}

          {/* Error Banner */}
          {error && !success && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs p-3.5 rounded-xl font-semibold text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Account Role Selector (Guest vs Host) */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                I want to:
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                    role === 'user'
                      ? 'bg-white dark:bg-zinc-700 text-[#FF385C] shadow-sm'
                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Book Stays
                </button>
                <button
                  type="button"
                  onClick={() => setRole('host')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                    role === 'host'
                      ? 'bg-white dark:bg-zinc-700 text-[#FF385C] shadow-sm'
                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" /> Become a Host
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-[#FF385C]" /> Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sudheer Sharma"
                className="w-full border border-gray-250 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C] bg-transparent text-gray-900 dark:text-white"
              />
            </div>

            {/* Gmail / Email Address */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#FF385C]" /> Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full border border-gray-250 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C] bg-transparent text-gray-900 dark:text-white"
              />
            </div>

            {/* Phone / Mobile Number */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#FF385C]" /> Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="9876543210 or +919876543210"
                className="w-full border border-gray-250 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C] bg-transparent text-gray-900 dark:text-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#FF385C]" /> Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-250 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C] bg-transparent text-gray-900 dark:text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength checklist */}
              {password && (
                <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] bg-gray-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-800">
                  <span className={`flex items-center gap-1 ${passwordRules.minLength ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                    <CheckCircle className="w-3 h-3" /> Min 8 characters
                  </span>
                  <span className={`flex items-center gap-1 ${passwordRules.uppercase ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                    <CheckCircle className="w-3 h-3" /> Uppercase (A-Z)
                  </span>
                  <span className={`flex items-center gap-1 ${passwordRules.lowercase ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                    <CheckCircle className="w-3 h-3" /> Lowercase (a-z)
                  </span>
                  <span className={`flex items-center gap-1 ${passwordRules.number ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                    <CheckCircle className="w-3 h-3" /> Number (0-9)
                  </span>
                  <span className={`flex items-center gap-1 col-span-2 ${passwordRules.specialChar ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                    <CheckCircle className="w-3 h-3" /> Special character (!@#$%^&*)
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#FF385C]" /> Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-250 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C] bg-transparent text-gray-900 dark:text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 accent-[#FF385C] border border-gray-300 rounded mt-0.5 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-gray-500 dark:text-zinc-400 font-medium leading-tight">
                I accept the <a href="#" className="text-[#FF385C] hover:underline font-bold">Terms & Conditions</a> and Privacy Policy.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-[#FF385C] hover:bg-[#E61E4D] disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl shadow-md transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-sm mt-3 flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 dark:text-zinc-500 pt-3 border-t border-gray-100 dark:border-zinc-800">
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
