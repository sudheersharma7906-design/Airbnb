import { useState, useEffect } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import PropertyCard from '../components/PropertyCard';
import SearchFilters from '../components/SearchFilters';

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    minPrice: '',
    maxPrice: '',
    guests: '',
  });

  const fetchProperties = async (params = filters) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params.city) query.set('city', params.city);
      if (params.minPrice) query.set('minPrice', params.minPrice);
      if (params.maxPrice) query.set('maxPrice', params.maxPrice);
      if (params.guests) query.set('guests', params.guests);

      const { data } = await api.get(`/properties?${query.toString()}`);
      setProperties(data);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties({});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find your next stay</h1>
          <p className="text-gray-500">Discover unique places to stay around the world</p>
        </div>

        <div className="mb-8">
          <SearchFilters
            filters={filters}
            onChange={setFilters}
            onSearch={() => fetchProperties(filters)}
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading properties...</p>
        ) : properties.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-600 text-lg">No properties found.</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
