import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    await api.put(`/bookings/${id}/cancel`);
    fetchBookings();
  };

  const now = new Date();
  const upcoming = bookings.filter(
    (b) => b.status === 'confirmed' && new Date(b.checkIn) >= now
  );
  const past = bookings.filter(
    (b) => b.status === 'completed' || (b.status === 'confirmed' && new Date(b.checkOut) < now)
  );
  const cancelled = bookings.filter((b) => b.status === 'cancelled');

  const BookingCard = ({ booking }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-4">
      <div className="w-full sm:w-32 h-24 bg-gray-200 rounded-lg overflow-hidden shrink-0">
        {booking.propertyId?.images?.[0] ? (
          <img
            src={booking.propertyId.images[0]}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-red-400 font-bold text-2xl">
            {booking.propertyId?.title?.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1">
        <Link
          to={`/properties/${booking.propertyId?._id}`}
          className="font-bold text-gray-900 hover:text-red-500"
        >
          {booking.propertyId?.title}
        </Link>
        <p className="text-sm text-gray-500">{booking.propertyId?.location}</p>
        <p className="text-sm mt-1">
          {new Date(booking.checkIn).toLocaleDateString()} →{' '}
          {new Date(booking.checkOut).toLocaleDateString()}
        </p>
        <p className="text-sm font-semibold mt-1">
          ₹{booking.totalPrice.toLocaleString('en-IN')} ·{' '}
          <span
            className={`font-normal ${
              booking.status === 'cancelled'
                ? 'text-red-500'
                : booking.status === 'confirmed'
                  ? 'text-green-600'
                  : 'text-gray-500'
            }`}
          >
            {booking.status}
          </span>
        </p>
      </div>
      {booking.status === 'confirmed' && new Date(booking.checkIn) >= now && (
        <button
          onClick={() => handleCancel(booking._id)}
          className="self-start text-sm text-red-600 hover:underline"
        >
          Cancel
        </button>
      )}
    </div>
  );

  const Section = ({ title, items }) =>
    items.length > 0 && (
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <div className="space-y-4">
          {items.map((b) => (
            <BookingCard key={b._id} booking={b} />
          ))}
        </div>
      </section>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Trips</h1>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-600">No bookings yet.</p>
            <Link to="/" className="text-red-500 font-medium mt-2 inline-block">
              Browse properties
            </Link>
          </div>
        ) : (
          <>
            <Section title="Upcoming Trips" items={upcoming} />
            <Section title="Past Trips" items={past} />
            <Section title="Cancelled Trips" items={cancelled} />
          </>
        )}
      </main>
    </div>
  );
}
