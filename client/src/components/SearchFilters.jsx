export default function SearchFilters({ filters, onChange, onSearch }) {
  const handleChange = (e) => {
    onChange({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 flex flex-wrap gap-3 items-end"
    >
      <div className="flex-1 min-w-[140px]">
        <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
        <input
          type="text"
          name="city"
          value={filters.city}
          onChange={handleChange}
          placeholder="e.g. Goa"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>

      <div className="min-w-[100px]">
        <label className="block text-xs font-semibold text-gray-600 mb-1">Min Price</label>
        <input
          type="number"
          name="minPrice"
          value={filters.minPrice}
          onChange={handleChange}
          placeholder="₹0"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>

      <div className="min-w-[100px]">
        <label className="block text-xs font-semibold text-gray-600 mb-1">Max Price</label>
        <input
          type="number"
          name="maxPrice"
          value={filters.maxPrice}
          onChange={handleChange}
          placeholder="₹10000"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>

      <div className="min-w-[80px]">
        <label className="block text-xs font-semibold text-gray-600 mb-1">Guests</label>
        <input
          type="number"
          name="guests"
          min="1"
          value={filters.guests}
          onChange={handleChange}
          placeholder="1"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>

      <button
        type="submit"
        className="bg-red-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-red-600 transition"
      >
        Search
      </button>
    </form>
  );
}
