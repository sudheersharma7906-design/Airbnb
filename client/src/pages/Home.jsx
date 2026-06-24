import { useState, useEffect } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import PropertyCard from '../components/PropertyCard';
import SearchFilters from '../components/SearchFilters';
import { Palmtree, Tent, Sparkles, Building, Castle, Ship } from 'lucide-react';

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [filters, setFilters] = useState({
    city: '',
    minPrice: '',
    maxPrice: '',
    guests: '',
    minRating: '',
  });

  const categories = [
    { id: 'all', label: 'All Stays', icon: Sparkles, value: '' },
    { id: 'goa', label: 'Beachfront', icon: Palmtree, value: 'goa' },
    { id: 'manali', label: 'Cabins', icon: Tent, value: 'manali' },
    { id: 'noida', label: 'Penthouses', icon: Building, value: 'greater noida' },
    { id: 'jaipur', label: 'Heritage', icon: Castle, value: 'jaipur' },
    { id: 'kerala', label: 'Houseboats', icon: Ship, value: 'kerala' },
  ];

  const fetchProperties = async (params = filters) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params.city) query.set('city', params.city);
      if (params.minPrice) query.set('minPrice', params.minPrice);
      if (params.maxPrice) query.set('maxPrice', params.maxPrice);
      if (params.guests) query.set('guests', params.guests);
      if (params.minRating) query.set('minRating', params.minRating);

      const { data } = await api.get(`/properties?${query.toString()}`);
      setProperties(data);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(filters);
  }, []);

  const handleCategorySelect = (cat) => {
    setActiveCategory(cat.id);
    const updatedFilters = { ...filters, city: cat.value };
    setFilters(updatedFilters);
    fetchProperties(updatedFilters);
  };

  // AI Recommendation engine: Sort stays by rating (highest first) and price value (best rating per price)
  const aiRecommended = [...properties]
    .filter(p => p.rating >= 4.5)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FCFCFC] pb-16">
      <Navbar />

      {/* Hero Banner Section */}
      <header className="relative py-12 md:py-16 bg-gradient-to-b from-[#FF385C]/5 via-[#FF385C]/0 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-[#FF385C]/10 text-[#FF385C] text-xs font-bold px-3 py-1 rounded-full animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> Book Unique Stays in India
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">
            Find your next <span className="text-[#FF385C]">nesting place</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base font-medium">
            Explore beachfront luxury villas, cozy wooden cabins, heritage palace rooms, and stylish penthouses.
          </p>
        </div>
      </header>

      {/* Search Widget */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-8">
        <SearchFilters
          filters={filters}
          onChange={setFilters}
          onSearch={() => fetchProperties(filters)}
        />
      </section>

      {/* Category Icons Selector */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 border-b border-gray-100 pb-2">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat)}
                className={`flex flex-col items-center gap-2 py-3 px-1 border-b-2 transition-all duration-300 cursor-pointer shrink-0 ${
                  isActive 
                    ? 'border-[#FF385C] text-[#FF385C] scale-105 font-bold' 
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#FF385C]' : 'text-gray-400'}`} />
                <span className="text-xs uppercase tracking-wider font-semibold">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Stays Listing */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Listings Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {activeCategory === 'all' ? 'All available stays' : `Stays in ${categories.find(c => c.id === activeCategory).label}`}
            </h2>
            <span className="text-xs font-semibold text-gray-400">{properties.length} results</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="animate-pulse space-y-4">
                  <div className="bg-gray-200 rounded-2xl aspect-[4/3]"></div>
                  <div className="h-4 bg-gray-200 rounded-sm w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded-sm w-1/2"></div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 max-w-lg mx-auto">
              <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 text-lg">No properties match your filter</h3>
              <p className="text-gray-400 text-sm mt-1">Try resetting your filters or selecting a different city.</p>
              <button 
                onClick={() => {
                  setFilters({ city: '', minPrice: '', maxPrice: '', guests: '', minRating: '' });
                  setActiveCategory('all');
                  fetchProperties({ city: '', minPrice: '', maxPrice: '', guests: '', minRating: '' });
                }}
                className="mt-4 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
        </section>

        {/* AI Recommendations Section */}
        {!loading && aiRecommended.length > 0 && (
          <section className="bg-gradient-to-r from-[#FF385C]/5 to-transparent rounded-3xl p-6 sm:p-8 border border-[#FF385C]/10 space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-[#FF385C]/10 p-2 rounded-xl text-[#FF385C]">
                <Sparkles className="w-5 h-5 fill-[#FF385C]" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">AI Smart Recommendations</h3>
                <p className="text-xs text-gray-500">Curated guest favorites and top-rated stays matching search trends</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aiRecommended.map((property) => (
                <PropertyCard key={`ai-${property._id}`} property={property} />
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
