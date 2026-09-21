'use client';

import { useMemo, useState } from 'react';
import { submitQuoteAction } from '../actions/submitQuote';
import { AddressFields } from './AddressFields';
import { formatAddress, isCompleteAddress, type AddressParts } from '../lib/address';
import {
  COMMODITIES,
  EQUIPMENT,
  LOADING_ACCESS,
  OPEN_DECK_DISCLAIMER,
  TARP_OPTIONS,
  flagsForDims,
} from '../lib/openDeck';

const inputClass =
  'w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400';

const emptyAddress: AddressParts = { street: '', city: '', state: '', zip: '' };

export function QuoteForm({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [role, setRole] = useState('Shipper');
  const [origin, setOrigin] = useState<AddressParts>(emptyAddress);
  const [destination, setDestination] = useState<AddressParts>(emptyAddress);
  const [freightType, setFreightType] = useState('FLATBED');
  const [weight, setWeight] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [commodity, setCommodity] = useState('Structural Steel');
  const [lengthFt, setLengthFt] = useState('');
  const [widthFt, setWidthFt] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [tarpSize, setTarpSize] = useState('NONE');
  const [chains, setChains] = useState(false);
  const [straps, setStraps] = useState(true);
  const [edgeProtectors, setEdgeProtectors] = useState(false);
  const [coilRacks, setCoilRacks] = useState(false);
  const [levelers, setLevelers] = useState(false);
  const [loadingAccess, setLoadingAccess] = useState(LOADING_ACCESS[1]);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const widthNum = Number(widthFt) || 0;
  const heightNum = Number(heightFt) || 0;
  const flags = useMemo(() => flagsForDims(widthNum, heightNum, freightType), [widthNum, heightNum, freightType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (variant === 'full' && (!isCompleteAddress(origin) || !isCompleteAddress(destination))) {
      setError('Origin and destination need street, city, state, and ZIP.');
      return;
    }
    if (variant === 'compact' && (!(origin.zip || '').trim() || !(destination.zip || '').trim())) {
      setError('Origin ZIP and destination ZIP are required.');
      return;
    }
    if (!lengthFt || !widthFt || !heightFt) {
      setError('Piece length, width, and height are required for open-deck quoting.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await submitQuoteAction({
      name,
      companyName,
      contactEmail,
      contactPhone,
      role,
      originStreet: origin.street || '',
      originCity: origin.city || '',
      originState: origin.state || '',
      originZip: origin.zip || '',
      destinationStreet: destination.street || '',
      destinationCity: destination.city || '',
      destinationState: destination.state || '',
      destinationZip: destination.zip || '',
      freightType,
      weight,
      pickupDate,
      commodity,
      lengthFt,
      widthFt,
      heightFt,
      tarpSize,
      chainsRequired: chains,
      strapsRequired: straps,
      edgeProtectors,
      coilRacks,
      levelers,
      loadingAccess,
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
        <h3 className="font-bold text-lg">Open-deck request received.</h3>
        <p className="text-sm text-slate-300">
          Thank you. A Praemium Onus dispatcher will reply to {contactEmail} and {contactPhone}. Lane:{' '}
          <strong>{formatAddress(origin)}</strong> to <strong>{formatAddress(destination)}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-slate-500">{OPEN_DECK_DISCLAIMER}</p>
      {variant === 'full' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Full name</label>
            <input required className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
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

      {variant === 'full' ? (
        <>
          <AddressFields legend="Origin — full address with ZIP" value={origin} onChange={setOrigin} />
          <AddressFields legend="Destination — full address with ZIP" value={destination} onChange={setDestination} />
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Origin ZIP</label>
            <input
              required
              className={inputClass}
              value={origin.zip || ''}
              onChange={(e) => setOrigin({ ...origin, zip: e.target.value })}
              placeholder="89101"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Destination ZIP</label>
            <input
              required
              className={inputClass}
              value={destination.zip || ''}
              onChange={(e) => setDestination({ ...destination, zip: e.target.value })}
              placeholder="90021"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-400 block mb-1">Open-deck equipment</label>
          <select className={inputClass} value={freightType} onChange={(e) => setFreightType(e.target.value)}>
            {EQUIPMENT.map((eq) => (
              <option key={eq.code} value={eq.code}>
                {eq.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Commodity</label>
          <select className={inputClass} value={commodity} onChange={(e) => setCommodity(e.target.value)}>
            {COMMODITIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Total weight (lbs)</label>
          <input required className={inputClass} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="42000" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Piece length (ft)</label>
          <input required className={inputClass} value={lengthFt} onChange={(e) => setLengthFt(e.target.value)} placeholder="40" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Piece width (ft)</label>
          <input required className={inputClass} value={widthFt} onChange={(e) => setWidthFt(e.target.value)} placeholder="8.5" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Piece height (ft)</label>
          <input required className={inputClass} value={heightFt} onChange={(e) => setHeightFt(e.target.value)} placeholder="8" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Pickup date</label>
          <input type="date" required className={inputClass} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
        </div>
      </div>
      {flags.oversize ? (
        <p className="text-xs text-amber-300">Width over 8.5 ft — oversize / permits likely.</p>
      ) : null}
      {flags.stepdeckRequired ? (
        <p className="text-xs text-amber-300">Deck + height exceeds 13.6 ft on a standard flatbed — stepdeck or RGN required.</p>
      ) : null}

      <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1">Tarping</label>
        <select className={inputClass} value={tarpSize} onChange={(e) => setTarpSize(e.target.value)}>
          {TARP_OPTIONS.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={chains} onChange={(e) => setChains(e.target.checked)} />
          Chains & binders
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={straps} onChange={(e) => setStraps(e.target.checked)} />
          4-inch straps
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={edgeProtectors} onChange={(e) => setEdgeProtectors(e.target.checked)} />
          Edge protectors
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={coilRacks} onChange={(e) => setCoilRacks(e.target.checked)} />
          Coil racks
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={levelers} onChange={(e) => setLevelers(e.target.checked)} />
          Levelers / ramps
        </label>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1">Loading / unloading</label>
        <select className={inputClass} value={loadingAccess} onChange={(e) => setLoadingAccess(e.target.value)}>
          {LOADING_ACCESS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1">Company</label>
        <input required className={inputClass} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Email</label>
          <input type="email" required className={inputClass} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Phone</label>
          <input type="tel" required className={inputClass} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </div>
      </div>
      {variant === 'full' ? (
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Notes</label>
          <textarea className={`${inputClass} min-h-24`} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-4 rounded-xl text-base disabled:opacity-50"
      >
        {loading ? 'Sending…' : 'Send open-deck quote'}
      </button>
    </form>
  );
}
