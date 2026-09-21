'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase, trackingStarted, type LoadRecord } from '../../../lib/supabaseBrowser';
import { LoadAddress, LoadDocs, ProofChips } from '../../../components/LoadProof';
import { TrackingMap } from '../../../components/TrackingMap';

export default function ShipperTrackingPortal({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = use(params);
  const [load, setLoad] = useState<LoadRecord | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setReady(true);
      return;
    }
    const db = supabase;

    async function init() {
      const { data } = await db
        .from('loads')
        .select('*')
        .eq('tracking_hash', hash)
        .maybeSingle();
      if (data) setLoad(data as LoadRecord);
      setReady(true);
    }
    init();

    const channel = db
      .channel(`load-status-${hash}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'loads',
          filter: `tracking_hash=eq.${hash}`,
        },
        (payload) => {
          setLoad(payload.new as LoadRecord);
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, [hash]);

  if (!ready) {
    return <div className="p-8 text-center text-slate-500">Retrieving freight details...</div>;
  }

  if (!load) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-lg mx-auto space-y-4">
        <p className="text-slate-300">
          That code did not match an active load. Check the code and try again, or call (702) 744-6957.
        </p>
        <Link href="/track/shipper" className="text-amber-400 font-semibold">
          Back to Shipper Tracking
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
        <div className="bg-slate-900 text-white p-6 md:p-8 flex justify-between items-center border-b border-slate-800 gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-amber-400 uppercase">
              Praemium Onus Logistics
            </span>
            <h1 className="text-2xl font-black mt-1">PRO #{load.landstar_pro_number || '—'}</h1>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1.5 rounded-full">
            {load.status}
          </span>
        </div>

        <div className="p-6 md:p-8 space-y-4 border-b border-slate-800">
          <ProofChips load={load} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <LoadAddress
                label="Origin"
                street={load.origin_street}
                city={load.origin_city}
                state={load.origin_state}
                zip={load.origin_zip}
              />
            </div>
            <div className="border-l-4 border-emerald-500 pl-4">
              <LoadAddress
                label="Destination"
                street={load.destination_street}
                city={load.destination_city}
                state={load.destination_state}
                zip={load.destination_zip}
              />
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-slate-950 space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Live GPS</h2>
          <TrackingMap
            lat={load.current_lat}
            lng={load.current_lng}
            started={trackingStarted(load)}
            lastUpdate={load.last_location_update}
          />
          <LoadDocs load={load} />
        </div>

        <div className="p-6 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-500">
          Dispatched & Managed via Independent Landstar Agent Services
        </div>
      </div>
    </div>
  );
}
