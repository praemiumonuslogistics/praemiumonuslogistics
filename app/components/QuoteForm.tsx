'use client';

import { useState } from 'react';
import { submitQuoteAction } from '../actions/submitQuote';

const EQUIPMENT = [
  'Dry van',
  'Flatbed',
  'Step deck',
  'Reefer',
  'Hotshot',
  'LTL',
  'Heavy haul / RGN',
  'Not sure',
];

const inputClass =
  'w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400';

export function QuoteForm({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [role, setRole] = useState('Shipper');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [freightType, setFreightType] = useState('Dry van');
  const [weight, setWeight] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await submitQuoteAction({
      name,
      companyName,
      contactEmail,
      contactPhone,
      role,
      origin,
      destination,
      freightType,
      weight,
      pickupDate,
      notes,
    });
    setLoading(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(
        'We could not send that. Check the required fields and try again, or call (702) 744-6957 / email praemiumonuslogistics@gmail.com.'
      );
    }
  };

  if (submitted) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-xl space-y-2">
        <h3 className="font-bold text-lg">Request received.</h3>
        <p className="text-sm text-slate-300">
          Thank you. A Praemium Onus dispatcher will reply to {contactEmail} and {contactPhone}. Lane:{' '}
          <strong>{origin}</strong> to <strong>{destination}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {variant === 'full' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Full name</label>
            <input required className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Hale" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">I am a</label>
            <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value)}>
              <option>Shipper</option>
              <option>Carrier</option>
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Origin</label>
          <input required className={inputClass} value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Las Vegas, NV" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Destination</label>
          <input required className={inputClass} value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Dallas, TX" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Equipment</label>
          <select className={inputClass} value={freightType} onChange={(e) => setFreightType(e.target.value)}>
            {EQUIPMENT.map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">
            {variant === 'full' ? 'Pickup date' : 'Est. weight (lbs)'}
          </label>
          {variant === 'full' ? (
            <input type="date" required className={inputClass} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
          ) : (
            <input className={inputClass} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 42,000" />
          )}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1">Company</label>
        <input required className={inputClass} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Email</label>
          <input type="email" required className={inputClass} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="name@company.com" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Phone</label>
          <input type="tel" required className={inputClass} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Include area code" />
        </div>
      </div>

      {variant === 'full' && (
        <>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Est. weight (lbs)</label>
            <input className={inputClass} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight, if known" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Notes</label>
            <textarea
              className={`${inputClass} min-h-24`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Weight, pieces, hours, constraints"
            />
          </div>
        </>
      )}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-4 rounded-xl text-base shadow-lg disabled:opacity-50"
      >
        {loading ? 'Sending…' : 'Send quote request'}
      </button>
      <p className="text-xs text-slate-500">We use this information to price and plan the shipment. We do not sell your details.</p>
    </form>
  );
}
