'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QuoteForm } from './QuoteForm';
import { LiveFleetMap } from './LiveFleetMap';
import { TrackingMap } from './TrackingMap';
import { getSupabase, trackingStarted, type LoadRecord } from '../lib/supabaseBrowser';
import { parseBulkCsv } from '../lib/bulkCsv';
import { useAuth } from '../lib/useAuth';

export function ShipperLanding() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [action, setAction] = useState<'quote' | 'csv'>('quote');
  const [error, setError] = useState('');
  const [lookup, setLookup] = useState<LoadRecord | null>(null);
  const [stats, setStats] = useState({ moving: 0, booked: 0, quotes: 0, delivered: 0 });
  const [authOpen, setAuthOpen] = useState(false);
  const [csvNotice, setCsvNotice] = useState('');
  const { ready, user, profile } = useAuth();
  const canUpload = ready && Boolean(user) && profile?.role === 'SHIPPER';

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase
      .from('loads')
      .select('status')
      .then(({ data }) => {
        const rows = data || [];
        setStats({
          moving: rows.filter((r) => r.status === 'IN_TRANSIT').length,
          booked: rows.filter((r) => r.status === 'BOOKED' || r.status === 'ACCEPTED').length,
          quotes: rows.filter((r) => r.status === 'QUOTE_REQUESTED').length,
          delivered: rows.filter((r) => r.status === 'DELIVERED').length,
        });
      });
  }, []);

  async function track(e: React.FormEvent) {
    e.preventDefault();
    const q = code.trim().replace(/[^a-zA-Z0-9._-]/g, '');
    if (!q) return;
    setError('');
    const supabase = getSupabase();
    if (!supabase) {
      router.push(`/track/shipper/${encodeURIComponent(q)}`);
      return;
    }
    const { data } = await supabase
      .from('loads')
      .select('*')
      .or(`tracking_hash.eq.${q},landstar_pro_number.eq.${q}`)
      .maybeSingle();
    if (!data) {
      setLookup(null);
      setError('No load matched that tracking code or PRO number.');
      return;
    }
    setLookup(data as LoadRecord);
  }

  async function handleCsv(file: File) {
    if (!canUpload) {
      setAuthOpen(true);
      return;
    }
    const supabase = getSupabase();
    if (!supabase || !user || !profile) {
      setAuthOpen(true);
      return;
    }
    const rows = parseBulkCsv(await file.text()).map((row) => ({
      ...row,
      shipper_id: user.id,
      shipper_name: profile.company_name,
      customer_id: row.customer_id || profile.company_name,
      status: 'AVAILABLE',
      source: 'shipper_csv',
      contact_email: user.email,
    }));
    if (!rows.length) {
      setCsvNotice('No valid rows. Origin ZIP and destination ZIP are required.');
      return;
    }
    const { error: insertError } = await supabase.from('loads').insert(rows);
    setCsvNotice(insertError ? insertError.message : `Posted ${rows.length} load${rows.length === 1 ? '' : 's'}.`);
  }

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">Shipper visibility</p>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
          Real-time GPS freight intelligence. Total lane visibility.
        </h1>
        <p className="text-lg text-slate-400 max-w-3xl">
          No manual check-calls. Unfiltered satellite tracking, automated status triggers, and instant digital BOL/POD
          capture.
        </p>
        <form onSubmit={track} className="flex flex-col sm:flex-row gap-2 max-w-2xl">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Tracking code or Landstar PRO #"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
          />
          <button className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm">
            Track load
          </button>
        </form>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {lookup ? (
          <div className="border border-slate-800 rounded-2xl p-4 space-y-3 bg-slate-900/50">
            <div className="flex justify-between gap-3 text-sm">
              <span className="font-bold">
                {lookup.origin_city || lookup.origin_zip} → {lookup.destination_city || lookup.destination_zip}
              </span>
              <span className="text-amber-400">{lookup.status}</span>
            </div>
            <TrackingMap
              lat={lookup.current_lat}
              lng={lookup.current_lng}
              started={trackingStarted(lookup)}
              lastUpdate={lookup.last_location_update}
            />
            {lookup.tracking_hash ? (
              <Link href={`/track/shipper/${lookup.tracking_hash}`} className="text-sm text-amber-400 font-semibold">
                Open full tracking
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="grid sm:grid-cols-4 gap-3">
        <Stat label="Loads in motion" value={String(stats.moving)} />
        <Stat label="Booked / accepted" value={String(stats.booked)} />
        <Stat label="Quote requests open" value={String(stats.quotes)} />
        <Stat label="Delivered on board" value={String(stats.delivered)} />
      </section>
      <p className="text-xs text-slate-500">
        Counts are this agency’s live board. On-time percentage is not published until we have a measured close-out sample.
      </p>

      <LiveFleetMap />

      <section className="border border-slate-800 rounded-2xl p-6 bg-slate-900/40 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAction('quote')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
              action === 'quote' ? 'border-amber-400 text-amber-300' : 'border-slate-800 text-slate-400'
            }`}
          >
            Instant quote
          </button>
          <button
            type="button"
            onClick={() => setAction('csv')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
              action === 'csv' ? 'border-amber-400 text-amber-300' : 'border-slate-800 text-slate-400'
            }`}
          >
            CSV bulk upload
          </button>
        </div>
        {action === 'quote' ? (
          <QuoteForm variant="compact" />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Please sign in or create a shipper account to upload bulk loads. Uploaded loads must be attached to an
              authenticated account so you can manage them in your dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/praemiumonuslogistics-bulk-template.csv"
                download
                className="border border-slate-700 hover:border-amber-400 px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Download bulk load template (.csv)
              </a>
              <a
                href="/praemiumonuslogisticsbulklistings.xlsx"
                download
                className="border border-slate-700 hover:border-amber-400 px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Download Landstar workbook (.xlsx)
              </a>
            </div>
            <label
              className="block border border-dashed border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-amber-400"
              onClick={(e) => {
                if (!canUpload) {
                  e.preventDefault();
                  setAuthOpen(true);
                }
              }}
            >
              <p className="font-semibold">Drop a completed CSV here, or click to choose a file.</p>
              <p className="text-sm text-slate-400 mt-2">Anonymous uploads are blocked.</p>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                disabled={!canUpload}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCsv(file);
                }}
              />
            </label>
            {csvNotice ? <p className="text-sm text-amber-300">{csvNotice}</p> : null}
          </div>
        )}
      </section>

      {authOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-black">Sign in required</h3>
            <p className="text-sm text-slate-300">
              Please sign in or create a shipper account to upload bulk loads. Uploaded loads must be attached to an
              authenticated account so you can manage them in your dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg">
                Sign in
              </Link>
              <Link href="/signup" className="border border-slate-700 px-4 py-2 rounded-lg font-semibold">
                Create shipper account
              </Link>
              <button type="button" onClick={() => setAuthOpen(false)} className="text-sm text-slate-400">
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-800 rounded-2xl p-5 bg-slate-900/40">
      <div className="text-3xl font-black text-amber-400">{value}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
    </div>
  );
}
