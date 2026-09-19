import type { LoadRecord } from '../lib/supabaseBrowser';

export function ProofChips({ load }: { load: LoadRecord }) {
  const live = Boolean(load.current_lat && load.current_lng);
  const chips = [
    { on: live, label: live ? 'Live GPS' : 'Awaiting GPS' },
    { on: Boolean(load.bol_url), label: 'BOL on file' },
    { on: Boolean(load.pod_url), label: 'POD on file' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            chip.on
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}

export function LoadDocs({ load }: { load: LoadRecord }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <DocCard title="Origin BOL" url={load.bol_url} stamped={load.bol_uploaded_at} />
      <DocCard title="Destination POD" url={load.pod_url} stamped={load.pod_uploaded_at} />
    </div>
  );
}

function DocCard({
  title,
  url,
  stamped,
}: {
  title: string;
  url: string | null;
  stamped: string | null;
}) {
  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
        <p className="text-xs text-slate-500">
          {url ? 'On file' : 'Not uploaded'}
        </p>
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={title} className="w-full max-h-64 object-contain bg-slate-950" />
          {stamped ? (
            <p className="px-4 py-2 text-xs text-slate-500">{new Date(stamped).toLocaleString()}</p>
          ) : null}
        </a>
      ) : (
        <p className="px-4 py-8 text-sm text-slate-500 text-center">Awaiting scan</p>
      )}
    </div>
  );
}
