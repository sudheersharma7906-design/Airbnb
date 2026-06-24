import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { Home, FileText, Image, MapPin, IndianRupee, HelpCircle } from 'lucide-react';

export default function AddProperty() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    amenities: '',
  });
  const [images, setImages] = useState([]);
  const [coords, setCoords] = useState({ lat: 28.6139, lng: 77.2090 });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Map Initialization useEffect
  useEffect(() => {
    if (!window.L) return;

    let map;
    try {
      const container = document.getElementById('add-property-map');
      if (!container || container._leaflet_id) return;

      map = window.L.map('add-property-map').setView([coords.lat, coords.lng], 13);
      container._leaflet_map = map;

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      const marker = window.L.marker([coords.lat, coords.lng], { draggable: true }).addTo(map);
      container._leaflet_marker = marker;

      // Click on map to place pin
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) });
      });

      // Drag pin to set coordinates
      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        setCoords({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) });
      });
    } catch (err) {
      console.warn('AddProperty map error:', err);
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  // Location Auto-centering useEffect
  useEffect(() => {
    const coordsMap = {
      'goa': [15.52, 73.76],
      'manali': [32.24, 77.18],
      'greater noida': [28.47, 77.50],
      'noida': [28.47, 77.50],
      'jaipur': [26.91, 75.78],
      'kerala': [9.49, 76.33]
    };

    const locationLower = form.location?.toLowerCase();
    let matchedCoords = null;

    Object.entries(coordsMap).forEach(([key, val]) => {
      if (locationLower.includes(key)) {
        matchedCoords = val;
      }
    });

    if (matchedCoords && window.L) {
      setCoords({ lat: matchedCoords[0], lng: matchedCoords[1] });
      const container = document.getElementById('add-property-map');
      if (container && container._leaflet_map) {
        container._leaflet_map.setView(matchedCoords, 13);
        if (container._leaflet_marker) {
          container._leaflet_marker.setLatLng(matchedCoords);
        }
      }
    }
  }, [form.location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      images.forEach((file) => data.append('images', file));
      data.append('lat', coords.lat);
      data.append('lng', coords.lng);

      await api.post('/properties', data);
      navigate('/host/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-[#FCFCFC] pb-24">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Home className="w-7 h-7 text-[#FF385C]" /> List your stay
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Publish a new nesting location to Nestfinder stays explorer</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs sm:text-sm p-4 rounded-2xl font-semibold">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 space-y-6 shadow-sm"
        >
          {/* Section: Basic info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">Basic Info</h3>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-gray-400" /> Property Name
              </label>
              <input
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Sunset Beachfront Villa"
                className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                required
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your nesting place. Mention special features, neighborhood perks, or host services..."
                rows={4}
                className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
              />
            </div>
          </div>

          {/* Section: Location & Pricing */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">Location & Pricing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> Location
                </label>
                <input
                  name="location"
                  required
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Goa, India"
                  className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-gray-400" /> Price per night (₹)
                </label>
                <input
                  name="price"
                  type="number"
                  required
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="5000"
                  className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
                />
              </div>
            </div>
          </div>

          {/* Section: Geo-tagging */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">Exact Geo-Tagging</h3>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Pin Exact Location (Click/drag marker to tag coordinates)
              </label>
              <div id="add-property-map" className="w-full h-64 bg-gray-100 rounded-2xl border border-gray-150 relative"></div>
              <p className="text-[10px] text-gray-400 mt-1 font-mono font-semibold">Coordinates: Lat {coords.lat}, Lng {coords.lng}</p>
            </div>
          </div>


          {/* Section: Layout details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">Capacity & Layout</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">Max Guests</label>
                <input
                  name="guests"
                  type="number"
                  min="1"
                  value={form.guests}
                  onChange={handleChange}
                  className="w-full border border-gray-250 rounded-xl px-3 py-2 text-sm text-center font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">Bedrooms</label>
                <input
                  name="bedrooms"
                  type="number"
                  min="0"
                  value={form.bedrooms}
                  onChange={handleChange}
                  className="w-full border border-gray-250 rounded-xl px-3 py-2 text-sm text-center font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">Bathrooms</label>
                <input
                  name="bathrooms"
                  type="number"
                  min="0"
                  value={form.bathrooms}
                  onChange={handleChange}
                  className="w-full border border-gray-250 rounded-xl px-3 py-2 text-sm text-center font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section: Amenities & Media */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">Amenities & Media</h3>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-gray-400" /> Amenities (comma-separated)
              </label>
              <input
                name="amenities"
                value={form.amenities}
                onChange={handleChange}
                placeholder="WiFi, AC, Pool, Kitchen, Parking"
                className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                <Image className="w-3.5 h-3.5 text-gray-400" /> Upload Images (up to 5)
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-gray-300 transition relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Drag & drop files here, or <span className="text-[#FF385C] underline font-bold">browse</span></p>
                <p className="text-[10px] text-gray-400 mt-1">Supports PNG, JPG, or JPEG formats. File limit: 5MB.</p>
              </div>
              {images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {images.map((f, i) => (
                    <span key={i} className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">{f.name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF385C] hover:bg-[#E61E4D] disabled:opacity-50 text-white font-extrabold py-3.5 rounded-2xl shadow-md transition hover:scale-101 active:scale-99 cursor-pointer text-sm"
          >
            {loading ? 'Publishing listing...' : 'Publish Stay Listing'}
          </button>
        </form>
      </main>
    </div>
  );
}
