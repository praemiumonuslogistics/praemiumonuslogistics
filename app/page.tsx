import Link from 'next/link';
import { PageShell } from './components/PageShell';
import { QuoteForm } from './components/QuoteForm';
import { TrackBox } from './components/TrackBox';

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Praemium Onus Logistics',
    '@id': 'https://praemiumonuslogistics.vercel.app',
    url: 'https://praemiumonuslogistics.vercel.app',
    telephone: '+1-702-744-6957',
    email: 'praemiumonuslogistics@gmail.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Las Vegas',
      addressRegion: 'NV',
      addressCountry: 'US',
    },
    description:
      'Las Vegas freight brokerage. Landstar Agent GNV. FTL, LTL, and expedited freight with named-contact dispatch.',
  };

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-4 md:px-8 py-12 md:py-20 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full">
            <span>Landstar Agent GNV · Las Vegas</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Freight moved with care.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              Duty included.
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed">
            Praemium Onus Logistics is a Las Vegas brokerage. We give shippers access to top-tier carriers and treat
            every load as a responsibility, not a transaction.
          </p>
          <p className="text-slate-300">Full truckload. LTL. Expedited. Dedicated lanes. One team that dots every i and crosses every t.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/quote" className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-3 rounded-lg">
              Request a quote
            </Link>
            <Link href="/services" className="border border-slate-700 hover:border-amber-400 px-5 py-3 rounded-lg font-semibold">
              See services
            </Link>
          </div>
        </div>

        <div id="quote" className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-2">Request a freight quote</h2>
          <p className="text-xs text-slate-400 mb-6">Send origin, destination, and equipment. We reply with a plan.</p>
          <QuoteForm variant="compact" />
        </div>
      </section>

      <section className="px-4 md:px-8 py-16 border-t border-slate-800">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-black">Why shippers stay.</h2>
            <p className="text-slate-400 mt-2">Three promises. We keep all three.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <article className="border border-slate-800 rounded-2xl p-6 space-y-2">
              <h3 className="font-bold text-amber-400">Top-tier carriers</h3>
              <p className="text-sm text-slate-400">We match the equipment, the lane, and the standard. We do not spray the load board and hope.</p>
            </article>
            <article className="border border-slate-800 rounded-2xl p-6 space-y-2">
              <h3 className="font-bold text-amber-400">Customized solutions</h3>
              <p className="text-sm text-slate-400">Weight, window, commodity, and site constraints decide the plan. We build the move around your freight.</p>
            </article>
            <article className="border border-slate-800 rounded-2xl p-6 space-y-2">
              <h3 className="font-bold text-amber-400">Customer-centric service</h3>
              <p className="text-sm text-slate-400">You get a named contact. Updates without chasing. The details are our onus.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-8 py-16 border-t border-slate-800 bg-slate-900/40">
        <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-2xl font-black">For shippers</h2>
            <p className="text-slate-400">Need freight that shows up. Missed pickups and silent dispatch are not a strategy.</p>
            <Link href="/shippers" className="text-amber-400 font-semibold hover:text-amber-300">
              Ship with us →
            </Link>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black">For carriers</h2>
            <p className="text-slate-400">Need clean freight and clear dispatch. Professional loads. Direct communication. Rates stated plainly.</p>
            <Link href="/carriers" className="text-amber-400 font-semibold hover:text-amber-300">
              Haul with us →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 border-y border-slate-800 py-10 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-xl font-bold">Already shipping with us?</h2>
          <p className="text-sm text-slate-400">Enter your tracking code for live GPS telemetry.</p>
          <TrackBox />
        </div>
      </section>
    </PageShell>
  );
}
