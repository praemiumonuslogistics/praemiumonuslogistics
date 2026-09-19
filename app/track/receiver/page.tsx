import type { Metadata } from 'next';
import { PageShell } from '../../components/PageShell';
import { PortalGate } from '../../components/PortalGate';

export const metadata: Metadata = {
  title: 'Receiver Portal',
  description: 'Dock-ready ETA, live location, and POD for inbound Praemium Onus freight.',
};

export default function ReceiverGatewayPage() {
  return (
    <PageShell>
      <section className="max-w-xl mx-auto px-4 md:px-8 py-16 space-y-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">Zero-pride transparency</p>
        <h1 className="text-4xl font-black tracking-tight">Receiver Portal</h1>
        <p className="text-slate-400">
          Dock-ready ETA, live location, and POD when uploaded. You do not call the shipper for
          “where’s my freight.”
        </p>
        <PortalGate
          destination="receiver"
          helper="Enter the tracking code sent with your inbound freight."
        />
      </section>
    </PageShell>
  );
}
