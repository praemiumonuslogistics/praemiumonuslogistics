import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '../components/PageShell';

export const metadata: Metadata = {
  title: 'Carrier Partners | Praemium Onus',
  description:
    'Haul with Praemium Onus Logistics. Professional freight, fair communication, Texas and national lanes. Clear rates. Professional dispatch.',
};

export default function CarriersPage() {
  return (
    <PageShell>
      <section className="max-w-3xl mx-auto px-4 md:px-8 py-16 space-y-10">
        <div className="space-y-4">
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">Carrier partners</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Get loaded. Clear rates. Direct dispatch.</h1>
          <p className="text-lg text-slate-400">
            We work with carriers and owner-operators who want professional freight and adults on the phone. Browse AVAILABLE lanes, accept a load, and advance the field.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-3 rounded-lg">
              Register as a carrier
            </Link>
            <Link href="/login" className="border border-slate-700 hover:border-amber-400 px-5 py-3 rounded-lg font-semibold">
              Browse loads
            </Link>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed">
          Praemium Onus Logistics tenders freight we have scoped. You will not get a moving target at the dock because we skipped the questions. Texas lanes are part of the work. So is national coverage. We do not post rates we cannot stand behind.
        </p>

        <ul className="space-y-3 text-slate-300">
          <li>
            <strong className="text-white">Professional freight</strong> — Accurate weight, equipment, and accessorials before you commit. No surprise freight at the shipper.
          </li>
          <li>
            <strong className="text-white">Fair communication</strong> — A person who knows the load. Status that goes both ways. Problems handled, not forwarded into the void.
          </li>
          <li>
            <strong className="text-white">Texas and national lanes</strong> — We cover Texas runs and lanes across the country. Live freight is tendered directly.
          </li>
        </ul>

        <p className="text-sm text-slate-500">
          Pay terms are confirmed on setup. We do not publish terms we cannot verify on this page.
        </p>

        <div className="space-y-2">
          <h2 className="text-xl font-bold">Want the next conversation to be a real load.</h2>
          <p className="text-slate-400 text-sm">Register for the board, or use the quote form and select role: Carrier. Pay terms are confirmed on setup.</p>
          <Link href="/quote" className="inline-block border border-slate-700 hover:border-amber-400 px-5 py-3 rounded-lg font-semibold">
            Talk with dispatch
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
