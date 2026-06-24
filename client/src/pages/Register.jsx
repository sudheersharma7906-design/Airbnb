import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Sparkles, User, Mail, Lock, CheckCircle } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' or 'host'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 animate-fade-in relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF385C]/5 rounded-bl-full shrink-0"></div>

          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1 bg-[#FF385C]/10 text-[#FF385C] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Get Started
            </span>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create your account</h2>
            <p className="text-xs text-gray-400 font-medium">Join Nestfinder to search, book and host unique stays</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3.5 rounded-xl font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3 h-3" /> Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sudheer Sharma"
                className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C] bg-transparent"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sudheer@example.com"
                className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C] bg-transparent"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C] bg-transparent"
              />
            </div>

            {/* Role Select Buttons */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">I want to...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`border p-3 rounded-2xl cursor-pointer text-left relative flex flex-col justify-between h-20 transition duration-200 ${
                    role === 'user'
                      ? 'border-[#FF385C] bg-[#FF385C]/5 text-[#FF385C]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="text-xs font-bold block">Book Stays</span>
                  <span className="text-[10px] text-gray-400 leading-none">Find & travel</span>
                  {role === 'user' && <CheckCircle className="w-4 h-4 text-[#FF385C] absolute top-3 right-3" />}
                </button>

                <button
                  type="button"
                  onClick={() => setRole('host')}
                  className={`border p-3 rounded-2xl cursor-pointer text-left relative flex flex-col justify-between h-20 transition duration-200 ${
                    role === 'host'
                      ? 'border-[#FF385C] bg-[#FF385C]/5 text-[#FF385C]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="text-xs font-bold block">Rent My Place</span>
                  <span className="text-[10px] text-gray-400 leading-none">Host properties</span>
                  {role === 'host' && <CheckCircle className="w-4 h-4 text-[#FF385C] absolute top-3 right-3" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF385C] hover:bg-[#E61E4D] disabled:opacity-50 text-white font-extrabold py-3 rounded-xl shadow-md transition hover:scale-101 active:scale-99 cursor-pointer text-sm mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-50">
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
