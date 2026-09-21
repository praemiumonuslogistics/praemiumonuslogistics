import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '../components/PageShell';
import { FootballField } from '../components/FootballField';

export const metadata: Metadata = {
  title: 'Freight for Shippers | Praemium Onus',
  description:
    'Praemium Onus Logistics for shippers: fewer missed pickups, clear rates, and named-contact updates from quote to delivery.',
};

export default function ShippersPage() {
  return (
    <PageShell>
      <section className="max-w-3xl mx-auto px-4 md:px-8 py-16 space-y-10">
        <div className="space-y-4">
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">Shipper coverage</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Instant freight coverage. Real-time touchdown tracking.</h1>
          <p className="text-lg text-slate-400">
            Shippers come to us after missed pickups, opaque rates, and days without a useful update. We run the opposite process — quote, match, execute, and show the field.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-3 rounded-lg">
              Create shipper account
            </Link>
            <Link href="/quote" className="border border-slate-700 hover:border-amber-400 px-5 py-3 rounded-lg font-semibold">
              Request a quote
            </Link>
          </div>
        </div>

        <div className="border border-slate-800 rounded-2xl bg-slate-900/40 p-6 space-y-3">
          <h2 className="text-xl font-bold">Live football-field demo</h2>
          <p className="text-sm text-slate-400">Origin to destination as a 100-yard drive. Your loads use the same view after pickup.</p>
          <FootballField demo />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">What we refuse to be.</h2>
          <ul className="space-y-3 text-slate-300">
            <li>
              <strong className="text-white">Missed pickups</strong> — A tender that never becomes a truck. A driver who does not appear. A dock that waited for nothing.
            </li>
            <li>
              <strong className="text-white">Opaque rates</strong> — A number with no equipment, no assumptions, and no one who can explain it.
            </li>
            <li>
              <strong className="text-white">No updates</strong> — Freight in motion, inbox silent, warehouse guessing. That is not control. It is hope.
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">The Praemium Onus process.</h2>
          <p className="text-slate-400">Simple on purpose. Strict on follow-through.</p>
          <ol className="space-y-3 text-slate-300 list-decimal pl-5">
            <li>
              <strong className="text-white">Scope</strong> — You send origin, destination, equipment, weight, date, and constraints. We do not quote a fantasy version of the load.
            </li>
            <li>
              <strong className="text-white">Match</strong> — We select top-tier capacity for this freight. You receive a clear rate and a clear plan.
            </li>
            <li>
              <strong className="text-white">Execute</strong> — We confirm the truck, the window, and the site rules. Pickup is tracked. Exceptions are named. Delivery is confirmed.
            </li>
            <li>
              <strong className="text-white">Close</strong> — Proof of delivery. Open items resolved. The same desk that quoted you still owns the file.
            </li>
          </ol>
        </div>

        <div className="space-y-5 border border-slate-800 rounded-2xl bg-slate-900/50 p-6 md:p-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">Named duty. Proof on file.</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">Zero Pride, Pure Proof</h2>
          <p className="text-slate-300">
            Pride is the check-call. Proof is the stream. Praemium Onus Logistics, an independent Landstar freight
            agent in Las Vegas, holds every driver to one standard: location and documents in the open.
          </p>
          <p className="text-slate-400">
            You do not wait on a dispatcher to get an update. Agent Darrell L. Garner’s duty is to put the load in
            front of you—unfiltered, around the clock. Authority belongs to Landstar Ranger, Inc., Jacksonville, FL,
            MC-166960 · USDOT 241572. This agency does not own that office or that MC.
          </p>
          <p className="text-sm font-semibold text-white">Mandatory standard</p>
          <ul className="space-y-2 text-slate-300">
            <li className="border-l-2 border-amber-400 pl-4">Live GPS stream from the driver</li>
            <li className="border-l-2 border-amber-400 pl-4">BOL uploaded at origin</li>
            <li className="border-l-2 border-amber-400 pl-4">POD uploaded at destination</li>
            <li className="border-l-2 border-amber-400 pl-4">24/7 unfiltered view</li>
            <li className="border-l-2 border-amber-400 pl-4">No check-calls</li>
          </ul>
          <p className="text-lg text-white font-semibold">You do not chase updates.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/track/shipper" className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-3 rounded-lg">
              Shipper Tracking
            </Link>
            <Link href="/quote" className="border border-slate-700 hover:border-amber-400 px-5 py-3 rounded-lg font-semibold">
              Request a shipper quote
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/quote" className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-3 rounded-lg">
            Request a shipper quote
          </Link>
          <Link href="/services" className="border border-slate-700 hover:border-amber-400 px-5 py-3 rounded-lg font-semibold">
            Read our services
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
