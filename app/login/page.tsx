import type { Metadata } from 'next';
import { PageShell } from '../components/PageShell';
import { AuthPanel } from '../components/AuthPanel';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Shipper and carrier portal sign in for Praemium Onus Logistics.',
};

export default function LoginPage() {
  return (
    <PageShell>
      <section className="max-w-md mx-auto px-4 py-16 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">Portal</p>
          <h1 className="text-3xl font-black">Sign in</h1>
          <p className="text-slate-400">Shippers post and track. Carriers take AVAILABLE freight.</p>
        </div>
        <div className="border border-slate-800 rounded-2xl bg-slate-900/50 p-6">
          <AuthPanel mode="login" />
        </div>
      </section>
    </PageShell>
  );
}
