'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function PortalGate({
  destination,
  helper,
}: {
  destination: 'shipper' | 'receiver' | 'driver';
  helper: string;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const hash = code.trim();
    if (!hash) {
      setError('Enter a tracking code.');
      return;
    }
    setError('');
    router.push(`/track/${destination}/${encodeURIComponent(hash)}`);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-xs text-slate-400">{helper}</label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
          placeholder="Tracking code"
        />
        <button
          type="submit"
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm"
        >
          Open portal
        </button>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </form>
  );
}
