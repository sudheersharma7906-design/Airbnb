import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Heart, Compass, User, LogOut, Bell, LayoutDashboard, PlusCircle, Menu } from 'lucide-react';

export default function Navbar() {
  const { user, logout, notifications, clearNotifications } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <svg className="w-8 h-8 text-[#FF385C] transition-transform duration-300 group-hover:rotate-6" viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 1.95c-.88 0-1.7.53-2.07 1.34l-5.32 11.5c-.32.69-.32 1.48 0 2.17l5.32 11.5c.37.81 1.19 1.34 2.07 1.34s1.7-.53 2.07-1.34l5.32-11.5c.32-.69.32-1.48 0-2.17l-5.32-11.5c-.37-.81-1.19-1.34-2.07-1.34zm0 2c.38 0 .74.23.9.58l5.32 11.5c.14.3.14.65 0 .95l-5.32 11.5a1.002 1.002 0 0 1-1.8 0l-5.32-11.5a1.002 1.002 0 0 1 0-.95l5.32-11.5c.16-.35.52-.58.9-.58zm0 5.25a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6zm0 2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6z"/>
          </svg>
          <span className="text-xl font-extrabold text-[#FF385C] tracking-tight hidden sm:inline">
            nestfinder
          </span>
        </Link>

        {/* Desktop Nav Actions */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-semibold text-gray-700 hover:text-[#FF385C] flex items-center gap-1.5 transition">
            <Compass className="w-4.5 h-4.5" />
            <span>Explore</span>
          </Link>

          {user && (
            <>
              {/* Inbox / Chat */}
              <Link to="/inbox" className="text-sm font-semibold text-gray-700 hover:text-[#FF385C] flex items-center gap-1.5 relative transition">
                <MessageSquare className="w-4.5 h-4.5" />
                <span>Inbox</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#FF385C] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* Wishlists */}
              <Link to="/wishlist" className="text-sm font-semibold text-gray-700 hover:text-[#FF385C] flex items-center gap-1.5 transition">
                <Heart className="w-4.5 h-4.5" />
                <span>Wishlists</span>
              </Link>
            </>
          )}

          {user?.role === 'host' ? (
            <div className="hidden md:flex items-center gap-4 border-l border-gray-200 pl-4">
              <Link to="/host/dashboard" className="text-sm font-semibold text-gray-700 hover:text-[#FF385C] flex items-center gap-1.5 transition">
                <LayoutDashboard className="w-4.5 h-4.5" />
                <span>Host Dashboard</span>
              </Link>
              <Link to="/host/add-property" className="text-sm font-semibold text-gray-700 hover:text-[#FF385C] flex items-center gap-1.5 transition">
                <PlusCircle className="w-4.5 h-4.5" />
                <span>Add Property</span>
              </Link>
            </div>
          ) : (
            user && (
              <Link to="/bookings" className="text-sm font-semibold text-gray-700 hover:text-[#FF385C] transition">
                My Trips
              </Link>
            )
          )}

          {/* Notifications Button */}
          {user && (
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) clearNotifications();
                }}
                className="text-gray-600 hover:text-gray-900 p-1.5 hover:bg-gray-50 rounded-full transition relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FF385C] rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl py-3 z-50 animate-fade-in">
                  <h3 className="px-4 font-bold text-gray-900 text-sm mb-2">Notifications</h3>
                  <div className="max-h-60 overflow-y-auto px-2">
                    {notifications.length === 0 ? (
                      <p className="text-center py-6 text-xs text-gray-400">No new notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-2 hover:bg-gray-50 rounded-xl transition text-left text-xs mb-1">
                          <p className="font-semibold text-gray-900">{n.title}</p>
                          <p className="text-gray-500 mt-0.5">{n.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 border border-gray-200 rounded-full p-2 pl-3 hover:shadow-md transition cursor-pointer"
            >
              <Menu className="w-4 h-4 text-gray-500" />
              <div className="w-7 h-7 bg-[#FF385C] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner">
                {user ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-fade-in text-left">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs text-gray-400">Logged in as</p>
                      <p className="font-bold text-gray-800 truncate text-sm">{user.name}</p>
                      <span className="inline-block mt-0.5 bg-[#FF385C]/10 text-[#FF385C] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {user.role.toUpperCase()}
                      </span>
                    </div>

                    <Link 
                      to="/bookings" 
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      My Trips
                    </Link>
                    <Link 
                      to="/wishlist" 
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Wishlists
                    </Link>
                    <Link 
                      to="/inbox" 
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Inbox messages
                    </Link>

                    {user.role === 'host' && (
                      <>
                        <div className="border-t border-gray-100 my-1"></div>
                        <Link 
                          to="/host/dashboard" 
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          Host Dashboard
                        </Link>
                        <Link 
                          to="/host/add-property" 
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          List a property
                        </Link>
                      </>
                    )}

                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50/50 flex items-center gap-1.5 font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-900 font-bold hover:bg-gray-50"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-[#FF385C] font-bold hover:bg-gray-50"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
