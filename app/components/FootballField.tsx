'use client';

import { useEffect, useState } from 'react';
import { inferYardLine, milestoneForYards, MILESTONES } from '../lib/yardLine';

type LoadLike = {
  yard_line?: number | null;
  status?: string | null;
  pickup_confirmed_at?: string | null;
  delivered_at?: string | null;
};

export function FootballField({
  load,
  yards,
  demo = false,
  compact = false,
}: {
  load?: LoadLike;
  yards?: number;
  demo?: boolean;
  compact?: boolean;
}) {
  const inferred = load ? inferYardLine(load) : yards ?? 0;
  const [line, setLine] = useState(inferred);

  useEffect(() => {
    if (!demo) {
      setLine(inferred);
      return;
    }
    setLine(0);
    const timer = window.setInterval(() => {
      setLine((prev) => (prev >= 100 ? 0 : prev + 5));
    }, 400);
    return () => window.clearInterval(timer);
  }, [demo, inferred]);

  const marker = Math.max(2, Math.min(98, line));
  const milestone = milestoneForYards(line);

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-amber-400/80">
        <span>Origin</span>
        <span className="text-slate-400 tracking-widest normal-case">
          {milestone.label} · {line} yd
        </span>
        <span>Destination</span>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-emerald-900/80 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 shadow-inner">
        <svg viewBox="0 0 1000 220" className="w-full h-auto block" role="img" aria-label={`Shipment at the ${line} yard line`}>
          <rect x="0" y="0" width="80" height="220" fill="#052e16" />
          <rect x="920" y="0" width="80" height="220" fill="#052e16" />
          <rect x="80" y="0" width="840" height="220" fill="#14532d" />
          {[...Array(11)].map((_, i) => {
            const x = 80 + i * 84;
            return (
              <g key={i}>
                <line x1={x} y1="0" x2={x} y2="220" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                {i > 0 && i < 10 ? (
                  <text x={x} y="28" fill="rgba(255,255,255,0.7)" fontSize="14" textAnchor="middle" fontFamily="ui-sans-serif">
                    {i <= 5 ? i * 10 : (10 - i) * 10}
                  </text>
                ) : null}
              </g>
            );
          })}
          <text x="40" y="118" fill="#fbbf24" fontSize="11" textAnchor="middle" transform="rotate(-90 40 118)" fontFamily="ui-sans-serif">
            ORIGIN
          </text>
          <text x="960" y="118" fill="#fbbf24" fontSize="11" textAnchor="middle" transform="rotate(90 960 118)" fontFamily="ui-sans-serif">
            DEST
          </text>
          <circle cx={80 + (marker / 100) * 840} cy="118" r="16" fill="#fbbf24" />
          <circle cx={80 + (marker / 100) * 840} cy="118" r="7" fill="#0f172a" />
        </svg>
      </div>
      {!compact ? (
        <ol className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-slate-400">
          {MILESTONES.map((m) => (
            <li
              key={m.yards}
              className={`rounded-lg border px-2 py-2 ${
                line >= m.yards ? 'border-amber-400/50 text-amber-200' : 'border-slate-800'
              }`}
            >
              <div className="font-semibold text-slate-200">{m.yards} yd</div>
              <div>{m.label}</div>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
