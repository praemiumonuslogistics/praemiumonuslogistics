'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageShell } from '../../components/PageShell';
import { TrackingMap } from '../../components/TrackingMap';
import { getSupabase, trackingStarted, type LoadRecord } from '../../lib/supabaseBrowser';
import { dashboardPath, useAuth } from '../../lib/useAuth';

const inputClass =
  'w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400';

export default function ShipperDashboard() {
  const router = useRouter();
  const { ready, user, profile, signOut } = useAuth();
  const [loads, setLoads] = useState<LoadRecord[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    originCity: '',
    originZip: '',
    destinationCity: '',
    destinationZip: '',
    equipment: 'VAN',
    weight: '',
    rate: '',
    pickup: '',
    delivery: '',
  });

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (profile && profile.role !== 'SHIPPER') {
      router.replace(dashboardPath(profile.role));
    }
  }, [ready, user, profile, router]);

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    async function fetchLoads() {
      const { data, error: fetchError } = await supabase!
        .from('loads')
        .select('*')
        .eq('shipper_id', user!.id)
        .order('created_at', { ascending: false });
      if (fetchError) setError(fetchError.message);
      if (data) setLoads(data as LoadRecord[]);
    }
    fetchLoads();
    const channel = supabase
      .channel('shipper-loads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loads' }, fetchLoads)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function postLoad(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase || !user || !profile) return;
    setSaving(true);
    setError('');
    const { error: insertError } = await supabase.from('loads').insert([
      {
        shipper_id: user.id,
        shipper_name: profile.company_name,
        origin_city: form.originCity.trim(),
        origin_zip: form.originZip.trim(),
        origin_country: 'US',
        destination_city: form.destinationCity.trim(),
        destination_zip: form.destinationZip.trim(),
        destination_country: 'US',
        pickup_date_from: form.pickup || null,
        pickup_date_thru: form.pickup || null,
        delivery_date_from: form.delivery || null,
        delivery_date_thru: form.delivery || null,
        equipment_1: form.equipment.trim().toUpperCase(),
        freight_type: form.equipment.trim().toUpperCase(),
        weight: form.weight.trim(),
        rate_type: 'F',
        rate: Number(form.rate) || 0,
        status: 'AVAILABLE',
        source: 'shipper_portal',
        yard_line: 0,
        contact_email: user.email,
        contact_phone: profile.phone_number,
      },
    ]);
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setForm({
      originCity: '',
      originZip: '',
      destinationCity: '',
      destinationZip: '',
      equipment: 'VAN',
      weight: '',
      rate: '',
      pickup: '',
      delivery: '',
    });
  }

  async function onCsv(file: File) {
    const supabase = getSupabase();
    if (!supabase || !user || !profile) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      setError('CSV needs a header row and at least one load.');
      return;
    }
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const idx = (name: string) => headers.findIndex((h) => h.includes(name));
    const rows = [];
    for (const line of lines.slice(1)) {
      const cols = line.split(',');
      const originZip = cols[idx('origin zip')] || cols[idx('origin_zip')] || '';
      const destZip = cols[idx('destination zip')] || cols[idx('dest')] || '';
      if (!originZip || !destZip) continue;
      rows.push({
        shipper_id: user.id,
        shipper_name: profile.company_name,
        customer_id: cols[idx('customer')] || profile.company_name,
        origin_city: cols[idx('origin city')] || null,
        origin_zip: originZip.trim(),
        origin_country: 'US',
        destination_city: cols[idx('destination city')] || null,
        destination_zip: destZip.trim(),
        destination_country: 'US',
        pickup_date_from: cols[idx('pickup')] || null,
        equipment_1: (cols[idx('equipment')] || 'VAN').trim().toUpperCase(),
        freight_type: (cols[idx('equipment')] || 'VAN').trim().toUpperCase(),
        weight: cols[idx('weight')] || null,
        rate_type: (cols[idx('rate type')] || 'F').trim().toUpperCase(),
        rate: Number(cols[idx('rate')] || 0),
        status: 'AVAILABLE',
        source: 'shipper_csv',
        yard_line: 0,
        contact_email: user.email,
      });
    }
    if (!rows.length) {
      setError('No valid CSV rows. Need origin and destination ZIP.');
      return;
    }
    const { error: insertError } = await supabase.from('loads').insert(rows);
    if (insertError) setError(insertError.message);
  }

  if (!ready || !user || profile?.role !== 'SHIPPER') {
    return <div className="min-h-screen bg-slate-950 text-slate-500 p-8">Loading command center…</div>;
  }

  return (
    <PageShell>
      <section className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">Shipper command center</p>
            <h1 className="text-3xl font-black">{profile.company_name}</h1>
          </div>
          <button onClick={signOut} className="text-sm text-slate-400 hover:text-amber-300">
            Sign out
          </button>
        </header>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <form onSubmit={postLoad} className="grid md:grid-cols-3 gap-3 border border-slate-800 rounded-2xl p-6 bg-slate-900/40">
          <h2 className="md:col-span-3 text-lg font-bold">Post a load</h2>
          <input className={inputClass} required placeholder="Origin city" value={form.originCity} onChange={(e) => setForm({ ...form, originCity: e.target.value })} />
          <input className={inputClass} required placeholder="Origin ZIP" value={form.originZip} onChange={(e) => setForm({ ...form, originZip: e.target.value })} />
          <input className={inputClass} required placeholder="Equipment (VAN, FLAT, REFR)" value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} />
          <input className={inputClass} required placeholder="Destination city" value={form.destinationCity} onChange={(e) => setForm({ ...form, destinationCity: e.target.value })} />
          <input className={inputClass} required placeholder="Destination ZIP" value={form.destinationZip} onChange={(e) => setForm({ ...form, destinationZip: e.target.value })} />
          <input className={inputClass} required placeholder="Weight lbs" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          <input className={inputClass} type="date" required value={form.pickup} onChange={(e) => setForm({ ...form, pickup: e.target.value })} />
          <input className={inputClass} type="date" value={form.delivery} onChange={(e) => setForm({ ...form, delivery: e.target.value })} />
          <input className={inputClass} required placeholder="Rate (flat)" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
          <button disabled={saving} className="md:col-span-3 bg-amber-400 text-slate-950 font-bold py-3 rounded-lg">
            {saving ? 'Posting…' : 'Post as AVAILABLE'}
          </button>
        </form>

        <div className="border border-slate-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold">CSV bulk upload</h2>
          <p className="text-sm text-slate-400">
            Headers should include origin zip, destination zip, equipment, weight, rate. Full Landstar workbooks still go through the agent bulk skill.
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onCsv(file);
            }}
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-bold">Active inventory</h2>
          {loads.length === 0 ? (
            <p className="text-slate-500">No loads posted yet.</p>
          ) : (
            loads.map((load) => (
              <article key={load.id} className="border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-bold">
                      {load.origin_city || load.origin_zip} → {load.destination_city || load.destination_zip}
                    </p>
                    <p className="text-sm text-slate-400">
                      {load.equipment_1 || load.freight_type} · {load.weight || '—'} lbs · {load.status}
                    </p>
                  </div>
                  {load.tracking_hash ? (
                    <Link href={`/track/shipper/${load.tracking_hash}`} className="text-amber-400 text-sm font-semibold">
                      Open tracking
                    </Link>
                  ) : null}
                </div>
                <TrackingMap
                  lat={load.current_lat}
                  lng={load.current_lng}
                  started={trackingStarted(load)}
                  lastUpdate={load.last_location_update}
                />
              </article>
            ))
          )}
        </div>
      </section>
    </PageShell>
  );
}
