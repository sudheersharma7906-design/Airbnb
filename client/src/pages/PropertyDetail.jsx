import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Star, MapPin, Calendar, Users, Award, ShieldCheck, MessageSquare, CreditCard, Sparkles, AlertCircle } from 'lucide-react';

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Booking state
  const [booking, setBooking] = useState({ checkIn: '', checkOut: '', guests: 1 });
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [paying, setPaying] = useState(false);

  // Review state
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  // Map reference
  const mapContainerRef = useRef(null);
  const [leafletReady, setLeafletReady] = useState(!!window.L);

  // Poll for window.L to handle script loading race condition
  useEffect(() => {
    if (window.L) {
      setLeafletReady(true);
      return;
    }
    const interval = setInterval(() => {
      if (window.L) {
        setLeafletReady(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [propRes, reviewRes] = await Promise.all([
          api.get(`/properties/${id}`),
          api.get(`/reviews/${id}`),
        ]);
        setProperty(propRes.data);
        setReviews(reviewRes.data);

        // Fetch similar properties for AI Recommendation
        const allPropsRes = await api.get('/properties');
        const similar = allPropsRes.data
          .filter(p => p._id !== id && (p.city === propRes.data.city || Math.abs(p.price - propRes.data.price) < 3000))
          .slice(0, 3);
        setSimilarProperties(similar);
      } catch (err) {
        console.error(err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!property || !leafletReady || !window.L) return;

    // Fix default Leaflet icon path resolution in Vite
    delete window.L.Icon.Default.prototype._getIconUrl;
    window.L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const coords = [property.lat || 28.6139, property.lng || 77.2090];

    let map;
    try {
      const container = document.getElementById('property-map');
      if (!container) return;
      if (container._leaflet_id) {
        // Already initialized, do not re-create
        return;
      }
      map = window.L.map('property-map', { scrollWheelZoom: false }).setView(coords, 14);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      window.L.marker(coords)
        .addTo(map)
        .bindPopup(`<b>${property.title}</b><br/>Exact coordinates: ${coords[0]}, ${coords[1]}`)
        .openPopup();
    } catch (err) {
      console.warn('Map initialization failed:', err);
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [property, leafletReady]);

  const handleBookingInitiate = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setBookingError('');
    setBookingSuccess('');

    try {
      // 1. Create Razorpay order
      const { data } = await api.post('/bookings/razorpay-order', {
        propertyId: id,
        ...booking,
        guests: Number(booking.guests),
      });

      setCheckoutData(data);
      
      // If it is mock (i.e. local config without keys), we will open our custom simulated overlay
      if (data.order.mock) {
        setCheckoutModalOpen(true);
      } else {
        // Run real Razorpay
        const options = {
          key: data.keyId,
          amount: data.order.amount,
          currency: data.order.currency,
          name: "nestfinder stays",
          description: `Payment for ${property.title}`,
          order_id: data.order.id,
          handler: async function (response) {
            try {
              setPaying(true);
              await api.post('/bookings/verify-payment', {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                propertyId: id,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                guests: Number(booking.guests),
                totalPrice: data.totalPrice,
              });
              setBookingSuccess('Booking confirmed & payment verified!');
              setTimeout(() => navigate('/bookings'), 2000);
            } catch (err) {
              setBookingError(err.response?.data?.message || 'Payment verification failed');
            } finally {
              setPaying(false);
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: {
            color: "#FF385C",
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Order creation failed');
    }
  };

  const handleSimulatePayment = async () => {
    setPaying(true);
    try {
      await api.post('/bookings/verify-payment', {
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_order_id: checkoutData.order.id,
        razorpay_signature: `sig_mock_${Date.now()}`,
        propertyId: id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: Number(booking.guests),
        totalPrice: checkoutData.totalPrice,
      });
      setBookingSuccess('Mock Payment verified! Booking confirmed.');
      setCheckoutModalOpen(false);
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Payment simulation failed');
    } finally {
      setPaying(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data } = await api.post('/reviews', {
        propertyId: id,
        ...reviewForm,
        rating: Number(reviewForm.rating),
      });
      setReviews([data, ...reviews]);
      setReviewForm({ rating: 5, comment: '' });
      // Update property details (average ratings)
      const propRes = await api.get(`/properties/${id}`);
      setProperty(propRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFCFC]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-[#FF385C] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-semibold text-sm">Loading nesting details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#FCFCFC]">
        <Navbar />
        <div className="text-center py-32 max-w-sm mx-auto space-y-4">
          <AlertCircle className="w-12 h-12 text-[#FF385C] mx-auto" />
          <h2 className="text-xl font-bold text-gray-800">Stay Not Found</h2>
          <p className="text-gray-400 text-sm">The listing you are looking for might have been removed or does not exist.</p>
          <Link to="/" className="inline-block bg-gray-900 text-white font-bold px-6 py-2 rounded-xl text-sm">Back to Home</Link>
        </div>
      </div>
    );
  }

  const galleryImages = property.images?.length ? property.images : [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
  ];

  return (
    <div className="min-h-screen bg-[#FCFCFC] pb-24">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        {/* Title and Rating Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{property.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm font-semibold text-gray-500">
            {property.rating > 0 && (
              <span className="flex items-center gap-1 text-gray-900">
                <Star className="w-4 h-4 fill-[#FF385C] text-[#FF385C]" />
                {property.rating.toFixed(1)} · <span className="underline font-normal text-gray-500 cursor-pointer">{reviews.length} reviews</span>
              </span>
            )}
            <span className="underline flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              {property.location}
            </span>
          </div>
        </div>

        {/* Gallery Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden aspect-video md:aspect-[21/9]">
          <div className="md:col-span-2 relative h-full">
            <img src={galleryImages[0]} alt="" className="w-full h-full object-cover hover:opacity-95 transition cursor-pointer" />
          </div>
          <div className="hidden md:grid grid-cols-2 col-span-2 gap-2 h-full">
            {Array.from({ length: 4 }).map((_, idx) => {
              const imgUrl = galleryImages[idx + 1] || galleryImages[0];
              return (
                <div key={idx} className="relative h-full overflow-hidden bg-gray-100">
                  <img src={imgUrl} alt="" className="w-full h-full object-cover hover:scale-105 transition duration-300 cursor-pointer" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Details Panel */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Host Details */}
            <div className="border-b border-gray-100 pb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Entire stay hosted by {property.hostId?.name || 'Local Nest Host'}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {property.guests} guests · {property.bedrooms} bedrooms · {property.bathrooms} bathrooms
                </p>
              </div>
              <div className="w-12 h-12 bg-[#FF385C]/10 text-[#FF385C] rounded-full flex items-center justify-center font-extrabold text-lg shadow-inner">
                {property.hostId?.name?.charAt(0).toUpperCase() || 'H'}
              </div>
            </div>

            {/* Badges / Values */}
            <div className="border-b border-gray-100 pb-6 space-y-4">
              <div className="flex gap-4">
                <Award className="w-6 h-6 text-[#FF385C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-800 text-sm sm:text-base">Highly Rated Host</h4>
                  <p className="text-xs sm:text-sm text-gray-500">Guests consistently rate this host 4.8+ stars for helpfulness and cleanliness.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <ShieldCheck className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-800 text-sm sm:text-base">Verified Nest Guarantee</h4>
                  <p className="text-xs sm:text-sm text-gray-500">Every photo, amenity, and pricing detail is audited and verified by our local team.</p>
                </div>
              </div>
            </div>

            {/* About stay */}
            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">About this space</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="border-b border-gray-100 pb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">What this place offers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.amenities.map((a) => (
                    <div key={a} className="text-gray-600 text-sm sm:text-base flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full shrink-0"></div>
                      <span className="font-medium">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Where you'll be</h3>
              <div id="property-map" className="w-full h-72 sm:h-96 bg-gray-100 rounded-2xl border border-gray-100 shadow-sm relative"></div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-gray-100 pt-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                  <Star className="w-5 h-5 fill-[#FF385C] text-[#FF385C]" />
                  <span>{reviews.length} reviews</span>
                </h3>
              </div>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-sm italic">No reviews yet. Be the first to leave a review!</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {reviews.map((r) => (
                    <div key={r._id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800 text-sm">{r.userId?.name || 'Verified Traveler'}</span>
                        <span className="flex items-center gap-0.5 text-xs text-yellow-500">
                          {'★'.repeat(r.rating)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-4">"{r.comment}"</p>
                      <p className="text-[10px] text-gray-300 text-right">{new Date(r.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Review Form */}
              {user && (
                <form onSubmit={handleReviewSubmit} className="bg-gray-50/50 rounded-2xl border border-gray-100 p-5 space-y-4 mt-6">
                  <h4 className="font-bold text-gray-800 text-sm sm:text-base">Leave a review</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-gray-500">Rating:</span>
                    <select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                      className="border border-gray-250 bg-white rounded-lg px-2.5 py-1 text-sm font-semibold focus:ring-1 focus:ring-[#FF385C] focus:outline-none"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>{n} Stars</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    required
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Tell us about your experience..."
                    className="w-full border border-gray-250 bg-white rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#FF385C] focus:outline-none h-24"
                  />
                  <button
                    type="submit"
                    className="bg-gray-900 hover:bg-gray-800 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Submit Review
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Right Floating Checkout Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xl sticky top-24 space-y-6">
              
              <div className="flex justify-between items-end">
                <span className="text-2xl font-black text-gray-900">
                  ₹{property.price.toLocaleString('en-IN')}
                  <span className="text-sm font-normal text-gray-400"> / night</span>
                </span>
                {property.rating > 0 && (
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-800 shrink-0 mb-1">
                    <Star className="w-3.5 h-3.5 fill-[#FF385C] text-[#FF385C]" />
                    {property.rating.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Reservation Dates & Guests Form */}
              <form onSubmit={handleBookingInitiate} className="space-y-4">
                <div className="border border-gray-250 rounded-2xl overflow-hidden divide-y divide-gray-200">
                  <div className="grid grid-cols-2 divide-x divide-gray-200">
                    <div className="p-3">
                      <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Check-In</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={booking.checkIn}
                        onChange={(e) => setBooking({ ...booking, checkIn: e.target.value })}
                        className="w-full bg-transparent text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none"
                      />
                    </div>
                    <div className="p-3">
                      <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Check-Out</label>
                      <input
                        type="date"
                        required
                        min={booking.checkIn || new Date().toISOString().split('T')[0]}
                        value={booking.checkOut}
                        onChange={(e) => setBooking({ ...booking, checkOut: e.target.value })}
                        className="w-full bg-transparent text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="p-3">
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Guests</label>
                    <input
                      type="number"
                      min="1"
                      max={property.guests}
                      value={booking.guests}
                      onChange={(e) => setBooking({ ...booking, guests: e.target.value })}
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none"
                    />
                  </div>
                </div>

                {bookingError && (
                  <p className="text-red-500 text-xs font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {bookingError}
                  </p>
                )}
                {bookingSuccess && (
                  <p className="text-green-600 text-xs font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> {bookingSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#FF385C] hover:bg-[#E61E4D] text-white font-extrabold py-3.5 rounded-2xl shadow-md transition hover:scale-101 active:scale-99 cursor-pointer text-center text-sm"
                >
                  {user ? 'Reserve stay' : 'Log in to Reserve'}
                </button>
              </form>

              {/* Price Calculations details */}
              {booking.checkIn && booking.checkOut && (
                <div className="border-t border-gray-100 pt-4 space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span className="underline">
                      ₹{property.price.toLocaleString('en-IN')} x {Math.max(1, Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)))} nights
                    </span>
                    <span>
                      ₹{(property.price * Math.max(1, Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)))).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span className="underline">Nestfinder cleaning fee</span>
                    <span>₹450</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span className="underline">GST Taxes (18%)</span>
                    <span>
                      ₹{Math.round(property.price * Math.max(1, Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))) * 0.18).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-extrabold text-gray-900">
                    <span>Total stay price</span>
                    <span>
                      ₹{(
                        property.price * Math.max(1, Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))) +
                        450 +
                        Math.round(property.price * Math.max(1, Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))) * 0.18)
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}

              {/* Chat panel initiator */}
              {user && user._id !== property.hostId?._id && (
                <div className="border-t border-gray-100 pt-4 text-center">
                  <Link
                    to={`/inbox?userId=${property.hostId?._id || ''}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#FF385C] underline transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Have questions? Message host</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* AI Recommendations - Similar Stays */}
        {similarProperties.length > 0 && (
          <section className="border-t border-gray-100 pt-12 space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF385C]" />
              <h3 className="font-extrabold text-gray-900 text-lg">AI Suggestions: Similar Stays</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {similarProperties.map((p) => (
                <Link to={`/properties/${p._id}`} key={p._id} className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition">
                  <div className="aspect-video bg-gray-150">
                    <img src={p.images?.[0] || galleryImages[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 space-y-1">
                    <h4 className="font-bold text-sm text-gray-800 truncate group-hover:text-[#FF385C]">{p.title}</h4>
                    <p className="text-xs text-gray-400">{p.location}</p>
                    <p className="font-extrabold text-xs text-gray-800">₹{p.price.toLocaleString('en-IN')} / night</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Simulated Checkout Modal (Mock Razorpay fallback) */}
      {checkoutModalOpen && checkoutData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-5 text-center">
            
            <div className="bg-[#FF385C]/10 text-[#FF385C] w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-black text-gray-900 text-lg">nestfinder Payment Checkout</h3>
              <p className="text-xs text-gray-500 mt-1">Simulating Razorpay Test payment Gateway</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 text-left text-xs space-y-2">
              <p className="flex justify-between"><span className="text-gray-400">Order ID:</span> <span className="font-mono text-gray-800 font-semibold">{checkoutData.order.id}</span></p>
              <p className="flex justify-between"><span className="text-gray-400">Stay:</span> <span className="font-semibold text-gray-800 truncate max-w-[180px]">{checkoutData.propertyTitle}</span></p>
              <p className="flex justify-between"><span className="text-gray-400">Amount:</span> <span className="font-bold text-[#FF385C]">₹{checkoutData.totalPrice.toLocaleString('en-IN')}</span></p>
            </div>

            {paying ? (
              <div className="py-2 flex flex-col items-center justify-center space-y-2">
                <div className="w-8 h-8 border-4 border-[#FF385C] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-gray-400 font-semibold">Authorizing simulated transaction...</p>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setCheckoutModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSimulatePayment}
                  className="flex-1 bg-[#FF385C] hover:bg-[#E61E4D] text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
                >
                  Simulate Success
                </button>
              </div>
            )}

            <p className="text-[10px] text-gray-400">This is a sandbox fallback because no Razorpay API keys are configured.</p>
          </div>
        </div>
      )}
    </div>
  );
}
