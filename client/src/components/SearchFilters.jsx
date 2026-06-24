import { useState } from 'react';
import { Search, MapPin, IndianRupee, Users, Star } from 'lucide-react';

export default function SearchFilters({ filters, onChange, onSearch }) {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (e) => {
    onChange({ ...filters, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (val) => {
    onChange({ ...filters, minRating: val });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
        className="bg-white rounded-full shadow-md hover:shadow-lg border border-gray-150 p-2 flex flex-col md:flex-row items-center gap-2 md:gap-0 transition-all duration-300 relative z-30"
      >
        {/* City Input */}
        <div className="w-full md:w-1/3 px-6 py-2 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100">
          <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#FF385C]" /> Where
          </label>
          <input
            type="text"
            name="city"
            value={filters.city}
            onChange={handleChange}
            placeholder="Search destinations (Goa, Noida...)"
            className="w-full bg-transparent text-sm font-semibold text-gray-800 focus:outline-none placeholder-gray-400 mt-0.5"
          />
        </div>

        {/* Price Inputs */}
        <div className="w-full md:w-1/3 px-6 py-2 flex items-center gap-4 border-b md:border-b-0 md:border-r border-gray-100">
          <div className="flex-1">
            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <IndianRupee className="w-3 h-3 text-[#FF385C]" /> Min Price
            </label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleChange}
              placeholder="₹0"
              className="w-full bg-transparent text-sm font-semibold text-gray-800 focus:outline-none placeholder-gray-400 mt-0.5"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <IndianRupee className="w-3 h-3 text-[#FF385C]" /> Max Price
            </label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleChange}
              placeholder="₹10000"
              className="w-full bg-transparent text-sm font-semibold text-gray-800 focus:outline-none placeholder-gray-400 mt-0.5"
            />
          </div>
        </div>

        {/* Guests & Rating Inputs */}
        <div className="w-full md:w-1/3 px-6 py-2 flex items-center justify-between gap-4">
          <div className="flex-1">
            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#FF385C]" /> Who
            </label>
            <input
              type="number"
              name="guests"
              min="1"
              value={filters.guests}
              onChange={handleChange}
              placeholder="Add guests"
              className="w-full bg-transparent text-sm font-semibold text-gray-800 focus:outline-none placeholder-gray-400 mt-0.5"
            />
          </div>

          <div className="flex-1">
            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-[#FF385C]" /> Rating
            </label>
            <select
              name="minRating"
              value={filters.minRating || ''}
              onChange={handleChange}
              className="w-full bg-transparent text-sm font-semibold text-gray-800 focus:outline-none placeholder-gray-400 mt-0.5 border-0 p-0"
            >
              <option value="">Any</option>
              <option value="4">4.0+ ★</option>
              <option value="4.5">4.5+ ★</option>
              <option value="4.8">4.8+ ★</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="px-4 py-2 shrink-0 w-full md:w-auto">
          <button
            type="submit"
            className="w-full md:w-auto bg-[#FF385C] hover:bg-[#E61E4D] text-white p-3 md:p-3.5 rounded-full flex items-center justify-center gap-2 font-bold shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            <Search className="w-4 h-4 text-white" />
            <span className="md:hidden">Search Stays</span>
          </button>
        </div>
      </form>
    </div>
  );
}
