'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '../../components/PageShell';
import { TrackingMap } from '../../components/TrackingMap';
import { getSupabase, trackingStarted, type LoadRecord } from '../../lib/supabaseBrowser';
import { dashboardPath, useAuth } from '../../lib/useAuth';
import { EQUIPMENT, TARP_OPTIONS } from '../../lib/openDeck';

const STEPS = [
  { status: 'ACCEPTED', label: 'Accepted at origin' },
  { status: 'IN_TRANSIT', label: 'Picked up / rolling' },
  { status: 'DELIVERED', label: 'Delivered' },
] as const;

export default function CarrierDashboard() {
  const router = useRouter();
  const { ready, user, profile, signOut } = useAuth();
  const [board, setBoard] = useState<LoadRecord[]>([]);
  const [mine, setMine] = useState<LoadRecord[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [deckFilter, setDeckFilter] = useState('');
  const [tarpFilter, setTarpFilter] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [specs, setSpecs] = useState({
    deck_type: 'FLATBED',
    deck_length_ft: '48',
    ramp_available: false,
    tarp_sizes: '4FT,8FT',
    strap_count: '12',
    chain_count: '8',
  });

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (profile && profile.role !== 'CARRIER') {
      router.replace(dashboardPath(profile.role));
    }
    if (profile?.role === 'CARRIER') {
      setSpecs({
        deck_type: profile.deck_type || 'FLATBED',
        deck_length_ft: String(profile.deck_length_ft || 48),
        ramp_available: Boolean(profile.ramp_available),
        tarp_sizes: profile.tarp_sizes || '4FT,8FT',
        strap_count: String(profile.strap_count || 12),
        chain_count: String(profile.chain_count || 8),
      });
    }
  }, [ready, user, profile, router]);

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    async function fetchLoads() {
      const [{ data: available, error: aErr }, { data: hauls, error: hErr }] = await Promise.all([
        supabase!.from('loads').select('*').eq('status', 'AVAILABLE').order('created_at', { ascending: false }),
        supabase!.from('loads').select('*').eq('carrier_id', user!.id).order('created_at', { ascending: false }),
      ]);
      if (aErr || hErr) setError(aErr?.message || hErr?.message || '');
      setBoard((available as LoadRecord[]) || []);
      setMine((hauls as LoadRecord[]) || []);
    }
    fetchLoads();
    const channel = supabase
      .channel('carrier-loads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loads' }, fetchLoads)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function accept(load: LoadRecord) {
    const supabase = getSupabase();
    if (!supabase || !user || !load.id) return;
    setBusy(load.id);
    const { error: upd } = await supabase
      .from('loads')
      .update({ carrier_id: user.id, status: 'ACCEPTED' })
      .eq('id', load.id)
      .eq('status', 'AVAILABLE');
    setBusy(null);
    if (upd) setError(upd.message);
  }

  async function advance(load: LoadRecord, status: string) {
    const supabase = getSupabase();
    if (!supabase || !load.id) return;
    setBusy(load.id);
    const patch: Record<string, unknown> = { status };
    if (status === 'IN_TRANSIT') patch.pickup_confirmed_at = new Date().toISOString();
    if (status === 'DELIVERED') patch.delivered_at = new Date().toISOString();
    const { error: upd } = await supabase.from('loads').update(patch).eq('id', load.id);
    setBusy(null);
    if (upd) setError(upd.message);
  }

  async function saveSpecs(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase || !user) return;
    const { error: upd } = await supabase
      .from('profiles')
      .update({
        deck_type: specs.deck_type,
        deck_length_ft: Number(specs.deck_length_ft) || null,
        ramp_available: specs.ramp_available,
        tarp_sizes: specs.tarp_sizes,
        strap_count: Number(specs.strap_count) || null,
        chain_count: Number(specs.chain_count) || null,
      })
      .eq('id', user.id);
    if (upd) setError(upd.message);
  }

  const filtered = board.filter((load) => {
    const deck = (load.equipment_1 || load.freight_type || '').toUpperCase();
    if (deckFilter && deck !== deckFilter) return false;
    if (tarpFilter && String((load as { tarp_size?: string }).tarp_size || '').toUpperCase() !== tarpFilter) return false;
    if (maxWeight && Number(load.weight || 0) > Number(maxWeight)) return false;
    return true;
  });

  if (!ready || !user || profile?.role !== 'CARRIER') {
    return <div className="min-h-screen bg-slate-950 text-slate-500 p-8">Loading load board…</div>;
  }

  return (
    <PageShell>
      <section className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">Carrier load board</p>
            <h1 className="text-3xl font-black">{profile.company_name}</h1>
          </div>
          <button onClick={signOut} className="text-sm text-slate-400 hover:text-amber-300">
            Sign out
          </button>
        </header>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <form onSubmit={saveSpecs} className="grid md:grid-cols-3 gap-3 border border-slate-800 rounded-2xl p-6">
          <h2 className="md:col-span-3 text-lg font-bold">Your open-deck specs</h2>
          <select
            className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm"
            value={specs.deck_type}
            onChange={(e) => setSpecs({ ...specs, deck_type: e.target.value })}
          >
            {EQUIPMENT.map((eq) => (
              <option key={eq.code} value={eq.code}>
                {eq.label}
              </option>
            ))}
          </select>
          <input
            className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm"
            placeholder="Deck length ft"
            value={specs.deck_length_ft}
            onChange={(e) => setSpecs({ ...specs, deck_length_ft: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={specs.ramp_available}
              onChange={(e) => setSpecs({ ...specs, ramp_available: e.target.checked })}
            />
            Ramp available
          </label>
          <input
            className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm"
            placeholder="Tarp sizes (4FT,8FT)"
            value={specs.tarp_sizes}
            onChange={(e) => setSpecs({ ...specs, tarp_sizes: e.target.value })}
          />
          <input
            className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm"
            placeholder="Strap count"
            value={specs.strap_count}
            onChange={(e) => setSpecs({ ...specs, strap_count: e.target.value })}
          />
          <input
            className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm"
            placeholder="Chain count"
            value={specs.chain_count}
            onChange={(e) => setSpecs({ ...specs, chain_count: e.target.value })}
          />
          <button className="md:col-span-3 bg-slate-800 border border-slate-700 font-bold py-2 rounded-lg">Save specs</button>
        </form>

        <div className="flex flex-wrap gap-3">
          <select
            className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm"
            value={deckFilter}
            onChange={(e) => setDeckFilter(e.target.value)}
          >
            <option value="">All deck types</option>
            {EQUIPMENT.map((eq) => (
              <option key={eq.code} value={eq.code}>
                {eq.code}
              </option>
            ))}
          </select>
          <select
            className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm"
            value={tarpFilter}
            onChange={(e) => setTarpFilter(e.target.value)}
          >
            <option value="">Any tarp</option>
            {TARP_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm"
            placeholder="Max weight lbs"
            value={maxWeight}
            onChange={(e) => setMaxWeight(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold">AVAILABLE freight</h2>
          {filtered.length === 0 ? (
            <p className="text-slate-500">No open loads. Check back with dispatch at (702) 744-6957.</p>
          ) : (
            filtered.map((load) => (
              <article key={load.id} className="border border-slate-800 rounded-2xl p-5 flex flex-wrap justify-between gap-4">
                <div>
                  <p className="font-bold">
                    {load.origin_city || load.origin_zip} → {load.destination_city || load.destination_zip}
                  </p>
                  <p className="text-sm text-slate-400">
                    {load.equipment_1 || load.freight_type} · {load.weight || '—'} lbs
                    {load.rate != null ? ` · $${load.rate}` : ''}
                  </p>
                </div>
                <button
                  disabled={busy === load.id}
                  onClick={() => accept(load)}
                  className="bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg"
                >
                  {busy === load.id ? 'Booking…' : 'Accept load'}
                </button>
              </article>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold">Active hauls</h2>
          {mine.length === 0 ? (
            <p className="text-slate-500">No accepted hauls yet.</p>
          ) : (
            mine.map((load) => (
              <article key={load.id} className="border border-slate-800 rounded-2xl p-5 space-y-4">
                <p className="font-bold">
                  {load.origin_city || load.origin_zip} → {load.destination_city || load.destination_zip} · {load.status}
                </p>
                <TrackingMap
                  lat={load.current_lat}
                  lng={load.current_lng}
                  started={trackingStarted(load)}
                  lastUpdate={load.last_location_update}
                />
                <div className="flex flex-wrap gap-2">
                  {STEPS.map((m) => (
                    <button
                      key={m.status}
                      disabled={busy === load.id}
                      onClick={() => advance(load, m.status)}
                      className="text-xs font-semibold border border-slate-700 hover:border-amber-400 rounded-lg px-3 py-2"
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </PageShell>
  );
}
