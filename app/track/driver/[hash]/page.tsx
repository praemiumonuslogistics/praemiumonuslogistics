'use client';

import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { formatAddress } from '../../../lib/address';
import { getSupabase, trackingStarted, type LoadRecord } from '../../../lib/supabaseBrowser';
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
  const [uploading, setUploading] = useState<string | null>(null);
  const [notifying, setNotifying] = useState(false);
  const watchRef = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, []);

  function startGps() {
    const supabase = getSupabase();
    if (!supabase) {
      setError('Tracking service is not configured.');
      return;
    }
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your mobile browser.');
      return;
    }
    if (tracking) return;
    setTracking(true);

    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const now = new Date().toLocaleTimeString();
        const { error: updateError } = await supabase
          .from('loads')
          .update({
            current_lat: latitude,
            current_lng: longitude,
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
                  last_location_update: new Date().toISOString(),
                }
              : prev
          );
        }
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
    );
  }

  async function notify(event: 'pickup' | 'delivery') {
    setNotifying(true);
    try {
      await fetch('/api/load-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash, event }),
      });
    } catch {
      setError('Load updated. Email alert could not send — dispatch will follow up.');
    } finally {
      setNotifying(false);
    }
  }

  async function uploadFile(kind: 'bol' | 'pod' | 'pickup', file: File) {
    const supabase = getSupabase();
    const key = storageKey(hash);
    if (!supabase || !key) {
      setError('Cannot upload without a valid tracking code.');
      return;
    }

    setUploading(kind);
    setError(null);
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path =
      kind === 'pickup' ? `${key}/pickup/${Date.now()}.${ext}` : `${key}/${kind}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('load-docs')
      .upload(path, file, { upsert: kind !== 'pickup', contentType: file.type || 'image/jpeg' });

    if (uploadError) {
      setUploading(null);
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from('load-docs').getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    const stamp = new Date().toISOString();
    let patch: Partial<LoadRecord>;
    if (kind === 'bol') patch = { bol_url: url, bol_uploaded_at: stamp };
    else if (kind === 'pod') patch = { pod_url: url, pod_uploaded_at: stamp };
    else patch = { pickup_photo_urls: [...(load?.pickup_photo_urls || []), url] };

    const { error: rowError } = await supabase.from('loads').update(patch).eq('tracking_hash', hash);
    setUploading(null);
    if (rowError) {
      setError(rowError.message);
      return;
    }
    setLoad((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  async function confirmPickup() {
    const supabase = getSupabase();
    if (!supabase || !load) return;
    if (!(load.pickup_photo_urls || []).length || !load.bol_url) {
      setError('Photograph the load and the BOL at pickup before you confirm.');
      return;
    }
    const stamp = new Date().toISOString();
    const { error: rowError } = await supabase
      .from('loads')
      .update({ pickup_confirmed_at: stamp, status: 'IN_TRANSIT' })
      .eq('tracking_hash', hash);
    if (rowError) {
      setError(rowError.message);
      return;
    }
    setLoad((prev) => (prev ? { ...prev, pickup_confirmed_at: stamp, status: 'IN_TRANSIT' } : prev));
    startGps();
    await notify('pickup');
  }

  async function confirmDelivery() {
    const supabase = getSupabase();
    if (!supabase || !load) return;
    if (!load.pod_url) {
      setError('Photograph and upload the POD before you confirm drop-off.');
      return;
    }
    const stamp = new Date().toISOString();
    const { error: rowError } = await supabase
      .from('loads')
      .update({ delivered_at: stamp, status: 'DELIVERED' })
      .eq('tracking_hash', hash);
    if (rowError) {
      setError(rowError.message);
      return;
    }
    setLoad((prev) => (prev ? { ...prev, delivered_at: stamp, status: 'DELIVERED' } : prev));
    await notify('delivery');
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

  const origin = formatAddress({
    street: load.origin_street,
    city: load.origin_city,
    state: load.origin_state,
    zip: load.origin_zip,
  });
  const destination = formatAddress({
    street: load.destination_street,
    city: load.destination_city,
    state: load.destination_state,
    zip: load.destination_zip,
  });
  const photoCount = load.pickup_photo_urls?.length || 0;
  const pickedUp = Boolean(load.pickup_confirmed_at) || trackingStarted(load);
  const delivered = Boolean(load.delivered_at) || load.status === 'DELIVERED';

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 max-w-md mx-auto flex flex-col gap-6 font-sans">
      <header className="border-b border-slate-800 pb-4 space-y-3">
        <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-2.5 py-1 rounded border border-amber-500/20">
          PRAEMIUM ONUS DISPATCH
        </span>
        <h1 className="text-xl font-bold">Load #{load.landstar_pro_number || '—'}</h1>
        <p className="text-slate-400 text-sm">{origin}</p>
        <p className="text-slate-400 text-sm">➔ {destination}</p>
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
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">{error}</div>
      )}

      {lastPing && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg text-sm text-center">
          <p className="font-semibold">GPS Active & Broadcasted</p>
          <p className="text-xs text-slate-300 mt-1">Last Coordinates: {lastPing}</p>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">At pickup</h2>
        <ScanButton
          id="scan-pickup"
          label="Photograph the load"
          hint={photoCount ? `${photoCount} on file — tap to add another` : 'Take photos of the freight on the truck'}
          busy={uploading === 'pickup'}
          done={photoCount > 0}
          onFile={(file) => uploadFile('pickup', file)}
        />
        <ScanButton
          id="scan-bol"
          label="Origin BOL"
          hint={load.bol_url ? 'On file — tap to replace' : 'Photograph the bill of lading'}
          busy={uploading === 'bol'}
          done={Boolean(load.bol_url)}
          onFile={(file) => uploadFile('bol', file)}
        />
        <button
          onClick={confirmPickup}
          disabled={pickedUp || notifying}
          className={`w-full py-4 text-base font-bold rounded-xl ${
            pickedUp ? 'bg-emerald-600 cursor-default' : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
          }`}
        >
          {pickedUp ? 'Pickup confirmed · tracking live' : notifying ? 'Sending pickup emails…' : 'Confirm pickup & start tracking'}
        </button>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">At drop-off</h2>
        <ScanButton
          id="scan-pod"
          label="Destination POD"
          hint={load.pod_url ? 'On file — tap to replace' : 'Photograph proof of delivery'}
          busy={uploading === 'pod'}
          done={Boolean(load.pod_url)}
          onFile={(file) => uploadFile('pod', file)}
        />
        <button
          onClick={confirmDelivery}
          disabled={!pickedUp || delivered || notifying}
          className={`w-full py-4 text-base font-bold rounded-xl ${
            delivered
              ? 'bg-emerald-600 cursor-default'
              : 'bg-blue-600 hover:bg-blue-500 disabled:opacity-40'
          }`}
        >
          {delivered ? 'Drop-off confirmed' : notifying ? 'Sending delivery emails…' : 'Confirm drop-off'}
        </button>
      </div>
    </div>
  );
}

function ScanButton({
  id,
  label,
  hint,
  onFile,
  busy,
  done,
}: {
  id: string;
  label: string;
  hint: string;
  onFile: (file: File) => void;
  busy: boolean;
  done: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-center justify-between w-full border border-slate-700 rounded-xl px-4 py-4 bg-slate-800 cursor-pointer"
    >
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="block text-xs text-slate-400">{busy ? 'Uploading…' : hint}</span>
      </span>
      <span className={`text-xs font-bold ${done ? 'text-emerald-400' : 'text-amber-400'}`}>
        {done ? 'On file' : 'Camera'}
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
