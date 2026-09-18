'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ShipperTrackingPortal({ params }: { params: { hash: string } }) {
  const [load, setLoad] = useState<any>(null);

  useEffect(() => {
    async function init() {
      const { data } = await supabase
        .from('loads')
        .select('*')
        .eq('tracking_hash', params.hash)
        .single();
      if (data) setLoad(data);
    }
    init();

    const channel = supabase
      .channel(`load-status-${params.hash}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'loads',
          filter: `tracking_hash=eq.${params.hash}`,
        },
        (payload) => {
          setLoad(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.hash]);

  if (!load) return <div className="p-8 text-center text-slate-500">Retrieving freight details...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
        <div className="bg-slate-900 text-white p-6 md:p-8 flex justify-between items-center border-b border-slate-800">
          <div>
            <span className="text-xs font-bold tracking-wider text-amber-400 uppercase">
              Praemium Onus Logistics
            </span>
            <h1 className="text-2xl font-black mt-1">PRO #{load.landstar_pro_number}</h1>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1.5 rounded-full">
            {load.status}
          </span>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-800">
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-xs font-semibold text-slate-400 uppercase">Origin</p>
            <p className="text-lg font-bold text-white">{load.origin_city}</p>
          </div>
          <div className="border-l-4 border-emerald-500 pl-4">
            <p className="text-xs font-semibold text-slate-400 uppercase">Destination</p>
            <p className="text-lg font-bold text-white">{load.destination_city}</p>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-slate-950">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
            Real-Time Telemetry
          </h2>
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400">Current GPS Coordinates</p>
              <p className="text-base font-mono font-semibold text-amber-400 mt-0.5">
                {load.current_lat && load.current_lng
                  ? `${load.current_lat}, ${load.current_lng}`
                  : 'Awaiting Driver Signal'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Last Telemetry Ping</p>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">
                {load.last_location_update
                  ? new Date(load.last_location_update).toLocaleTimeString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-500">
          Dispatched & Managed via Independent Landstar Agent Services
        </div>
      </div>
    </div>
  );
}
