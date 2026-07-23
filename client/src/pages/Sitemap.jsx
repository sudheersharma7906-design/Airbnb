import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Compass, Home, User, Heart, MessageSquare, PlusCircle, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

export default function Sitemap() {
  const sections = [
    {
      title: 'Main Navigation & Stays',
      icon: Home,
      links: [
        { label: 'Home Stays Explorer', url: '/' },
        { label: 'Candolim Beachfront, Goa', url: '/?city=goa' },
        { label: 'Old Manali Cabins, Himachal Pradesh', url: '/?city=manali' },
        { label: 'Pari Chowk & Sector 150 Penthouses, Greater Noida', url: '/?city=greater noida' },
        { label: 'Royal Heritage Havelis, Jaipur', url: '/?city=jaipur' },
        { label: 'Backwaters Houseboats, Alleppey (Kerala)', url: '/?city=kerala' }
      ]
    },
    {
      title: 'Guest Account & Bookings',
      icon: User,
      links: [
        { label: 'Sign In / Account Access', url: '/login' },
        { label: 'Create New Guest Account', url: '/register' },
        { label: 'My Saved Wishlist Stays', url: '/wishlist' },
        { label: 'My Confirmed Bookings & History', url: '/bookings' },
        { label: 'Host & Guest Messaging Inbox', url: '/inbox' }
      ]
    },
    {
      title: 'Hosting Portal & Management',
      icon: PlusCircle,
      links: [
        { label: 'Host Dashboard & Revenue Analytics', url: '/host/dashboard' },
        { label: 'List New Stay / Property', url: '/host/add-property' },
        { label: 'Hosting Guidelines & Community Standards', url: '/privacy' }
      ]
    },
    {
      title: 'Legal, Security & Support',
      icon: ShieldCheck,
      links: [
        { label: 'Privacy Policy & Data Security', url: '/privacy' },
        { label: 'Terms of Service & Cancellation Policy', url: '/terms' },
        { label: 'Interactive HTML Sitemap', url: '/sitemap' },
        { label: 'NestBot 24/7 AI Support Agent', url: '/' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FCFCFC] pb-24">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fade-in">
        
        {/* Header */}
        <div className="border-b border-gray-150 pb-8">
          <span className="inline-flex items-center gap-1.5 bg-[#FF385C]/10 text-[#FF385C] text-xs font-bold px-3 py-1 rounded-full mb-3">
            <Compass className="w-4 h-4" /> Full Application Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">NestFinder Sitemap</h1>
          <p className="text-sm text-gray-500 mt-2">Complete index of pages, stay categories, hosting tools, and guest support links.</p>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div key={idx} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-xs space-y-4 hover:shadow-md transition">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="bg-[#FF385C]/10 text-[#FF385C] p-2.5 rounded-2xl">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">{sec.title}</h3>
                </div>
                <ul className="space-y-3">
                  {sec.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link
                        to={link.url}
                        className="text-xs sm:text-sm text-gray-600 hover:text-[#FF385C] font-semibold flex items-center gap-2 group transition"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#FF385C] transition"></span>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
