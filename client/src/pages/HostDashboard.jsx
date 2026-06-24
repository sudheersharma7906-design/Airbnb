import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { LayoutDashboard, PlusCircle, Users, CreditCard, Home, Calendar, Edit3, Trash2 } from 'lucide-react';

export default function HostDashboard() {
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [propsRes, statsRes] = await Promise.all([
        api.get('/properties/host/my-listings'),
        api.get('/properties/host/stats'),
      ]);
      setProperties(propsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing? All review and booking associations will be removed.')) return;
    try {
      await api.delete(`/properties/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Deletion failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] pb-24">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <LayoutDashboard className="w-7 h-7 text-[#FF385C]" /> Host Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage listings and view hosting earnings metrics</p>
          </div>
          <Link
            to="/host/add-property"
            className="inline-flex items-center gap-1.5 bg-[#FF385C] hover:bg-[#E61E4D] text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md transition hover:scale-103 active:scale-97 cursor-pointer text-xs sm:text-sm"
          >
            <PlusCircle className="w-4 h-4" /> Create Listing
          </Link>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-gray-150 p-6 flex items-center gap-4 shadow-xs">
              <div className="bg-[#FF385C]/10 text-[#FF385C] p-3 rounded-2xl">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Listings</p>
                <p className="text-3xl font-black text-gray-900 mt-0.5">{stats.properties}</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-gray-150 p-6 flex items-center gap-4 shadow-xs">
              <div className="bg-[#FF385C]/10 text-[#FF385C] p-3 rounded-2xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Bookings</p>
                <p className="text-3xl font-black text-gray-900 mt-0.5">{stats.totalBookings}</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-gray-150 p-6 flex items-center gap-4 shadow-xs">
              <div className="bg-green-50 text-green-600 p-3 rounded-2xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Earnings</p>
                <p className="text-3xl font-black text-green-600 mt-0.5">
                  ₹{stats.totalRevenue.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Guests Block */}
        {stats?.upcomingGuests?.length > 0 && (
          <section className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#FF385C]" /> Upcoming Guests
            </h2>
            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-2">
              {stats.upcomingGuests.map((b) => (
                <div key={b._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                  <div>
                    <span className="font-bold text-gray-800">{b.userId?.name}</span>
                    <span className="text-gray-400 text-xs"> will stay at </span>
                    <span className="font-semibold text-gray-700">{b.propertyId?.title}</span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full shrink-0">
                    {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Active Listings Grid */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 tracking-tight">Your Properties</h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(n => (
                <div key={n} className="animate-pulse bg-gray-100 rounded-3xl h-24"></div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 max-w-md mx-auto space-y-4">
              <Home className="w-12 h-12 text-gray-300 mx-auto" />
              <div>
                <h3 className="font-bold text-gray-800 text-lg">No listings posted</h3>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">Rent out your space on Nestfinder to earn extra income.</p>
              </div>
              <Link 
                to="/host/add-property" 
                className="bg-gray-900 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl inline-block"
              >
                List your space
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-3xl border border-gray-150 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition duration-200"
                >
                  <div className="overflow-hidden">
                    <h3 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug truncate">{p.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 truncate">{p.location}</p>
                    <p className="text-xs font-bold text-gray-800 mt-1.5 bg-[#FF385C]/5 text-[#FF385C] inline-block px-2.5 py-0.5 rounded-md">
                      ₹{p.price.toLocaleString('en-IN')} / night
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                    <Link
                      to={`/host/edit-property/${p._id}`}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4.5 py-2.5 rounded-xl transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4.5 py-2.5 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
