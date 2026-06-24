import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('airbnb_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?._id) {
      const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin;
      const newSocket = io(socketUrl, { withCredentials: true });
      setSocket(newSocket);

      newSocket.emit('join_room', user._id);

      newSocket.on('notification', (notif) => {
        setNotifications((prev) => [
          { ...notif, id: Date.now(), read: false },
          ...prev,
        ]);
      });

      return () => {
        newSocket.close();
      };
    } else {
      setSocket(null);
    }
  }, [user]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('airbnb_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, email, password, role = 'user') => {
    const { data } = await api.post('/auth/register', { name, email, password, role });
    localStorage.setItem('airbnb_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('airbnb_user');
    setUser(null);
  };

  const toggleWishlist = async (propertyId) => {
    if (!user) return;
    try {
      const { data } = await api.post('/auth/wishlist', { propertyId });
      const updatedUser = { ...user, wishlist: data };
      localStorage.setItem('airbnb_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to toggle wishlist:', error.message);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, toggleWishlist, socket, notifications, clearNotifications }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


