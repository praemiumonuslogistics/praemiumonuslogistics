import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '../components/PageShell';

export const metadata: Metadata = {
  title: 'FTL, LTL & Expedited Freight Services',
  description:
    'Full truckload, LTL, expedited, and dedicated lane programs from Praemium Onus Logistics in Las Vegas. Capacity matched to the move.',
};

const SERVICES = [
  {
    title: 'Full Truckload',
    body: 'When the freight fills a trailer, it should not share the ride. FTL gives you a dedicated unit, a sealed plan, and a single run from origin to destination.',
    bullets: [
      'Direct routing with fewer touches than LTL.',
      'Equipment matched to the commodity: van, flatbed, reefer, or specialized.',
      'A named contact from quote through proof of delivery.',
    ],
  },
  {
    title: 'LTL',
    body: 'When the freight does not fill a trailer, LTL keeps cost and cube in proportion. We place your freight with carriers who handle shared loads with care.',
    bullets: [
      'Right-sized capacity instead of paying for empty space.',
      'Clear pickup windows and destination expectations.',
      'Tracking and exception handling from our desk, not a black box.',
    ],
  },
  {
    title: 'Expedited',
    body: 'Some freight cannot wait for a standard transit. Expedited is for tight windows, production recoveries, and time-critical inventory. We plan the clock before we plan the pitch.',
    bullets: [
      'Transit built to the deadline you give us.',
      'Direct updates. No silence while the freight is in motion.',
      'Team or solo capacity selected for the window, not the other way around.',
    ],
  },
  {
    title: 'Dedicated / lane programs',
    body: 'Repeat freight deserves a repeatable system. Dedicated and lane programs lock in equipment, rhythm, and a desk that already knows your docks.',
    bullets: [
      'Standing capacity on the corridors you run.',
      'Fewer onboarding cycles for your warehouse and receiving teams.',
      'A single standard across weeks and seasons, not a new scramble each Monday.',
    ],
  },
];

export default function ServicesPage() {
  return (
    <PageShell>
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-16 space-y-12">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Services built around the freight.</h1>
          <p className="text-lg text-slate-400">
            We do not force your shipment into a product. We match equipment, transit, and communication to the move.
          </p>
          <p className="text-slate-300">
            Four ways to work with us. Same standard on each: top-tier carriers, a tailored plan, and a desk that stays on the details.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {SERVICES.map((service) => (
            <article key={service.title} className="border border-slate-800 bg-slate-900/50 rounded-2xl p-6 space-y-3">
              <h2 className="text-xl font-bold text-amber-400">{service.title}</h2>
              <p className="text-slate-300 text-sm leading-relaxed">{service.body}</p>
              <ul className="text-sm text-slate-400 space-y-2 list-disc pl-5">
                {service.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold">Tell us the lane. We will tell you the plan.</h2>
          <Link href="/quote" className="inline-block bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-3 rounded-lg">
            Request a quote
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
