import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyDetail from './pages/PropertyDetail';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';
import HostDashboard from './pages/HostDashboard';
import MyBookings from './pages/MyBookings';

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <p className="text-center py-20 text-gray-500">Page not found</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/properties/:id" element={<PropertyDetail />} />

      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/host/dashboard"
        element={
          <ProtectedRoute roles={['host', 'admin']}>
            <HostDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/host/add-property"
        element={
          <ProtectedRoute roles={['host', 'admin']}>
            <AddProperty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/host/edit-property/:id"
        element={
          <ProtectedRoute roles={['host', 'admin']}>
            <EditProperty />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
