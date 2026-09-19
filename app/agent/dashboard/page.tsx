'use client';

import { useState, useEffect } from 'react';
import { AddressFields } from '../../components/AddressFields';
import { formatAddress, isCompleteAddress, type AddressParts } from '../../lib/address';
import { getSupabase, type LoadRecord } from '../../lib/supabaseBrowser';

function newTrackingHash() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

const emptyAddress: AddressParts = { street: '', city: '', state: '', zip: '' };
const inputClass =
  'bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500';

export default function AgentDashboard() {
  const [loads, setLoads] = useState<LoadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [proNumber, setProNumber] = useState('');
  const [shipper, setShipper] = useState('');
  const [shipperEmail, setShipperEmail] = useState('');
  const [origin, setOrigin] = useState<AddressParts>(emptyAddress);
  const [destination, setDestination] = useState<AddressParts>(emptyAddress);
  const [receiverName, setReceiverName] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [driver, setDriver] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      setError('Supabase is not configured.');
      return;
    }

    fetchLoads();

    const channel = supabase
      .channel('agent-dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loads' }, () => {
        fetchLoads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchLoads() {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data, error: fetchError } = await supabase
      .from('loads')
      .select('*')
      .order('created_at', { ascending: false });
    if (fetchError) setError(fetchError.message);
    if (data) setLoads(data as LoadRecord[]);
    setLoading(false);
  }

  async function createLoad(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }
    if (!isCompleteAddress(origin) || !isCompleteAddress(destination)) {
      setError('Origin and destination need street, city, state, and ZIP.');
      return;
    }
    if (!shipperEmail.trim() || !receiverEmail.trim()) {
      setError('Shipper and receiver emails are required for pickup and drop-off alerts.');
      return;
    }

    setSaving(true);
    setError(null);
    const trackingHash = newTrackingHash();

    const { error: insertError } = await supabase.from('loads').insert([
      {
        landstar_pro_number: proNumber.trim(),
        shipper_name: shipper.trim(),
        contact_email: shipperEmail.trim(),
        origin_street: origin.street,
        origin_city: origin.city,
        origin_state: origin.state,
        origin_zip: origin.zip,
        destination_street: destination.street,
        destination_city: destination.city,
        destination_state: destination.state,
        destination_zip: destination.zip,
        receiver_name: receiverName.trim() || null,
        receiver_email: receiverEmail.trim(),
        driver_name: driver.trim() || null,
        driver_phone: phone.trim() || null,
        driver_email: driverEmail.trim() || null,
        status: 'BOOKED',
        tracking_hash: trackingHash,
      },
    ]);

    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    setProNumber('');
    setShipper('');
    setShipperEmail('');
    setOrigin(emptyAddress);
    setDestination(emptyAddress);
    setReceiverName('');
    setReceiverEmail('');
    setDriver('');
    setDriverEmail('');
    setPhone('');
    fetchLoads();
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
          <div>
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
              Praemium Onus Logistics
            </span>
            <h1 className="text-3xl font-black mt-1">Dispatch & Command Center</h1>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-sm">
            Active Loads: <span className="text-emerald-400 font-bold">{loads.length}</span>
          </div>
        </header>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        ) : null}

        <div className="bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl">
          <h2 className="text-lg font-bold mb-4 text-slate-200">Book & Dispatch New Freight</h2>
          <form onSubmit={createLoad} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Landstar PRO #"
              value={proNumber}
              onChange={(e) => setProNumber(e.target.value)}
              required
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Shipper Name"
              value={shipper}
              onChange={(e) => setShipper(e.target.value)}
              required
              className={inputClass}
            />
            <input
              type="email"
              placeholder="Shipper email (pickup/drop-off alerts)"
              value={shipperEmail}
              onChange={(e) => setShipperEmail(e.target.value)}
              required
              className={inputClass}
            />
            <div className="md:col-span-3">
              <AddressFields legend="Origin — full address with ZIP" value={origin} onChange={setOrigin} />
            </div>
            <div className="md:col-span-3">
              <AddressFields legend="Destination — full address with ZIP" value={destination} onChange={setDestination} />
            </div>
            <input
              type="text"
              placeholder="Receiver name"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              className={inputClass}
            />
            <input
              type="email"
              placeholder="Receiver email (required for alerts)"
              value={receiverEmail}
              onChange={(e) => setReceiverEmail(e.target.value)}
              required
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Driver Name"
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              className={inputClass}
            />
            <input
              type="email"
              placeholder="Driver email (alerts)"
              value={driverEmail}
              onChange={(e) => setDriverEmail(e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Driver Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
            <button
              type="submit"
              disabled={saving}
              className="md:col-span-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-all"
            >
              {saving ? 'Booking…' : 'Generate Tracking Links & Book Load'}
            </button>
          </form>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-700/60">
            <h2 className="text-lg font-bold text-slate-200">Active Shipments</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading freight records...</div>
          ) : loads.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No loads currently booked.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">PRO #</th>
                    <th className="p-4">Shipper</th>
                    <th className="p-4">Route</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Code</th>
                    <th className="p-4">Portals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {loads.map((load) => (
                    <tr key={load.id || load.tracking_hash || load.landstar_pro_number} className="hover:bg-slate-800/40">
                      <td className="p-4 font-mono font-bold text-amber-400">{load.landstar_pro_number}</td>
                      <td className="p-4">{load.shipper_name}</td>
                      <td className="p-4">
                        {formatAddress({
                          street: load.origin_street,
                          city: load.origin_city,
                          state: load.origin_state,
                          zip: load.origin_zip,
                        })}
                        <span className="block text-slate-500">➔ {formatAddress({
                          street: load.destination_street,
                          city: load.destination_city,
                          state: load.destination_state,
                          zip: load.destination_zip,
                        })}</span>
                      </td>
                      <td className="p-4">
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-md font-semibold">
                          {load.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-400">{load.tracking_hash || '—'}</td>
                      <td className="p-4">
                        {load.tracking_hash ? (
                          <div className="flex flex-col gap-1 text-xs">
                            <a href={`/track/shipper/${load.tracking_hash}`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                              Shipper Tracking ↗
                            </a>
                            <a href={`/track/receiver/${load.tracking_hash}`} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">
                              Receiver Portal ↗
                            </a>
                            <a href={`/track/driver/${load.tracking_hash}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                              Driver App ↗
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">No tracking code</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
