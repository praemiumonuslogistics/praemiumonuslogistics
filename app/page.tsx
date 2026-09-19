'use client';

import { useState } from 'react';
import { submitQuoteAction } from './actions/submitQuote';

export default function ShipperLandingPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [freightType, setFreightType] = useState('Dry Van');
  const [weight, setWeight] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [trackingHash, setTrackingHash] = useState('');

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await submitQuoteAction({
      origin,
      destination,
      freightType,
      weight,
      companyName,
      contactEmail,
      contactPhone,
    });

    setLoading(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      alert('Failed to submit quote. Please verify your details and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      {/* Schema.org JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Praemium Onus Logistics',
            image: 'https://praemiumonuslogistics.com/og-image.jpg',
            '@id': 'https://praemiumonuslogistics.com',
            url: 'https://praemiumonuslogistics.com',
            telephone: '+1-702-744-6957',
            email: 'praemiumonuslogistics@gmail.com',
            priceRange: '$$$',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Las Vegas',
              addressRegion: 'NV',
              addressCountry: 'US',
            },
            description:
              'Independent Landstar Freight Agent offering dry van, flatbed, refrigerated, and heavy haul logistics with real-time GPS tracking.',
          }),
        }}
      />

      {/* Navigation Header */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-black text-xl tracking-tight text-white uppercase">
              PRAEMIUM ONUS <span className="text-amber-400">LOGISTICS</span>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
              Landstar Agent GNV
            </span>
            <a
              href="tel:+17027446957"
              className="hidden sm:inline-block text-sm font-semibold text-amber-400 hover:text-amber-300"
            >
              (702) 744-6957
            </a>
            <a
              href="mailto:praemiumonuslogistics@gmail.com"
              className="hidden md:inline-block text-sm font-semibold text-slate-300 hover:text-amber-300"
            >
              praemiumonuslogistics@gmail.com
            </a>
            <a
              href="#quote"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-all"
            >
              Get Quote
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 md:px-8 py-12 md:py-20 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full">
            <span>Landstar Agent GNV</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Premium Freight Capacity. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              100% Honest Logistics.
            </span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg leading-relaxed">
            Move your high-value freight with total visibility. Direct agent dispatch backed by Landstar’s safety-rated network, real-time GPS telemetry, and automated delivery verification.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
            <div>
              <p className="text-2xl font-extrabold text-white">99.2%</p>
              <p className="text-xs text-slate-400">On-Time Arrival</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white">100k+</p>
              <p className="text-xs text-slate-400">Capacity Options</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white">$500k</p>
              <p className="text-xs text-slate-400">Standard Cargo Cap</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div id="quote" className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl relative">
          <h2 className="text-xl font-bold text-white mb-2">Request an Instant Freight Quote</h2>
          <p className="text-xs text-slate-400 mb-6">Direct dispatch setup within 15 minutes.</p>

          {submitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-xl text-center space-y-2">
              <h3 className="font-bold text-lg">Quote Request Received!</h3>
              <p className="text-xs text-slate-300">
                Our agent team is processing your route from <strong>{origin}</strong> to <strong>{destination}</strong>. We will reach out via email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleQuoteSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Origin City/Zip</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Las Vegas, NV"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Destination City/Zip</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dallas, TX"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Equipment Type</label>
                  <select
                    value={freightType}
                    onChange={(e) => setFreightType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Dry Van">Dry Van</option>
                    <option value="Flatbed">Flatbed</option>
                    <option value="Reefer">Refrigerated</option>
                    <option value="Step Deck">Step Deck / Heavy</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Est. Weight (lbs)</label>
                  <input
                    type="text"
                    placeholder="e.g. 42,000"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="Apex Industrial Solutions"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    placeholder="shipping@apex.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="Your phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-4 rounded-xl text-base shadow-lg transition-all mt-2 disabled:opacity-50"
              >
                {loading ? 'Submitting Quote...' : 'Submit Freight Quote Request'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Quick Track Widget */}
      <section className="bg-slate-900 border-y border-slate-800 py-10 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-xl font-bold">Already Shipping With Us?</h2>
          <p className="text-sm text-slate-400">Enter your tracking code below for live GPS telemetry.</p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Enter Tracking Hash or PRO #"
              value={trackingHash}
              onChange={(e) => setTrackingHash(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
            />
            <a
              href={`/track/shipper/${trackingHash}`}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all flex items-center justify-center"
            >
              Track Load ➔
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Praemium Onus Logistics. Landstar Agent GNV.{' '}
        <a href="tel:+17027446957" className="text-amber-400 hover:text-amber-300">
          (702) 744-6957
        </a>
        {' · '}
        <a href="mailto:praemiumonuslogistics@gmail.com" className="text-amber-400 hover:text-amber-300">
          praemiumonuslogistics@gmail.com
        </a>
      </footer>
    </div>
  );
}
