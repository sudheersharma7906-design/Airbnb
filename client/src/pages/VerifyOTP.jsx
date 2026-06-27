import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { ShieldCheck, ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Expiry / Countdown timer for OTP (5 minutes = 300 seconds)
  const [timer, setTimer] = useState(300);
  // Resend OTP countdown (60 seconds)
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  // Redirect to forgot-password if email is missing in state
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  // Main countdown timer (5 mins)
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Resend limit timer (60s)
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      setCanResend(false);
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value !== '' && !/^[0-9]$/.test(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace: clear digit and move focus to previous input
    if (e.key === 'Backspace') {
      if (otpDigits[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otpDigits];
        newOtp[index] = '';
        setOtpDigits(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasteData)) {
      setError('Please paste a valid 6-digit number');
      return;
    }

    const digits = pasteData.split('');
    setOtpDigits(digits);
    inputRefs.current[5]?.focus();
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setError('Please enter a complete 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      setMessage(res.data.message || 'OTP verified successfully!');
      
      // Delay navigation slightly to let the user see the success message
      setTimeout(() => {
        navigate('/reset-password', { state: { email, otp } });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/auth/resend-otp', { email });
      setMessage(res.data.message || 'A new OTP has been sent to your email.');
      setTimer(300); // Reset main OTP countdown to 5 mins
      setResendTimer(60); // Reset resend countdown to 60s
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Format countdown timer (MM:SS)
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] dark:bg-[#121212] flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-[#1E1E1E] border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-fade-in relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF385C]/5 rounded-bl-full shrink-0"></div>

          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1 bg-[#FF385C]/10 text-[#FF385C] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Security Verification
            </span>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Verify Code
            </h2>
            <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium px-4">
              We've sent a 6-digit OTP verification code to <span className="font-semibold text-gray-600 dark:text-zinc-300">{email}</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs p-3.5 rounded-xl font-semibold text-center animate-shake">
              {error}
            </div>
          )}

          {message && !error && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs p-3.5 rounded-xl font-semibold text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-center flex justify-center items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 6-Digit OTP Code
              </label>

              {/* 6 Digit input boxes */}
              <div className="flex justify-between gap-2 px-2" onPaste={handlePaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    ref={(el) => (inputRefs.current[index] = el)}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 border border-gray-250 dark:border-zinc-700 rounded-xl text-center text-xl font-extrabold focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent bg-transparent text-gray-900 dark:text-white"
                  />
                ))}
              </div>
            </div>

            {/* Countdown timer */}
            <div className="text-center">
              {timer > 0 ? (
                <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                  OTP expires in: <span className="font-extrabold text-red-500">{formatTimer(timer)}</span>
                </span>
              ) : (
                <span className="text-xs text-red-500 font-extrabold">
                  OTP expired! Please request a new OTP.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otpDigits.some(d => d === '')}
              className="w-full bg-[#FF385C] hover:bg-[#E61E4D] disabled:opacity-50 text-white font-extrabold py-3 rounded-xl shadow-md transition hover:scale-101 active:scale-99 cursor-pointer text-sm flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying...
                </div>
              ) : (
                'Verify Code'
              )}
            </button>

            <div className="text-center space-y-3 pt-2 border-t border-gray-50 dark:border-zinc-800">
              <div className="text-xs text-gray-400 dark:text-zinc-500">
                Didn't receive the email?{' '}
                {!canResend ? (
                  <span className="text-gray-500 font-bold">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-[#FF385C] hover:underline font-bold focus:outline-none bg-transparent border-none cursor-pointer inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend OTP
                  </button>
                )}
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#FF385C] transition font-bold focus:outline-none bg-transparent"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Use a different email
                </button>
              </div>
            </div>
          </form>

        </div>
      </main>
    </div>
  );
}
