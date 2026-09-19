'use client';

import { useState } from 'react';

export function TrackBox() {
  const [trackingHash, setTrackingHash] = useState('');

  return (
    <div className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
      <input
        type="text"
        placeholder="Enter Tracking Hash or PRO #"
        value={trackingHash}
        onChange={(e) => setTrackingHash(e.target.value)}
        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
      />
      <a
        href={`/track/shipper/${trackingHash}`}
        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center justify-center"
      >
        Track Load
      </a>
    </div>
  );
}
