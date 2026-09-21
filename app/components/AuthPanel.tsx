'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '../lib/supabaseBrowser';
import { dashboardPath } from '../lib/useAuth';

const inputClass =
  'w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400';

export function AuthPanel({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const [role, setRole] = useState<'SHIPPER' | 'CARRIER'>('SHIPPER');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) {
      setError('Accounts are not configured.');
      return;
    }
    setLoading(true);
    setError('');
    setNotice('');

    if (mode === 'signup') {
      const { data, error: signError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            role,
            company_name: companyName.trim(),
            phone_number: phone.trim(),
          },
        },
      });
      setLoading(false);
      if (signError) {
        setError(signError.message);
        return;
      }
      if (!data.session) {
        setNotice('Check your email to confirm the account, then sign in.');
        return;
      }
      router.replace(dashboardPath(role));
      return;
    }

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (loginError) {
      setError(loginError.message);
      return;
    }
    const user = data.user;
    const metaRole = String(user?.user_metadata?.role || '');
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    router.replace(dashboardPath(profile?.role || metaRole));
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === 'signup' ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('SHIPPER')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold border ${
                role === 'SHIPPER' ? 'border-amber-400 bg-amber-400/10 text-amber-300' : 'border-slate-800 text-slate-400'
              }`}
            >
              Shipper
            </button>
            <button
              type="button"
              onClick={() => setRole('CARRIER')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold border ${
                role === 'CARRIER' ? 'border-amber-400 bg-amber-400/10 text-amber-300' : 'border-slate-800 text-slate-400'
              }`}
            >
              Carrier
            </button>
          </div>
          <input
            className={inputClass}
            required
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </>
      ) : null}
      <input
        className={inputClass}
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <input
        className={inputClass}
        type="password"
        required
        minLength={8}
        placeholder="Password (8+ characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
      />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {notice ? <p className="text-sm text-emerald-400">{notice}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 font-bold py-3 rounded-lg"
      >
        {loading ? 'Working…' : mode === 'signup' ? 'Create account' : 'Sign in'}
      </button>
      <p className="text-sm text-slate-400">
        {mode === 'signup' ? (
          <>
            Already registered?{' '}
            <Link href="/login" className="text-amber-400">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to Praemium Onus?{' '}
            <Link href="/signup" className="text-amber-400">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
