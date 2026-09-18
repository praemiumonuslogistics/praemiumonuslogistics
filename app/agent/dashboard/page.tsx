'use client';

import { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default function AgentDashboard() {
  const [loads, setLoads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [proNumber, setProNumber] = useState('');
  const [shipper, setShipper] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [driver, setDriver] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    fetchLoads(supabase);

    const channel = supabase
      .channel('agent-dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loads' }, () => {
        fetchLoads(supabase);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchLoads(client?: SupabaseClient) {
    const supabase = client || getSupabase();
    if (!supabase) return;
    const { data } = await supabase.from('loads').select('*').order('created_at', { ascending: false });
    if (data) setLoads(data);
    setLoading(false);
  }

  async function createLoad(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase.from('loads').insert([
      {
        landstar_pro_number: proNumber,
        shipper_name: shipper,
        origin_city: origin,
        destination_city: destination,
        driver_name: driver,
        driver_phone: phone,
        status: 'BOOKED',
      },
    ]);

    if (!error) {
      setProNumber('');
      setShipper('');
      setOrigin('');
      setDestination('');
      setDriver('');
      setPhone('');
      fetchLoads(supabase);
    }
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

        <div className="bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl">
          <h2 className="text-lg font-bold mb-4 text-slate-200">Book & Dispatch New Freight</h2>
          <form onSubmit={createLoad} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Landstar PRO #"
              value={proNumber}
              onChange={(e) => setProNumber(e.target.value)}
              required
              className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Shipper Name"
              value={shipper}
              onChange={(e) => setShipper(e.target.value)}
              required
              className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Driver Name"
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Origin (e.g. Las Vegas, NV)"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              required
              className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Destination (e.g. Dallas, TX)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Driver Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="md:col-span-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
            >
              Generate Tracking Links & Book Load
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
                    <th className="p-4">Driver Link</th>
                    <th className="p-4">Shipper Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {loads.map((load) => (
                    <tr key={load.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-mono font-bold text-amber-400">{load.landstar_pro_number}</td>
                      <td className="p-4">{load.shipper_name}</td>
                      <td className="p-4">{load.origin_city} ➔ {load.destination_city}</td>
                      <td className="p-4">
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-md font-semibold">
                          {load.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <a
                          href={`/track/driver/${load.tracking_hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline text-xs"
                        >
                          Driver Mobile GPS ↗
                        </a>
                      </td>
                      <td className="p-4">
                        <a
                          href={`/track/shipper/${load.tracking_hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline text-xs"
                        >
                          Shipper Live View ↗
                        </a>
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
