import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Sparkles, Phone, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { sendLoginOTP, verifyLoginOTP } = useAuth();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!mobile) {
      setError('Please enter a valid mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await sendLoginOTP(mobile);
      setOtpSent(true);
      setMessage(res.message || 'OTP sent successfully to your mobile number');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Make sure the number is registered.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (otp.trim().length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      return;
    }
    setLoading(true);
    try {
      await verifyLoginOTP(mobile, otp);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-fade-in relative overflow-hidden">
          
          {/* Logo element decorative */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF385C]/5 rounded-bl-full shrink-0"></div>

          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1 bg-[#FF385C]/10 text-[#FF385C] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Welcome Back
            </span>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Log in to Nestfinder</h2>
            <p className="text-xs text-gray-400 font-medium">Access your stays, bookings, and direct chats</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3.5 rounded-xl font-semibold text-center">
              {error}
            </div>
          )}

          {message && !error && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs p-3.5 rounded-xl font-semibold text-center">
              {message}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Mobile Number
                </label>
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C] bg-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF385C] hover:bg-[#E61E4D] disabled:opacity-50 text-white font-extrabold py-3 rounded-xl shadow-md transition hover:scale-101 active:scale-99 cursor-pointer text-sm mt-2"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center pb-2">
                <p className="text-xs text-gray-500 font-medium">
                  We sent a code to <span className="font-extrabold text-gray-800">{mobile}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-[10px] text-[#FF385C] hover:underline font-extrabold bg-transparent border-none cursor-pointer mt-1"
                >
                  Change Mobile Number
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit OTP"
                  className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm tracking-widest text-center font-extrabold focus:outline-none focus:ring-1 focus:ring-[#FF385C] bg-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-[#FF385C] hover:bg-[#E61E4D] disabled:opacity-50 text-white font-extrabold py-3 rounded-xl shadow-md transition hover:scale-101 active:scale-99 cursor-pointer text-sm mt-2"
              >
                {loading ? 'Verifying...' : 'Verify & Log In'}
              </button>
              
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="text-xs text-gray-500 hover:text-[#FF385C] font-bold bg-transparent border-none cursor-pointer"
                >
                  Resend OTP Code
                </button>
              </div>
            </form>
          )}

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-50">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#FF385C] hover:underline font-bold">
              Sign up
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
