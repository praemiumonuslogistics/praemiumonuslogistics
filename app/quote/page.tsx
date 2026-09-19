import type { Metadata } from 'next';
import { PageShell } from '../components/PageShell';
import { QuoteForm } from '../components/QuoteForm';

export const metadata: Metadata = {
  title: 'Request a Freight Quote | Praemium Onus',
  description:
    'Request a freight quote from Praemium Onus Logistics. Name, company, lane, equipment, and pickup date. We reply with a clear plan.',
};

export default function QuotePage() {
  return (
    <PageShell>
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-16 grid gap-12 lg:grid-cols-2 items-start">
        <div className="space-y-5">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Request a quote.</h1>
          <p className="text-lg text-slate-400">
            Tell us the freight. We will tell you how we would move it.
          </p>
          <p className="text-slate-300">
            Phone:{' '}
            <a href="tel:+17027446957" className="text-amber-400">
              (702) 744-6957
            </a>
            . Email:{' '}
            <a href="mailto:praemiumonuslogistics@gmail.com" className="text-amber-400">
              praemiumonuslogistics@gmail.com
            </a>
            . Landstar Agent GNV · Las Vegas, Nevada.
          </p>
          <p className="text-sm text-slate-500">
            Required fields keep the quote honest. If a field does not apply, say so in notes.
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl">
          <QuoteForm variant="full" />
        </div>
      </section>
    </PageShell>
  );
}
