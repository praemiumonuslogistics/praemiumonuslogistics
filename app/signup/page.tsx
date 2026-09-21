import type { Metadata } from 'next';
import { PageShell } from '../components/PageShell';
import { AuthPanel } from '../components/AuthPanel';

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Register as a shipper or carrier with Praemium Onus Logistics.',
};

export default function SignupPage() {
  return (
    <PageShell>
      <section className="max-w-md mx-auto px-4 py-16 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">Portal</p>
          <h1 className="text-3xl font-black">Create an account</h1>
          <p className="text-slate-400">
            Choose shipper or carrier. This is an independent Landstar agency, not a carrier fleet.
          </p>
        </div>
        <div className="border border-slate-800 rounded-2xl bg-slate-900/50 p-6">
          <AuthPanel mode="signup" />
        </div>
      </section>
    </PageShell>
  );
}
