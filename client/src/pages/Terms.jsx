import React from 'react';
import Navbar from '../components/Navbar';
import { FileText, Shield, CreditCard, Clock, CheckCircle2 } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#FCFCFC] pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fade-in">
        
        {/* Header */}
        <div className="border-b border-gray-150 pb-8">
          <span className="inline-flex items-center gap-1.5 bg-[#FF385C]/10 text-[#FF385C] text-xs font-bold px-3 py-1 rounded-full mb-3">
            <FileText className="w-4 h-4" /> Platform Legal Terms
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Terms of Service</h1>
          <p className="text-sm text-gray-500 mt-2">Effective: July 2026 · User Agreement for Guests & Hosts</p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
          
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#FF385C]" /> 1. Acceptance of Terms
            </h2>
            <p>By accessing or using NestFinder, you agree to comply with and be bound by these Terms of Service. These terms apply to all visitors, registered guests, and property hosts.</p>
          </section>

          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#FF385C]" /> 2. Booking & Payment Terms
            </h2>
            <ul className="space-y-2.5 pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Reservations are confirmed immediately upon payment processing via Razorpay gateway.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Prices shown are per night and inclusive of taxes and platform fees unless stated otherwise.</span>
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#FF385C]" /> 3. Cancellation & Refund Policy
            </h2>
            <p>Guests receive a full 100% refund if cancellations are made at least 48 hours prior to the check-in date. Cancellations within 48 hours are subject to standard host cancellation fees.</p>
          </section>

          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-gray-900">4. Host Responsibilities</h2>
            <p>Hosts must provide accurate property descriptions, maintain safe and clean accommodation, honor confirmed reservations, and abide by local housing laws and safety guidelines.</p>
          </section>

        </div>

      </main>
    </div>
  );
}
