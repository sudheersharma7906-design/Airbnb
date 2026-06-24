import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-red-500">airbnb</span>
        </Link>

        <div className="flex items-center gap-4">
          {user?.role === 'host' && (
            <>
              <Link
                to="/host/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-red-500"
              >
                Dashboard
              </Link>
              <Link
                to="/host/add-property"
                className="text-sm font-medium text-gray-700 hover:text-red-500"
              >
                Add Property
              </Link>
            </>
          )}

          {user ? (
            <>
              <Link
                to="/bookings"
                className="text-sm font-medium text-gray-700 hover:text-red-500"
              >
                My Trips
              </Link>
              <span className="text-sm text-gray-600">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-red-500"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
