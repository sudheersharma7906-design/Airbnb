import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Lock, Sparkles, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Password Validation Rules State
  const [validationRules, setValidationRules] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  // Redirect to forgot-password if state is missing
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  // Real-time password strength validator
  useEffect(() => {
    setValidationRules({
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  // Auto-redirect to login on success
  useEffect(() => {
    let timer;
    if (success && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (success && countdown === 0) {
      navigate('/login');
    }
    return () => clearTimeout(timer);
  }, [success, countdown, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    // Pre-submit validation check
    const isAllValid = Object.values(validationRules).every(Boolean);
    if (!isAllValid) {
      setError('Please meet all the password strength requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        newPassword: password,
        confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please start over.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = Object.values(validationRules).every(Boolean) && password === confirmPassword && confirmPassword !== '';

  return (
    <div className="min-h-screen bg-[#FCFCFC] dark:bg-[#121212] flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-[#1E1E1E] border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-fade-in relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF385C]/5 rounded-bl-full shrink-0"></div>

          {!success ? (
            <>
              <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-1 bg-[#FF385C]/10 text-[#FF385C] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> New Credentials
                </span>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  New Password
                </h2>
                <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium px-4">
                  Choose a strong, secure password for your Nestfinder account
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs p-3.5 rounded-xl font-semibold text-center animate-shake">
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-gray-250 dark:border-zinc-700 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C] bg-transparent text-gray-900 dark:text-white"
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
                    <Lock className="w-3 h-3" /> Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-gray-250 dark:border-zinc-700 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C] bg-transparent text-gray-900 dark:text-white"
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

                {/* Password Strength Validation Rules UI */}
                <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800/80 space-y-2 text-xs">
                  <p className="font-extrabold text-gray-500 dark:text-zinc-400 text-[10px] uppercase tracking-wider">
                    Password Requirements:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className={`w-1.5 h-1.5 rounded-full ${validationRules.minLength ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-zinc-600'}`}></span>
                      <span className={validationRules.minLength ? 'text-emerald-600 dark:text-emerald-400' : ''}>Min 8 characters</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className={`w-1.5 h-1.5 rounded-full ${validationRules.uppercase ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-zinc-600'}`}></span>
                      <span className={validationRules.uppercase ? 'text-emerald-600 dark:text-emerald-400' : ''}>One uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className={`w-1.5 h-1.5 rounded-full ${validationRules.lowercase ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-zinc-600'}`}></span>
                      <span className={validationRules.lowercase ? 'text-emerald-600 dark:text-emerald-400' : ''}>One lowercase letter</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className={`w-1.5 h-1.5 rounded-full ${validationRules.number ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-zinc-600'}`}></span>
                      <span className={validationRules.number ? 'text-emerald-600 dark:text-emerald-400' : ''}>One number</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className={`w-1.5 h-1.5 rounded-full ${validationRules.specialChar ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-zinc-600'}`}></span>
                      <span className={validationRules.specialChar ? 'text-emerald-600 dark:text-emerald-400' : ''}>One special char</span>
                    </div>
                  </div>
                  {password !== '' && confirmPassword !== '' && (
                    <p className={`text-[10px] font-bold ${password === confirmPassword ? 'text-emerald-500' : 'text-red-500'}`}>
                      {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
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
                      Updating...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-5 text-center py-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-emerald-500 stroke-[1.5] animate-bounce" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Password Updated!
              </h2>
              <p className="text-sm font-semibold text-gray-600 dark:text-zinc-300 px-2">
                Your password has been changed successfully. You can now log in using your new credentials.
              </p>
              <p className="text-xs text-gray-400 dark:text-zinc-500">
                Redirecting you to Login in <span className="font-bold text-[#FF385C]">{countdown}s</span>...
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-[#FF385C] hover:bg-[#E61E4D] text-white font-extrabold py-3 rounded-xl shadow-md transition hover:scale-101 active:scale-99 cursor-pointer text-sm"
              >
                Go to Login
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
