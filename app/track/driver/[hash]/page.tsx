'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase, type LoadRecord } from '../../../lib/supabaseBrowser';
import { ProofChips } from '../../../components/LoadProof';

function storageKey(hash: string) {
  return hash.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
}

export default function DriverGPSPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = use(params);
  const [tracking, setTracking] = useState(false);
  const [load, setLoad] = useState<LoadRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [lastPing, setLastPing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<'bol' | 'pod' | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setReady(true);
      return;
    }
    const db = supabase;

    async function fetchLoad() {
      const { data } = await db
        .from('loads')
        .select('*')
        .eq('tracking_hash', hash)
        .maybeSingle();
      if (data) setLoad(data as LoadRecord);
      setReady(true);
    }
    fetchLoad();
  }, [hash]);

  const startTracking = () => {
    const supabase = getSupabase();
    if (!supabase) {
      setError('Tracking service is not configured.');
      return;
    }
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your mobile browser.');
      return;
    }

    setTracking(true);

    navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const now = new Date().toLocaleTimeString();

        const { error: updateError } = await supabase
          .from('loads')
          .update({
            current_lat: latitude,
            current_lng: longitude,
            status: 'IN_TRANSIT',
            last_location_update: new Date().toISOString(),
          })
          .eq('tracking_hash', hash);

        if (!updateError) {
          setLastPing(`${latitude.toFixed(4)}, ${longitude.toFixed(4)} at ${now}`);
          setLoad((prev) =>
            prev
              ? {
                  ...prev,
                  current_lat: latitude,
                  current_lng: longitude,
                  status: 'IN_TRANSIT',
                  last_location_update: new Date().toISOString(),
                }
              : prev
          );
        }
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
    );
  };

  async function uploadDoc(kind: 'bol' | 'pod', file: File) {
    const supabase = getSupabase();
    const key = storageKey(hash);
    if (!supabase || !key) {
      setError('Cannot upload without a valid tracking code.');
      return;
    }

    setUploading(kind);
    setError(null);
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `${key}/${kind}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('load-docs')
      .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' });

    if (uploadError) {
      setUploading(null);
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from('load-docs').getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    const stamp = new Date().toISOString();
    const patch =
      kind === 'bol'
        ? { bol_url: url, bol_uploaded_at: stamp }
        : { pod_url: url, pod_uploaded_at: stamp };

    const { error: rowError } = await supabase.from('loads').update(patch).eq('tracking_hash', hash);
    setUploading(null);
    if (rowError) {
      setError(rowError.message);
      return;
    }
    setLoad((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  if (!ready) return <div className="p-6 text-center text-slate-400">Loading shipment data...</div>;

  if (!load) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 max-w-md mx-auto space-y-4">
        <p>Code not recognized. Confirm the code with dispatch before you roll.</p>
        <Link href="/track/driver" className="text-amber-400 font-semibold">
          Back to Driver App
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 max-w-md mx-auto flex flex-col gap-6 font-sans">
      <header className="border-b border-slate-800 pb-4 space-y-3">
        <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-2.5 py-1 rounded border border-amber-500/20">
          PRAEMIUM ONUS DISPATCH
        </span>
        <h1 className="text-xl font-bold">Load #{load.landstar_pro_number || '—'}</h1>
        <p className="text-slate-400 text-sm">
          {load.origin_city} ➔ {load.destination_city}
        </p>
        <ProofChips load={load} />
      </header>

      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <p className="text-sm text-slate-400">Driver Assigned</p>
        <p className="font-semibold text-lg">{load.driver_name || 'Unassigned'}</p>
        <p className="text-xs text-slate-500 mt-1">
          Status: <span className="text-emerald-400 font-bold">{load.status}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {lastPing && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg text-sm text-center">
          <p className="font-semibold">GPS Active & Broadcasted</p>
          <p className="text-xs text-slate-300 mt-1">Last Coordinates: {lastPing}</p>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Document scanner</h2>
        <ScanButton
          label="Origin BOL"
          kind="bol"
          onFile={(file) => uploadDoc('bol', file)}
          busy={uploading === 'bol'}
          done={Boolean(load.bol_url)}
        />
        <ScanButton
          label="Destination POD"
          kind="pod"
          onFile={(file) => uploadDoc('pod', file)}
          busy={uploading === 'pod'}
          done={Boolean(load.pod_url)}
        />
      </div>

      <button
        onClick={startTracking}
        disabled={tracking}
        className={`w-full py-4 text-lg font-bold rounded-xl transition-all shadow-lg mt-auto ${
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

function ScanButton({
  label,
  kind,
  onFile,
  busy,
  done,
}: {
  label: string;
  kind: 'bol' | 'pod';
  onFile: (file: File) => void;
  busy: boolean;
  done: boolean;
}) {
  const id = `scan-${kind}`;
  return (
    <label
      htmlFor={id}
      className="flex items-center justify-between w-full border border-slate-700 rounded-xl px-4 py-4 bg-slate-800 cursor-pointer"
    >
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="block text-xs text-slate-400">
          {busy ? 'Uploading…' : done ? 'On file — tap to replace' : 'Photograph and upload'}
        </span>
      </span>
      <span className={`text-xs font-bold ${done ? 'text-emerald-400' : 'text-amber-400'}`}>
        {done ? 'On file' : 'Scan'}
      </span>
      <input
        id={id}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
    </label>
  );
}
