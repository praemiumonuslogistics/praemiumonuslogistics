import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '../components/PageShell';
import { OPEN_DECK_DISCLAIMER } from '../lib/openDeck';

export const metadata: Metadata = {
  title: 'Open-Deck Carriers | Praemium Onus',
  description: 'Haul flatbed, stepdeck, Conestoga, and RGN freight with Praemium Onus Logistics. Landstar Agent GNV.',
};

export default function CarriersPage() {
  return (
    <PageShell>
      <section className="max-w-3xl mx-auto px-4 md:px-8 py-16 space-y-10">
        <div className="space-y-4">
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">Carrier partners</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Open-deck trucks. Direct dispatch.</h1>
          <p className="text-lg text-slate-400">{OPEN_DECK_DISCLAIMER}</p>
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
          We tender freight with dimensions, tarp size, and securement already on the file. You will not find a van load
          on this board. On signup we ask for deck length, ramp, tarp sizes, and strap/chain counts so the match is real.
        </p>
        <ul className="space-y-3 text-slate-300">
          <li>
            <strong className="text-white">Deck type</strong> — Flatbed, stepdeck, RGN, or Conestoga. Filter the board by
            what you actually run.
          </li>
          <li>
            <strong className="text-white">Tarps and iron</strong> — 4-ft, 8-ft, chains, straps. Stated before you accept.
          </li>
          <li>
            <strong className="text-white">Weight and permits</strong> — Over 8.5 ft width is flagged. No surprise oversize
            at the shipper.
          </li>
        </ul>
        <p className="text-sm text-slate-500">Pay terms are confirmed on setup. We do not publish terms we cannot verify.</p>
      </section>
    </PageShell>
  );
}
