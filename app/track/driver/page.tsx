import type { Metadata } from 'next';
import { PageShell } from '../../components/PageShell';
import { PortalGate } from '../../components/PortalGate';

export const metadata: Metadata = {
  title: 'Driver App / Document Scanner',
  description: 'Live GPS plus instant BOL and POD scans for Praemium Onus dispatched loads.',
};

export default function DriverGatewayPage() {
  return (
    <PageShell>
      <section className="max-w-xl mx-auto px-4 md:px-8 py-16 space-y-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">Mandatory standard</p>
        <h1 className="text-4xl font-black tracking-tight">Driver App / Document Scanner</h1>
        <p className="text-slate-400">
          Start live GPS. Photograph and upload BOL at pickup and POD at delivery. Instant. Mandatory.
          No pride, no delay.
        </p>
        <PortalGate
          destination="driver"
          helper="Enter your load tracking code to open the scanner."
        />
      </section>
    </PageShell>
  );
}
