import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PropertyCard from '../components/PropertyCard';
import { Heart, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?.wishlist?.length) {
        setProperties([]);
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/properties');
        const wishlisted = data.filter((p) => user.wishlist.includes(p._id));
        setProperties(wishlisted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user?.wishlist]);

  return (
    <div className="min-h-screen bg-[#FCFCFC] pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Heart className="w-7 h-7 text-[#FF385C] fill-[#FF385C]" /> Wishlists
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Your saved homes and stays</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse space-y-4">
                <div className="bg-gray-200 rounded-2xl aspect-[4/3]"></div>
                <div className="h-4 bg-gray-200 rounded-sm w-3/4"></div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 max-w-md mx-auto space-y-4">
            <div className="bg-[#FF385C]/10 text-[#FF385C] w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Create your first wishlist</h3>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">As you search, click the heart icon on your favorite places to save them here.</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              <Compass className="w-4.5 h-4.5" /> Start exploring
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
