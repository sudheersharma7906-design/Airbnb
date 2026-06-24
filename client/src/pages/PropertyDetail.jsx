import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ checkIn: '', checkOut: '', guests: 1 });
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, reviewRes] = await Promise.all([
          api.get(`/properties/${id}`),
          api.get(`/reviews/${id}`),
        ]);
        setProperty(propRes.data);
        setReviews(reviewRes.data);
      } catch {
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setBookingError('');
    setBookingSuccess('');

    try {
      const { data: avail } = await api.get(
        `/bookings/availability/${id}?checkIn=${booking.checkIn}&checkOut=${booking.checkOut}`
      );

      if (!avail.available) {
        setBookingError('Property not available for selected dates');
        return;
      }

      await api.post('/bookings', {
        propertyId: id,
        ...booking,
        guests: Number(booking.guests),
      });

      setBookingSuccess('Booking confirmed!');
      setTimeout(() => navigate('/bookings'), 1500);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Booking failed');
    }
  };

  const handleReview = async (e) => {
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
      const propRes = await api.get(`/properties/${id}`);
      setProperty(propRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Review failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="text-center py-20 text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="text-center py-20 text-gray-500">Property not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
        <p className="text-gray-500 mb-6">
          {property.location} · {property.guests} guests · {property.bedrooms} bedrooms ·{' '}
          {property.bathrooms} bathrooms
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl overflow-hidden bg-gray-200 h-72">
              {property.images?.length ? (
                <img
                  src={property.images[activeImage]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-red-400 text-6xl font-bold">
                  {property.title.charAt(0)}
                </div>
              )}
            </div>

            {property.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                      activeImage === i ? 'border-red-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-3">About this place</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </section>

            {property.amenities?.length > 0 && (
              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-3">Amenities</h2>
                <ul className="grid grid-cols-2 gap-2">
                  {property.amenities.map((a) => (
                    <li key={a} className="text-gray-600 text-sm flex items-center gap-2">
                      <span className="text-green-500">✓</span> {a}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Reviews ({reviews.length})</h2>

              {reviews.length === 0 ? (
                <p className="text-gray-500 text-sm">No reviews yet.</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {reviews.map((r) => (
                    <div key={r._id} className="border-b border-gray-100 pb-4">
                      <p className="font-semibold text-sm">
                        {r.userId?.name}{' '}
                        <span className="text-yellow-500">{'★'.repeat(r.rating)}</span>
                      </p>
                      <p className="text-gray-600 text-sm mt-1">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {user && (
                <form onSubmit={handleReview} className="space-y-3 border-t pt-4">
                  <h3 className="font-semibold text-sm">Leave a review</h3>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} stars
                      </option>
                    ))}
                  </select>
                  <textarea
                    required
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Share your experience..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-20"
                  />
                  <button
                    type="submit"
                    className="bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800"
                  >
                    Submit Review
                  </button>
                </form>
              )}
            </section>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg sticky top-24">
              <p className="text-2xl font-bold mb-4">
                ₹{property.price.toLocaleString('en-IN')}
                <span className="text-base font-normal text-gray-500"> / night</span>
              </p>

              {property.rating > 0 && (
                <p className="text-sm font-semibold mb-4">
                  <span className="text-yellow-500">★</span> {property.rating.toFixed(1)} (
                  {property.reviewCount} reviews)
                </p>
              )}

              <form onSubmit={handleBook} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Check-in</label>
                    <input
                      type="date"
                      required
                      value={booking.checkIn}
                      onChange={(e) => setBooking({ ...booking, checkIn: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Check-out</label>
                    <input
                      type="date"
                      required
                      value={booking.checkOut}
                      onChange={(e) => setBooking({ ...booking, checkOut: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Guests</label>
                  <input
                    type="number"
                    min="1"
                    max={property.guests}
                    value={booking.guests}
                    onChange={(e) => setBooking({ ...booking, guests: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm mt-1"
                  />
                </div>

                {bookingError && (
                  <p className="text-red-500 text-sm">{bookingError}</p>
                )}
                {bookingSuccess && (
                  <p className="text-green-600 text-sm">{bookingSuccess}</p>
                )}

                <button
                  type="submit"
                  className="w-full bg-red-500 text-white font-semibold py-3 rounded-lg hover:bg-red-600"
                >
                  {user ? 'Reserve' : 'Login to Book'}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-sm mb-1">Hosted by</h3>
                <p className="text-gray-600 text-sm">{property.hostId?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
