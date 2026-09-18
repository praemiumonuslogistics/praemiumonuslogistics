'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DriverGPSPage({ params }: { params: { hash: string } }) {
  const [tracking, setTracking] = useState(false);
  const [load, setLoad] = useState<any>(null);
  const [lastPing, setLastPing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLoad() {
      const { data } = await supabase
        .from('loads')
        .select('*')
        .eq('tracking_hash', params.hash)
        .single();
      if (data) setLoad(data);
    }
    fetchLoad();
  }, [params.hash]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your mobile browser.');
      return;
    }

    setTracking(true);

    navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const now = new Date().toLocaleTimeString();

        const { error } = await supabase
          .from('loads')
          .update({
            current_lat: latitude,
            current_lng: longitude,
            status: 'IN_TRANSIT',
            last_location_update: new Date().toISOString()
          })
          .eq('tracking_hash', params.hash);

        if (!error) {
          setLastPing(`${latitude.toFixed(4)}, ${longitude.toFixed(4)} at ${now}`);
        }
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
    );
  };

  if (!load) return <div className="p-6 text-center text-slate-400">Loading shipment data...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 max-w-md mx-auto flex flex-col justify-between font-sans">
      <div>
        <header className="border-b border-slate-800 pb-4 mb-6">
          <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-2.5 py-1 rounded border border-amber-500/20">
            PRAEMIUM ONUS DISPATCH
          </span>
          <h1 className="text-xl font-bold mt-2">Load #{load.landstar_pro_number}</h1>
          <p className="text-slate-400 text-sm">{load.origin_city} ➔ {load.destination_city}</p>
        </header>

        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 mb-6">
          <p className="text-sm text-slate-400">Driver Assigned</p>
          <p className="font-semibold text-lg">{load.driver_name || 'Unassigned'}</p>
          <p className="text-xs text-slate-500 mt-1">Status: <span className="text-emerald-400 font-bold">{load.status}</span></p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {lastPing && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg text-sm mb-4 text-center">
            <p className="font-semibold">GPS Active & Broadcasted</p>
            <p className="text-xs text-slate-300 mt-1">Last Coordinates: {lastPing}</p>
          </div>
        )}
      </div>

      <button
        onClick={startTracking}
        disabled={tracking}
        className={`w-full py-4 text-lg font-bold rounded-xl transition-all shadow-lg ${
          tracking
            ? 'bg-emerald-600 text-white cursor-default'
            : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white'
        }`}
      >
        {tracking ? '● Live Location Transmitting' : 'Start GPS Location Broadcast'}
      </button>
    </div>
  );
}
