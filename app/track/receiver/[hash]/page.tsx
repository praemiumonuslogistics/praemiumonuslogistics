'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase, type LoadRecord } from '../../../lib/supabaseBrowser';
import { LoadDocs, ProofChips } from '../../../components/LoadProof';

export default function ReceiverPortal({
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
      .channel(`receiver-${hash}`)
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
    return <div className="p-8 text-center text-slate-500">Retrieving inbound freight...</div>;
  }

  if (!load) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-lg mx-auto space-y-4">
        <p className="text-slate-300">
          No load found for that code. Confirm the code and try again, or call (702) 744-6957.
        </p>
        <Link href="/track/receiver" className="text-amber-400 font-semibold">
          Back to Receiver Portal
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-800 space-y-3">
          <span className="text-xs font-bold tracking-wider text-amber-400 uppercase">
            Receiver Portal
          </span>
          <h1 className="text-2xl font-black">Inbound PRO #{load.landstar_pro_number || '—'}</h1>
          <ProofChips load={load} />
        </div>

        <div className="p-6 md:p-8 grid gap-6 md:grid-cols-2 border-b border-slate-800">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Coming from</p>
            <p className="text-lg font-bold">{load.origin_city}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Your dock</p>
            <p className="text-lg font-bold">{load.destination_city}</p>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-slate-950 space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Live location</h2>
          <p className="font-mono text-amber-400">
            {load.current_lat && load.current_lng
              ? `${load.current_lat}, ${load.current_lng}`
              : 'Awaiting GPS'}
          </p>
          <p className="text-xs text-slate-500">
            Last ping:{' '}
            {load.last_location_update
              ? new Date(load.last_location_update).toLocaleString()
              : 'N/A'}
          </p>
          <LoadDocs load={load} />
        </div>
      </div>
    </div>
  );
}
