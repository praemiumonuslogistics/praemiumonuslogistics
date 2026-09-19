import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '../components/PageShell';

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
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Your freight should not go quiet.</h1>
          <p className="text-lg text-slate-400">
            Shippers come to us after missed pickups, opaque rates, and days without a useful update. We run the opposite process.
          </p>
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
