import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '../components/PageShell';
import { ShipperLanding } from '../components/ShipperLanding';

export const metadata: Metadata = {
  title: 'Freight for Shippers | Praemium Onus',
  description:
    'Real-time GPS freight tracking for Praemium Onus shippers. Live maps, BOL/POD on file, named-contact dispatch from Las Vegas.',
};

export default function ShippersPage() {
  return (
    <PageShell>
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16 space-y-12">
        <ShipperLanding />

        <div className="space-y-4 max-w-3xl">
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

        <div className="space-y-5 border border-slate-800 rounded-2xl bg-slate-900/50 p-6 md:p-8 max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">Named duty. Proof on file.</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">Zero Pride, Pure Proof</h2>
          <p className="text-slate-300">
            Pride is the check-call. Proof is the GPS stream. Praemium Onus Logistics, an independent Landstar freight
            agent in Las Vegas, holds every driver to one standard: location and documents in the open.
          </p>
          <p className="text-slate-400">
            You do not wait on a dispatcher to get an update. Agent Darrell L. Garner’s duty is to put the load in
            front of you—unfiltered, around the clock. Authority belongs to Landstar Ranger, Inc., Jacksonville, FL,
            MC-166960 · USDOT 241572. This agency does not own that office or that MC.
          </p>
          <ul className="space-y-2 text-slate-300">
            <li className="border-l-2 border-amber-400 pl-4">Live GPS stream from the driver</li>
            <li className="border-l-2 border-amber-400 pl-4">BOL uploaded at origin</li>
            <li className="border-l-2 border-amber-400 pl-4">POD uploaded at destination</li>
            <li className="border-l-2 border-amber-400 pl-4">24/7 unfiltered view</li>
            <li className="border-l-2 border-amber-400 pl-4">No check-calls</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/quote" className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-3 rounded-lg">
            Request a shipper quote
          </Link>
          <Link href="/signup" className="border border-slate-700 hover:border-amber-400 px-5 py-3 rounded-lg font-semibold">
            Create shipper account
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
