import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Mail, ArrowLeft, Sparkles } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      // Redirect to verify-otp page with the email in state
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] dark:bg-[#121212] flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-[#1E1E1E] border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-fade-in relative overflow-hidden">
          
          {/* Logo element decorative */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF385C]/5 rounded-bl-full shrink-0"></div>

          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1 bg-[#FF385C]/10 text-[#FF385C] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Password Recovery
            </span>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Forgot Password?
            </h2>
            <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium px-4">
              Enter your email address to verify your account and receive a 6-digit OTP
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs p-3.5 rounded-xl font-semibold text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full border border-gray-250 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C] bg-transparent text-gray-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF385C] hover:bg-[#E61E4D] disabled:opacity-50 text-white font-extrabold py-3 rounded-xl shadow-md transition hover:scale-101 active:scale-99 cursor-pointer text-sm mt-2 flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </div>
              ) : (
                'Send OTP'
              )}
            </button>

            <div className="text-center pt-2 border-t border-gray-50 dark:border-zinc-800">
              <Link to="/login" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#FF385C] transition font-bold">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          </form>

        </div>
      </main>
    </div>
  );
}
