import { useLocation, Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Heart, Globe } from 'lucide-react';

export default function Footer() {
  const location = useLocation();
  
  if (location.pathname === '/inbox') {
    return null;
  }

  return (
    <footer className="bg-white border-t border-gray-150 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Upper Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-gray-100">
          
          {/* Col 1: About Nestfinder */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <svg className="w-6 h-6 text-[#FF385C]" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 1.95c-.88 0-1.7.53-2.07 1.34l-5.32 11.5c-.32.69-.32 1.48 0 2.17l5.32 11.5c.37.81 1.19 1.34 2.07 1.34s1.7-.53 2.07-1.34l5.32-11.5c.32-.69.32-1.48 0-2.17l-5.32-11.5c-.37-.81-1.19-1.34-2.07-1.34zm0 2c.38 0 .74.23.9.58l5.32 11.5c.14.3.14.65 0 .95l-5.32 11.5a1.002 1.002 0 0 1-1.8 0l-5.32-11.5a1.002 1.002 0 0 1 0-.95l5.32-11.5c.16-.35.52-.58.9-.58zm0 5.25a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6zm0 2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6z"/>
              </svg>
              <span className="text-lg font-extrabold text-[#FF385C] tracking-tight">
                nestfinder
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              A premium MERN stack stay-booking application. Explore unique villas, cabins, and penthouses across India, featuring secure bookings, live host chats, and verified listings.
            </p>
          </div>

          {/* Col 2: Destinations */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Popular Stays</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-500 font-medium">
              <li><Link to="/?city=goa" className="hover:text-[#FF385C] transition">Candolim beachfront, Goa</Link></li>
              <li><Link to="/?city=manali" className="hover:text-[#FF385C] transition">Old Manali cabins, HP</Link></li>
              <li><Link to="/?city=greater noida" className="hover:text-[#FF385C] transition">Pari Chowk studio, Noida</Link></li>
              <li><Link to="/?city=jaipur" className="hover:text-[#FF385C] transition">Historic Havelis, Jaipur</Link></li>
              <li><Link to="/?city=kerala" className="hover:text-[#FF385C] transition">Backwaters Houseboats, Alleppey</Link></li>
            </ul>
          </div>

          {/* Col 3: Hosting */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Hosting</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-500 font-medium">
              <li><Link to="/host/dashboard" className="hover:text-[#FF385C] transition">Host Dashboard</Link></li>
              <li><Link to="/host/add-property" className="hover:text-[#FF385C] transition">List your Nesting Place</Link></li>
              <li><a href="#" className="hover:text-[#FF385C] transition">Hosting guidelines</a></li>
              <li><a href="#" className="hover:text-[#FF385C] transition">Community center</a></li>
            </ul>
          </div>

          {/* Col 4: Contact Us */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Contact Us</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-500 font-medium">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FF385C] shrink-0" />
                <a href="tel:+919616290104" className="hover:text-[#FF385C] transition">+91 9616290104</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF385C] shrink-0" />
                <a href="mailto:sudheersharma7906@gmail.com" className="hover:text-[#FF385C] transition truncate max-w-[200px] sm:max-w-none">
                  sudheersharma7906@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span>Noida, Uttar Pradesh, India</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Lower Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-medium">
          
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center sm:text-left">
            <span>© {new Date().getFullYear()} nestfinder, Inc.</span>
            <span className="hidden sm:inline">·</span>
            <a href="#" className="hover:underline">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:underline">Terms</a>
            <span>·</span>
            <a href="#" className="hover:underline">Sitemap</a>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 hover:text-[#FF385C] transition cursor-pointer">
              <Globe className="w-4 h-4" /> English (IN)
            </span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 fill-[#FF385C] text-[#FF385C]" /> in India
            </span>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-gray-900 transition" aria-label="GitHub">
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  .  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a href="#" className="hover:text-[#0077B5] transition" aria-label="LinkedIn">
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}
