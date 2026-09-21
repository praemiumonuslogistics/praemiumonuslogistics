import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '../components/PageShell';
import { OPEN_DECK_DISCLAIMER } from '../lib/openDeck';

export const metadata: Metadata = {
  title: 'Flatbed, Stepdeck & RGN Services',
  description:
    'Open-deck freight from Praemium Onus Logistics in Las Vegas: flatbed, stepdeck, Conestoga, and RGN heavy haul.',
};

const SERVICES = [
  {
    title: 'Standard Flatbed',
    body: '48 ft and 53 ft decks for steel, lumber, machinery, and building materials that ride in the open.',
    bullets: ['Exact piece dimensions before tender.', 'Tarp size stated, not assumed.', 'Named contact through POD.'],
  },
  {
    title: 'Stepdeck / Dropdeck',
    body: 'When legal height on a standard deck will not clear. 11 ft top deck, 37–42 ft bottom, measured against 13.6 ft.',
    bullets: ['Height math before the truck is assigned.', 'No dock surprise because we skipped the tape.', 'GPS from pickup to drop.'],
  },
  {
    title: 'RGN / Double Drop',
    body: 'Removable gooseneck and low-profile decks for oversize and heavy haul that will not sit on a stepdeck.',
    bullets: ['Permits flagged when width exceeds 8.5 ft.', 'Drive-on and crane access captured at quote.', 'Authority remains Landstar Ranger MC-166960.'],
  },
  {
    title: 'Conestoga / Curtainside',
    body: 'Weather-protected open deck when the freight needs a sliding tarp system instead of 4-ft or 8-ft tarps.',
    bullets: ['Same dimensional intake as untarped freight.', 'Securement still specified: chains, straps, edge guards.', 'Live highway GPS. No check-calls.'],
  },
];

export default function ServicesPage() {
  return (
    <PageShell>
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-16 space-y-12">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Open-deck services only.</h1>
          <p className="text-lg text-slate-400">{OPEN_DECK_DISCLAIMER}</p>
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
        <Link href="/quote" className="inline-block bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-3 rounded-lg">
          Request an open-deck quote
        </Link>
      </section>
    </PageShell>
  );
}
