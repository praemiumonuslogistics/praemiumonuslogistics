'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '../../components/PageShell';
import { FootballField } from '../../components/FootballField';
import { getSupabase, type LoadRecord } from '../../lib/supabaseBrowser';
import { dashboardPath, useAuth } from '../../lib/useAuth';
import { MILESTONES } from '../../lib/yardLine';

export default function CarrierDashboard() {
  const router = useRouter();
  const { ready, user, profile, signOut } = useAuth();
  const [board, setBoard] = useState<LoadRecord[]>([]);
  const [mine, setMine] = useState<LoadRecord[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (profile && profile.role !== 'CARRIER') {
      router.replace(dashboardPath(profile.role));
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
      .update({ carrier_id: user.id, status: 'ACCEPTED', yard_line: 0 })
      .eq('id', load.id)
      .eq('status', 'AVAILABLE');
    setBusy(null);
    if (upd) setError(upd.message);
  }

  async function advance(load: LoadRecord, yards: number, status: string) {
    const supabase = getSupabase();
    if (!supabase || !load.id) return;
    setBusy(load.id);
    const patch: Record<string, unknown> = { yard_line: yards, status };
    if (yards >= 25) patch.pickup_confirmed_at = new Date().toISOString();
    if (yards >= 100) patch.delivered_at = new Date().toISOString();
    const { error: upd } = await supabase.from('loads').update(patch).eq('id', load.id);
    setBusy(null);
    if (upd) setError(upd.message);
  }

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

        <div className="space-y-4">
          <h2 className="text-lg font-bold">AVAILABLE freight</h2>
          {board.length === 0 ? (
            <p className="text-slate-500">No open loads. Check back with dispatch at (702) 744-6957.</p>
          ) : (
            board.map((load) => (
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
                <FootballField load={load} />
                <div className="flex flex-wrap gap-2">
                  {MILESTONES.map((m) => (
                    <button
                      key={m.yards}
                      disabled={busy === load.id}
                      onClick={() => advance(load, m.yards, m.status)}
                      className="text-xs font-semibold border border-slate-700 hover:border-amber-400 rounded-lg px-3 py-2"
                    >
                      {m.yards} · {m.label}
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
