'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function TrackBox() {
  const [trackingHash, setTrackingHash] = useState('');
  const router = useRouter();

  function go(e: React.FormEvent) {
    e.preventDefault();
    const hash = trackingHash.trim();
    if (!hash) return;
    router.push(`/track/shipper/${encodeURIComponent(hash)}`);
  }

  return (
    <form onSubmit={go} className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
      <input
        type="text"
        placeholder="Enter Tracking Hash or PRO #"
        value={trackingHash}
        onChange={(e) => setTrackingHash(e.target.value)}
        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
      />
      <button
        type="submit"
        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold px-6 py-3 rounded-xl text-sm"
      >
        Track Load
      </button>
    </form>
  );
}
