import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { Calendar, Users, MapPin, CheckCircle, XCircle, AlertCircle, Compass, FileText } from 'lucide-react';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    if (!confirm('Are you sure you want to cancel this booking? This action is irreversible.')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const now = new Date();
  const upcoming = bookings.filter(
    (b) => b.status === 'confirmed' && new Date(b.checkIn) >= now
  );
  const past = bookings.filter(
    (b) => b.status === 'completed' || (b.status === 'confirmed' && new Date(b.checkOut) < now)
  );
  const cancelled = bookings.filter((b) => b.status === 'cancelled');

  const BookingTicket = ({ booking }) => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    return (
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden flex flex-col md:flex-row animate-fade-in hover:shadow-md transition duration-300">
        
        {/* Left Side: Property Image */}
        <div className="w-full md:w-48 aspect-video md:aspect-auto bg-gray-100 shrink-0 relative">
          {booking.propertyId?.images?.[0] ? (
            <img
              src={booking.propertyId.images[0]}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-[#FF385C]/10 text-[#FF385C] font-extrabold text-2xl">
              {booking.propertyId?.title?.charAt(0)}
            </div>
          )}
          
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {booking.status}
          </div>
        </div>

        {/* Right Side: Ticket Details */}
        <div className="flex-1 p-5 flex flex-col justify-between space-y-4 md:space-y-0 relative">
          
          {/* Ticket cut-outs for design */}
          <div className="hidden md:block absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#FCFCFC] border-r border-gray-150 rounded-full"></div>
          
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link
                  to={`/properties/${booking.propertyId?._id}`}
                  className="font-extrabold text-gray-900 hover:text-[#FF385C] text-sm sm:text-base transition"
                >
                  {booking.propertyId?.title}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {booking.propertyId?.location}
                </p>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {booking.status === 'confirmed' ? (
                  <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                  </span>
                ) : booking.status === 'cancelled' ? (
                  <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Cancelled
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {booking.status}
                  </span>
                )}
              </div>
            </div>

            {/* Travel dates */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-50 py-3 mt-4 text-xs sm:text-sm">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Check-In</span>
                <p className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#FF385C]" />
                  {checkIn.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="space-y-0.5 border-l border-gray-100 pl-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Check-Out</span>
                <p className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#FF385C]" />
                  {checkOut.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <div className="text-xs sm:text-sm space-y-0.5">
              <p className="text-gray-400 font-medium">{nights} nights · {booking.guests} guests</p>
              <p className="font-extrabold text-gray-900 text-base">
                ₹{booking.totalPrice.toLocaleString('en-IN')}{' '}
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Paid</span>
              </p>
            </div>

            {booking.status === 'confirmed' && new Date(booking.checkIn) >= now ? (
              <button
                onClick={() => handleCancel(booking._id)}
                className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Cancel Booking
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold bg-gray-50 px-3 py-1.5 rounded-xl">
                <FileText className="w-3.5 h-3.5" />
                <span>Invoice Issued</span>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  };

  const TripSection = ({ title, items }) =>
    items.length > 0 && (
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800 tracking-tight">{title} ({items.length})</h2>
        <div className="space-y-4">
          {items.map((b) => (
            <BookingTicket key={b._id} booking={b} />
          ))}
        </div>
      </section>
    );

  return (
    <div className="min-h-screen bg-[#FCFCFC] pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Your Trips</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage and track your stay reservations</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="animate-pulse bg-gray-100 rounded-3xl h-36"></div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 max-w-md mx-auto space-y-4">
            <div className="bg-[#FF385C]/10 text-[#FF385C] w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">No trips booked yet</h3>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Time to dust off your bags and start planning your next nesting destination.</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-[#FF385C] hover:bg-[#E61E4D] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
            >
              Search stays
            </button>
          </div>
        ) : (
          <>
            <TripSection title="Upcoming Trips" items={upcoming} />
            <TripSection title="Past Trips" items={past} />
            <TripSection title="Cancelled Trips" items={cancelled} />
          </>
        )}
      </main>
    </div>
  );
}
