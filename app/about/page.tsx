import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '../components/PageShell';

export const metadata: Metadata = {
  title: 'About Praemium Onus | Las Vegas Freight',
  description:
    'Praemium Onus Logistics is a Las Vegas freight brokerage. Landstar Agent GNV. The name means premium service and personal duty.',
};

export default function AboutPage() {
  return (
    <PageShell>
      <section className="max-w-3xl mx-auto px-4 md:px-8 py-16 space-y-10">
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Landstar Agent GNV</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">The name is the standard.</h1>
          <p className="text-lg text-slate-400">
            Praemium: premium, reward. Onus: duty, responsibility. We took both as the job.
          </p>
        </div>

        <div className="space-y-4 text-slate-300 leading-relaxed">
          <h2 className="text-white text-xl font-bold">Why Praemium Onus.</h2>
          <p>
            Freight is not only miles. It is a promise to a dock, a driver, and a customer waiting on the other end.
            We named the company after that duty. Premium service is the reward we owe you. The onus sits with us.
          </p>
        </div>

        <div className="space-y-4 text-slate-300 leading-relaxed">
          <h2 className="text-white text-xl font-bold">Las Vegas headquarters.</h2>
          <p>
            Praemium Onus Logistics is based in Las Vegas, Nevada. From here we cover regional and national lanes as
            Landstar Agent GNV. The work is relationship-first: fewer accounts, more attention, no load left unexplained.
          </p>
        </div>

        <div className="space-y-4 text-slate-300 leading-relaxed">
          <h2 className="text-white text-xl font-bold">Operating authority.</h2>
          <p>
            Darrell L. Garner of Praemium Onus Logistics is an agent with Landstar Ranger, Inc. Freight moves under
            Ranger authority: MC-166960 · USDOT 241572. Landstar Ranger, Inc., 13410 Sutton Park Dr S, Jacksonville, FL
            32224.
          </p>
        </div>

        <div className="space-y-4 text-slate-300 leading-relaxed">
          <h2 className="text-white text-xl font-bold">How we work.</h2>
          <p>
            We believe logistics is relationship work. Shippers get access to top-tier carriers. Every shipment is
            tailored. Customer-centric is not a slogan here. It is the refusal to miss a detail.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-4">
          <Link href="/quote" className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-3 rounded-lg">
            Request a quote
          </Link>
          <Link href="/carriers" className="border border-slate-700 hover:border-amber-400 px-5 py-3 rounded-lg font-semibold">
            Work as a carrier
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
