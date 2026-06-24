import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';

export default function HostDashboard() {
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [propsRes, statsRes] = await Promise.all([
        api.get('/properties/host/my-listings'),
        api.get('/properties/host/stats'),
      ]);
      setProperties(propsRes.data);
      setStats(statsRes.data);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this property?')) return;
    await api.delete(`/properties/${id}`);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Host Dashboard</h1>
          <Link
            to="/host/add-property"
            className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600"
          >
            + Add Property
          </Link>
        </div>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Total Listings</p>
              <p className="text-3xl font-bold text-gray-900">{stats.properties}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}

        {stats?.upcomingGuests?.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-bold mb-4">Upcoming Guests</h2>
            <div className="space-y-3">
              {stats.upcomingGuests.map((b) => (
                <div key={b._id} className="flex justify-between text-sm border-b pb-2">
                  <span>{b.userId?.name} — {b.propertyId?.title}</span>
                  <span className="text-gray-500">
                    {new Date(b.checkIn).toLocaleDateString()} →{' '}
                    {new Date(b.checkOut).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        <h2 className="text-lg font-bold mb-4">Your Listings</h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-600">No listings yet.</p>
            <Link to="/host/add-property" className="text-red-500 font-medium mt-2 inline-block">
              Add your first property
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-gray-900">{p.title}</h3>
                  <p className="text-sm text-gray-500">{p.location}</p>
                  <p className="text-sm font-semibold mt-1">
                    ₹{p.price.toLocaleString('en-IN')} / night
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/host/edit-property/${p._id}`}
                    className="text-sm font-medium bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
