import type { Metadata } from 'next';
import { PageShell } from '../../components/PageShell';
import { PortalGate } from '../../components/PortalGate';

export const metadata: Metadata = {
  title: 'Shipper Tracking',
  description: 'Live GPS, BOL, and POD for your Praemium Onus load. 24/7. Unfiltered.',
};

export default function ShipperGatewayPage() {
  return (
    <PageShell>
      <section className="max-w-xl mx-auto px-4 md:px-8 py-16 space-y-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">24/7 unfiltered tracking</p>
        <h1 className="text-4xl font-black tracking-tight">Shipper Tracking</h1>
        <p className="text-slate-400">Live GPS, BOL, and POD for your load. 24/7. Unfiltered.</p>
        <PortalGate
          destination="shipper"
          helper="Enter the tracking code from your rate confirmation or dispatch note."
        />
      </section>
    </PageShell>
  );
}
