import React from 'react';
import Navbar from '../components/Navbar';
import { ShieldCheck, Lock, Eye, Server, FileText, CheckCircle2 } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#FCFCFC] pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fade-in">
        
        {/* Header */}
        <div className="border-b border-gray-150 pb-8">
          <span className="inline-flex items-center gap-1.5 bg-[#FF385C]/10 text-[#FF385C] text-xs font-bold px-3 py-1 rounded-full mb-3">
            <ShieldCheck className="w-4 h-4" /> Official Security & Policy
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mt-2">Last updated: July 2026 · NestFinder Data Protection Commitment</p>
        </div>

        {/* Highlight Banner */}
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-3xl p-6 sm:p-8 flex items-start gap-4">
          <div className="bg-[#FF385C] text-white p-3 rounded-2xl shrink-0 shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-gray-700">
            <h3 className="font-bold text-gray-900 text-base">Your Data Privacy Matters</h3>
            <p>At NestFinder, we are dedicated to protecting your personal information and maintaining full transparency on how your data is collected, stored, and processed across our vacation rental platform.</p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
          
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#FF385C]" /> 1. Information We Collect
            </h2>
            <p>We collect information that you directly provide when registering an account, listing a property, or making a reservation:</p>
            <ul className="space-y-2.5 pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Account Data:</strong> Name, email address, phone number, and hashed password credential.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Listing Data:</strong> Property title, description, pricing, location coordinates, amenities, and uploaded property images.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Booking Details:</strong> Selected dates, guest count, payment receipts, and stay history.</span>
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-[#FF385C]" /> 2. How We Use Your Data
            </h2>
            <p>Your information is used strictly to provide a seamless booking and hosting experience:</p>
            <ul className="space-y-2.5 pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Facilitate reservations and securely verify payments via Razorpay integration.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Enable real-time guest-host messaging via our encrypted chat portal.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Power AI Support Chatbot assistance to recommend properties based on user preferences.</span>
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#FF385C]" /> 3. Data Protection & Encryption
            </h2>
            <p>We implement industry-standard technical measures including SSL encryption, JWT authentication tokens, express rate limiting, parameter sanitization, and secure cloud storage to protect your data against unauthorized access.</p>
          </section>

          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-gray-900">4. Contact Privacy Team</h2>
            <p>If you have any questions regarding your data or wish to request data deletion, contact our Privacy Officer at:</p>
            <p className="font-bold text-[#FF385C]">sudheersharma7906@gmail.com</p>
          </section>

        </div>

      </main>
    </div>
  );
}
